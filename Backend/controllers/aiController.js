require("dotenv").config();
const Groq = require("groq-sdk");
const db   = require("../config/db");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- CONFIGURACIÓN ---
const DAILY_LIMIT      = 5;   // Máximo rutinas Pro por día
const CHAR_LIMIT       = 120; // Máximo caracteres en input personalizado
const SCAN_DAILY_LIMIT = 3;   // Máximo escaneos corporales por día

// ============================================
// HELPER — Extraer contexto limpio del onboarding
// El onboarding envía strings como:
//   "El usuario quiere entrenar Lunes, Viernes. Genera exactamente 2 sesión(es)..."
// ============================================
function parseSessionContext(extraContext, objetivo) {
  if (!extraContext) return { diaLabel: null, objetivoLimpio: objetivo };

  const sesionMatch    = objetivo.match(/\(sesi[oó]n ([^)]+)\)/i);
  const diaLabel       = sesionMatch ? sesionMatch[1].trim() : null;
  const objetivoLimpio = objetivo.replace(/\s*\(sesi[oó]n [^)]+\)/i, "").trim();

  return { diaLabel, objetivoLimpio };
}

// ============================================
// HELPER — Normalizar respuesta JSON de Groq
// Groq puede usar nombres de campo distintos o anidar ejercicios
// ============================================
function normalizeGroqResponse(raw) {
  const nombreRutina = (
    raw.nombre_rutina ||
    raw.nombre        ||
    raw.title         ||
    raw.session_name  ||
    ""
  ).trim();

  const descripcionRutina = (
    raw.descripcion        ||
    raw.description        ||
    raw.descripcion_sesion ||
    ""
  ).trim();

  const ejerciciosRaw =
    Array.isArray(raw.ejercicios)                  ? raw.ejercicios :
    Array.isArray(raw.exercises)                   ? raw.exercises  :
    Array.isArray(raw.sesion?.ejercicios)           ? raw.sesion.ejercicios :
    Array.isArray(raw.sesiones?.[0]?.ejercicios)   ? raw.sesiones[0].ejercicios :
    [];

  const ejercicios = ejerciciosRaw
    .filter(ej => ej && typeof ej === "object")
    .map((ej, idx) => ({
      nombre:            String(ej.nombre || ej.name || ej.exercise_name || ej.ejercicio || "").trim(),
      grupo_muscular:    String(ej.grupo_muscular || ej.muscle_group || ej.grupo || ej.musculo || "General").trim(),
      series:            Number.isFinite(Number(ej.series || ej.sets))                                   ? Number(ej.series || ej.sets) : 3,
      reps:              String(ej.reps || ej.repeticiones || ej.repetitions || "10-12").trim(),
      descanso_segundos: Number.isFinite(Number(ej.descanso_segundos || ej.rest_seconds || ej.descanso)) ? Number(ej.descanso_segundos || ej.rest_seconds || ej.descanso) : 90,
      orden:             idx + 1,
    }))
    .filter(ej => ej.nombre.length > 0);

  return { nombreRutina, descripcionRutina, ejercicios };
}

// ============================================
// GENERATE ROUTINE — Generación de rutina con IA (Groq / LLaMA 3.3)
// ============================================
exports.generateRoutine = async (req, res) => {
  const { objetivo, nivel, enfoque, musculos_custom, equipo } = req.body;
  const userId       = req.user.id;
  const extraContext = req.body.extra_context || "";

  let usageCount = 0;

  // ─── 1. CONTROL DE LÍMITE DIARIO ─────────────────────────────────────────
  try {
    const [usage] = await db.query(
      `SELECT COUNT(*) as count FROM ai_logs WHERE usuario_id = ? AND DATE(created_at) = CURDATE()`,
      [userId]
    );
    usageCount = usage?.[0]?.count || 0;

    if (usageCount >= DAILY_LIMIT) {
      return res.status(429).json({
        error:   "LIMIT_REACHED",
        message: `Has alcanzado tu límite diario de ${DAILY_LIMIT} rutinas. Vuelve mañana.`,
      });
    }
  } catch (err) {
    console.warn("⚠️ No se pudo verificar límite diario:", err.message);
  }

  // ─── 2. VALIDACIÓN Y SEGURIDAD ───────────────────────────────────────────
  if (!objetivo || !nivel || !enfoque) {
    return res.status(400).json({ error: "Faltan datos obligatorios." });
  }

  if (enfoque === "Personalizado" && musculos_custom && musculos_custom.length > CHAR_LIMIT) {
    return res.status(400).json({ error: `El texto es demasiado largo (Máx ${CHAR_LIMIT} caracteres).` });
  }

  const forbiddenTerms = ["matar","muerte","droga","sexo","hackear","política","odio","suicidio","bomba","arma"];
  if (enfoque === "Personalizado" && musculos_custom) {
    if (forbiddenTerms.some(t => musculos_custom.toLowerCase().includes(t))) {
      return res.status(400).json({ error: "SAFETY_BLOCK", message: "Tu solicitud contiene términos no permitidos." });
    }
  }

  // ─── 3. PREPARAR CONTEXTO ────────────────────────────────────────────────
  const focoReal                     = enfoque === "Personalizado" ? musculos_custom : enfoque;
  const { diaLabel, objetivoLimpio } = parseSessionContext(extraContext, objetivo);
  const seed                         = Math.random().toString(36).slice(2, 8).toUpperCase();

  res.setTimeout(60000);

  try {
    console.log(`🤖 Generando Rutina IA (${usageCount + 1}/${DAILY_LIMIT}) | Usuario: ${userId} | Foco: ${focoReal} | Seed: ${seed}`);

    // ─── 4. PROMPT ────────────────────────────────────────────────────────
    const prompt = `
Eres un Entrenador Personal de Élite certificado por la NSCA, especialista en periodización y biomecánica, creando planes para la app de fitness Oxyra.

━━━ PARÁMETROS DE LA SESIÓN ━━━
• Grupos musculares / Enfoque: ${focoReal}
• Objetivo del usuario: ${objetivoLimpio}
• Nivel de experiencia: ${nivel}
• Equipamiento disponible: ${equipo}
${diaLabel ? `• Esta es la sesión del día: ${diaLabel}` : ""}
• ID único de esta generación (usa esto para asegurar variedad): ${seed}

━━━ REGLAS DE DISEÑO (OBLIGATORIAS) ━━━
1. Genera entre 6 y 9 ejercicios. Prioriza calidad sobre cantidad.
2. Orden lógico: ejercicios compuestos primero → aislamiento al final.
3. Si el objetivo incluye "perder grasa" o "quemar", añade ejercicios metabólicos o HIIT al final.
4. Si el objetivo es "fuerza", baja las reps (3-6) y sube el descanso (120-180s).
5. Si el objetivo es "resistencia", sube las reps (15-20) y baja el descanso (30-60s).
6. Adapta el equipamiento: si es "Peso Corporal", SOLO ejercicios sin máquinas ni pesas.
7. NUNCA repitas el mismo ejercicio. Usa variantes si el músculo aparece varias veces.
8. Los nombres de ejercicios deben estar en ESPAÑOL estándar (ej: "Press Banca", "Peso Muerto Rumano", "Curl de Bíceps con Mancuerna").

━━━ REGLA CRÍTICA PARA EL NOMBRE ━━━
El campo "nombre_rutina" es MUY IMPORTANTE. Debe ser:
- Corto (2-4 palabras máximo)
- Impactante y creativo, que refleje el músculo Y el objetivo
- En español
- SIN usar la palabra "Rutina" ni "Sesión" ni "Plan"
- Ejemplos buenos: "Pectoral de Acero", "Espalda al Fuego", "Pierna Explosiva", "Quema Total", "Fuerza Máxima", "Bomba de Bíceps"
${diaLabel ? `- Como es la sesión del ${diaLabel}, puedes incluirlo: ej "Espalda ${diaLabel}"` : ""}

━━━ FORMATO DE RESPUESTA (JSON ESTRICTO) ━━━
Devuelve ÚNICAMENTE este objeto JSON, sin texto adicional, sin markdown:
{
  "nombre_rutina": "Nombre Creativo Corto",
  "descripcion": "Explicación estratégica breve de por qué esta sesión funciona para el objetivo (máx 25 palabras)",
  "ejercicios": [
    {
      "nombre": "Nombre del Ejercicio en Español",
      "grupo_muscular": "Músculo Principal",
      "series": 4,
      "reps": "8-10",
      "descanso_segundos": 90
    }
  ]
}
`.trim();

    // ─── 5. LLAMADA A GROQ ────────────────────────────────────────────────
    const completion = await groq.chat.completions.create({
      model:           "llama-3.3-70b-versatile",
      messages:        [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature:     0.85,
      max_tokens:      1500,
    });

    const rawText   = completion.choices[0].message.content;
    const cleanText = rawText.replace(/```json|```/g, "").trim();

    let rutinaJSON;
    try {
      rutinaJSON = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("❌ Error parseando JSON de IA:", cleanText.slice(0, 300));
      return res.status(500).json({ error: "La IA generó una respuesta inválida. Intenta de nuevo." });
    }

    // ─── 6. NORMALIZAR ────────────────────────────────────────────────────
    const { nombreRutina: nombreRaw, descripcionRutina, ejercicios } = normalizeGroqResponse(rutinaJSON);

    const nombreRutina = nombreRaw ||
      (diaLabel ? `${focoReal} ${diaLabel}` : focoReal) ||
      `Plan IA ${new Date().toISOString().slice(0, 10)}`;

    if (!ejercicios.length) {
      console.error("❌ Groq devolvió 0 ejercicios. Raw:", cleanText.slice(0, 500));
      return res.status(422).json({ error: "La IA no devolvió ejercicios válidos. Intenta de nuevo." });
    }

    console.log(`✅ Groq generó "${nombreRutina}" con ${ejercicios.length} ejercicios`);

    // ─── 7. GUARDADO EN BASE DE DATOS ─────────────────────────────────────
    const [rutinaResult] = await db.query(
      `INSERT INTO rutinas (usuario_id, nombre, objetivo, nivel_dificultad, creada_por_ia, descripcion)
       VALUES (?, ?, ?, ?, 1, ?)`,
      [userId, nombreRutina, objetivoLimpio, nivel, descripcionRutina]
    );
    const idRutina = rutinaResult.insertId;

    for (const ej of ejercicios) {
      let idEjercicio;
      const [ejExistente] = await db.query(
        "SELECT idEjercicio FROM ejercicios WHERE nombre = ? LIMIT 1",
        [ej.nombre]
      );

      if (ejExistente.length > 0) {
        idEjercicio = ejExistente[0].idEjercicio;
      } else {
        const [nuevoEj] = await db.query(
          "INSERT INTO ejercicios (nombre, grupo_muscular) VALUES (?, ?)",
          [ej.nombre, ej.grupo_muscular || "General"]
        );
        idEjercicio = nuevoEj.insertId;
      }

      await db.query(
        `INSERT INTO rutina_detalles (rutina_id, ejercicio_id, orden, series_objetivo, reps_objetivo, descanso_segundos)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [idRutina, idEjercicio, ej.orden, ej.series, ej.reps, ej.descanso_segundos]
      );
    }

    // ─── 8. LOG DE USO ────────────────────────────────────────────────────
    try {
      await db.query("INSERT INTO ai_logs (usuario_id) VALUES (?)", [userId]);
    } catch (e) { /* Silencioso */ }

    // ─── 9. RESPUESTA AL FRONTEND ─────────────────────────────────────────
    res.json({
      success: true,
      message: "Rutina generada",
      rutina: {
        idRutina,
        usuario_id:    userId,
        nombre:        nombreRutina,
        nombre_rutina: nombreRutina,
        objetivo:      objetivoLimpio,
        nivel,
        descripcion:   descripcionRutina,
        creada_por_ia: 1,
        ejercicios,
      },
    });

  } catch (err) {
    console.error("❌ ERROR CRÍTICO IA:", err);
    res.status(500).json({ error: "Error interno del sistema IA.", details: err.message });
  }
};

// ============================================
// ANALYZE PHYSIQUE — Escaneo de Físico con IA (Groq Vision / LLaMA 4 Scout)
// ============================================
const PHYSIQUE_SYSTEM_PROMPT = `Eres un Juez Profesional de la IFBB con ojo clínico para la estética, el volumen y la definición muscular. Analiza el físico del atleta en las imágenes proporcionadas (frente y espalda).

LÓGICA DE EVALUACIÓN (sé justo, técnico y GENEROSO con físicos avanzados):
1. Si ves un físico con desarrollo muscular claro, simetría, separación, densidad o nivel competitivo, DEBES usar rangos altos.
2. No penalices por iluminación, pose, ángulo, bombeo o sombras si el desarrollo muscular es evidente.
3. "Platino" y "Esmeralda" son para atletas avanzados con buena musculatura visible.
4. "Diamante" y "Campeon" son para físicos de nivel competición, con gran volumen, cortes y presencia muscular.
5. "Oxyra" solo para nivel élite/pro extraordinario, estilo IFBB Pro/escenario excepcional.
6. Si el físico general es claramente trabajado, evita rangos bajos como "Hierro", "Bronce" o "Plata" salvo que sea una zona realmente débil.

Escala de Rangos (de menor a mayor):
[Hierro, Bronce, Plata, Oro, Platino, Esmeralda, Diamante, Campeon, Oxyra]

Criterios de Referencia:
- Hierro/Bronce: Principiante, poca masa muscular, base aeróbica.
- Plata/Oro: Nivel intermedio, formas visibles, se nota que entrena.
- Platino/Esmeralda: Atleta avanzado, buena musculatura, abdominales definidos, hombros redondos.
- Diamante/Campeon: Nivel competición, gran volumen, cortes profundos, venas visibles.
- Oxyra: Nivel Élite/Pro. Desarrollo masivo y definición extrema.

Reglas de calibración:
- Si el físico parece de culturista, fitness avanzado, classic physique, mens physique avanzado o atleta de alto nivel, evita rangos por debajo de "Oro".
- Si el físico parece de competición o muy desarrollado, evita rangos por debajo de "Platino".
- Si el físico parece de nivel élite/pro, evita rangos por debajo de "Diamante" en la mayoría de grupos.
- Sé coherente: no pongas un grupo principal en un rango muy bajo si el resto del físico es claramente avanzado.

Grupos a evaluar: Pecho, Espalda, Hombro, Bíceps, Tríceps, Cuadriceps, Abdomen, Femoral, Glúteo, Gemelo.

Devuelve ÚNICAMENTE este objeto JSON, sin texto adicional, sin markdown:
{
  "analisis_general": "Resumen técnico de 2 frases enfatizando puntos fuertes y mejoras.",
  "musculos": [
    { "grupo": "Pecho",      "rango": "..." },
    { "grupo": "Espalda",    "rango": "..." },
    { "grupo": "Hombro",     "rango": "..." },
    { "grupo": "Bíceps",     "rango": "..." },
    { "grupo": "Tríceps",    "rango": "..." },
    { "grupo": "Cuadriceps", "rango": "..." },
    { "grupo": "Abdomen",    "rango": "..." },
    { "grupo": "Femoral",    "rango": "..." },
    { "grupo": "Glúteo",     "rango": "..." },
    { "grupo": "Gemelo",     "rango": "..." }
  ]
}`;

// Orden oficial de rangos
const RANK_ORDER = [
  "Hierro",
  "Bronce",
  "Plata",
  "Oro",
  "Platino",
  "Esmeralda",
  "Diamante",
  "Campeon",
  "Oxyra",
];

function normalizeRank(rank) {
  if (!rank) return null;
  const clean = String(rank).trim();

  const directMap = {
    hierro: "Hierro",
    bronce: "Bronce",
    plata: "Plata",
    oro: "Oro",
    platino: "Platino",
    esmeralda: "Esmeralda",
    diamante: "Diamante",
    campeon: "Campeon",
    campeón: "Campeon",
    oxyra: "Oxyra",
  };

  const key = clean.toLowerCase();
  return directMap[key] || clean;
}

function rankIndex(rank) {
  const normalized = normalizeRank(rank);
  const idx = RANK_ORDER.indexOf(normalized);
  return idx === -1 ? -1 : idx;
}

function rankAtLeast(currentRank, minRank) {
  const currentIdx = rankIndex(currentRank);
  const minIdx = rankIndex(minRank);

  if (minIdx === -1) return normalizeRank(currentRank) || currentRank;
  if (currentIdx === -1) return minRank;
  return currentIdx < minIdx ? minRank : normalizeRank(currentRank);
}

function nextRank(rank) {
  const idx = rankIndex(rank);
  if (idx === -1) return rank;
  return RANK_ORDER[Math.min(idx + 1, RANK_ORDER.length - 1)];
}

function inferMinimumRankFromGeneralText(text) {
  const t = String(text || "").toLowerCase();

  if (
    t.includes("oxyra") ||
    t.includes("ifbb pro") ||
    t.includes("élite") ||
    t.includes("elite") ||
    t.includes("nivel pro") ||
    t.includes("pro") && (t.includes("masivo") || t.includes("extrema") || t.includes("estriaciones"))
  ) {
    return "Campeon";
  }

  if (
    t.includes("competición") ||
    t.includes("competicion") ||
    t.includes("culturista") ||
    t.includes("classic physique") ||
    t.includes("mens physique") ||
    t.includes("gran volumen") ||
    t.includes("definición extrema") ||
    t.includes("definicion extrema") ||
    t.includes("cortes profundos") ||
    t.includes("venas visibles")
  ) {
    return "Diamante";
  }

  if (
    t.includes("avanzado") ||
    t.includes("trabajado") ||
    t.includes("musculatura visible") ||
    t.includes("buena musculatura") ||
    t.includes("separación") ||
    t.includes("separacion") ||
    t.includes("hombros redondos") ||
    t.includes("abdominales definidos")
  ) {
    return "Platino";
  }

  if (
    t.includes("intermedio") ||
    t.includes("se nota que entrena") ||
    t.includes("formas visibles")
  ) {
    return "Oro";
  }

  return null;
}

function calibratePhysiqueAnalysis(analysisJSON) {
  if (!analysisJSON || !Array.isArray(analysisJSON.musculos)) return analysisJSON;

  const generalText = (analysisJSON.analisis_general || "").toLowerCase();

  // Detectores de nivel físico (mucho más agresivos)
  const isElite =
    generalText.includes("ifbb") ||
    generalText.includes("pro") ||
    generalText.includes("élite") ||
    generalText.includes("elite") ||
    generalText.includes("extrema") ||
    generalText.includes("estriaciones");

  const isCompetition =
    generalText.includes("competición") ||
    generalText.includes("competicion") ||
    generalText.includes("culturista") ||
    generalText.includes("gran volumen") ||
    generalText.includes("cortes") ||
    generalText.includes("venas");

  const isAdvanced =
    generalText.includes("avanzado") ||
    generalText.includes("musculatura") ||
    generalText.includes("definido") ||
    generalText.includes("trabajado");

  let baseFloor = null;

  if (isElite) baseFloor = "Campeon";
  else if (isCompetition) baseFloor = "Diamante";
  else if (isAdvanced) baseFloor = "Platino";

  // 🔥 NUEVO: si muchos músculos ya están altos → subir TODO el físico
  const highCount = analysisJSON.musculos.filter(m => {
    const idx = rankIndex(m.rango);
    return idx >= rankIndex("Platino");
  }).length;

  if (highCount >= 5) {
    baseFloor = "Diamante";
  }

  if (!baseFloor) {
    // solo normaliza nombres si no hay lógica aplicada
    analysisJSON.musculos = analysisJSON.musculos.map(m => ({
      ...m,
      rango: normalizeRank(m.rango) || m.rango,
    }));
    return analysisJSON;
  }

  const majorGroups = new Set([
    "Pecho",
    "Espalda",
    "Hombro",
    "Cuadriceps" // 🔥 añadido (antes faltaba)
  ]);

  analysisJSON.musculos = analysisJSON.musculos.map((m) => {
    const grupo = String(m.grupo || "").trim();

    let minRank = baseFloor;

    // 🔥 grupos grandes SIEMPRE más altos
    if (majorGroups.has(grupo)) {
      minRank = nextRank(baseFloor); // +1 nivel mínimo
    }

    // 🔥 piernas boost extra (tu problema principal)
    if (grupo === "Cuadriceps" || grupo === "Femoral" || grupo === "Glúteo") {
      minRank = nextRank(minRank);
    }

    const finalRank = rankAtLeast(m.rango, minRank);

    return {
      ...m,
      grupo,
      rango: finalRank,
    };
  });

  return analysisJSON;
}

exports.analyzePhysique = async (req, res) => {
  const userId = req.user.id;

  // ─── 1. VALIDACIÓN DE ARCHIVOS ───────────────────────────────────────────
  const frontFile = req.files?.front?.[0];
  const backFile  = req.files?.back?.[0];

  if (!frontFile || !backFile) {
    return res.status(400).json({
      error:   "MISSING_IMAGES",
      message: "Debes enviar dos fotos: una de frente (front) y una de espalda (back).",
    });
  }

  // ─── 2. LÍMITE DIARIO ────────────────────────────────────────────────────
  try {
    const [usage] = await db.query(
      `SELECT COUNT(*) as count FROM ai_logs
       WHERE usuario_id = ? AND tipo_accion = 'escaneo_corporal' AND DATE(created_at) = CURDATE()`,
      [userId]
    );
    const todayCount = usage?.[0]?.count || 0;

    if (todayCount >= SCAN_DAILY_LIMIT) {
      return res.status(429).json({
        error:     "LIMIT_REACHED",
        message:   `Has alcanzado tu límite diario de ${SCAN_DAILY_LIMIT} escaneos. Vuelve mañana.`,
        remaining: 0,
      });
    }
  } catch (err) {
    console.warn("⚠️ No se pudo verificar límite de escaneos:", err.message);
  }

  // ─── 3. PREPARAR IMÁGENES EN BASE64 ──────────────────────────────────────
  const frontBase64 = frontFile.buffer.toString("base64");
  const backBase64  = backFile.buffer.toString("base64");
  const frontMime   = frontFile.mimetype;
  const backMime    = backFile.mimetype;

  res.setTimeout(90000);

  try {
    console.log(`🔍 Escaneo de Físico IA (Groq Vision) para Usuario ID: ${userId}...`);

    // ─── 4. LLAMADA A GROQ VISION (LLaMA 4 Scout) ────────────────────────
    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: PHYSIQUE_SYSTEM_PROMPT,
            },
            {
              type: "image_url",
              image_url: { url: `data:${frontMime};base64,${frontBase64}` },
            },
            {
              type: "image_url",
              image_url: { url: `data:${backMime};base64,${backBase64}` },
            },
          ],
        },
      ],
      temperature: 0.25,
      max_tokens:  1000,
    });

    const rawText   = completion.choices[0].message.content;
    const cleanText = rawText.replace(/```json|```/g, "").trim();

    let analysisJSON;
    try {
      analysisJSON = JSON.parse(cleanText);
    } catch {
      console.error("❌ Error parseando JSON de escaneo:", cleanText.slice(0, 300));
      return res.status(500).json({ error: "PARSE_ERROR", message: "Error al procesar la respuesta de la IA." });
    }

    if (analysisJSON.error === "INVALID_IMAGE") {
      return res.status(400).json({ error: "INVALID_IMAGE", message: "La IA no detecta un cuerpo humano válido." });
    }

    // ─── 4.5 CALIBRACIÓN ANTISUBJETIVA / ANTI-RANGO-BAJO ───────────────────
    analysisJSON = calibratePhysiqueAnalysis(analysisJSON);

    // ─── 5. PERSISTENCIA EN DB ───────────────────────────────────────────
    const dbMapping = {
      "Pecho":      ["Pecho"],
      "Espalda":    ["Espalda Alta", "Espalda Media", "Espalda Baja"],
      "Hombro":     ["Hombro"],
      "Bíceps":     ["Bíceps"],
      "Tríceps":    ["Tríceps"],
      "Cuadriceps": ["Cuadriceps"],
      "Abdomen":    ["Abdomen"],
      "Femoral":    ["Femoral"],
      "Glúteo":     ["Gluteo"],
      "Gemelo":     ["Gemelo"],
    };

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      for (const muscleItem of analysisJSON.musculos) {
        const targets = dbMapping[muscleItem.grupo] || [muscleItem.grupo];
        for (const targetGroup of targets) {
          await connection.query(
            `INSERT INTO stats_musculares (usuario_id, grupo_muscular, rango_actual, fuerza_teorica_max)
             VALUES (?, ?, ?, 0.0)
             ON DUPLICATE KEY UPDATE rango_actual = ?`,
            [userId, targetGroup, muscleItem.rango, muscleItem.rango]
          );
        }
      }
      await connection.commit();
      console.log(`✅ Rangos actualizados en DB para Usuario ID: ${userId}`);
    } catch (dbErr) {
      await connection.rollback();
      console.error("❌ Error actualizando stats_musculares:", dbErr);
    } finally {
      connection.release();
    }

    // Log de éxito
    await db.query(
      "INSERT INTO ai_logs (usuario_id, tipo_accion, status) VALUES (?, 'escaneo_corporal', 'success')",
      [userId]
    ).catch(() => {});

    // Escaneos restantes
    const [updatedUsage] = await db.query(
      `SELECT COUNT(*) as count FROM ai_logs
       WHERE usuario_id = ? AND tipo_accion = 'escaneo_corporal' AND DATE(created_at) = CURDATE()`,
      [userId]
    );
    const remaining = Math.max(0, SCAN_DAILY_LIMIT - (updatedUsage?.[0]?.count || 0));

    res.json({
      success:         true,
      message:         "Análisis completado y rangos actualizados.",
      data:            analysisJSON,
      remaining_scans: remaining,
    });

  } catch (err) {
    console.error("❌ ERROR CRÍTICO ESCANEO:", err);
    res.status(500).json({ error: "INTERNAL_ERROR", details: err.message });
  }
};
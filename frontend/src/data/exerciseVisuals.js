/**
 * exerciseVisuals.js
 * 
 * Diccionario de assets visuales para ejercicios.
 * Fuente: yuhonas/free-exercise-db (Public Domain / Unlicense)
 * https://github.com/yuhonas/free-exercise-db
 * 
 * Las imágenes se sirven directamente desde GitHub raw content.
 * Para producción, considerar migrar a un CDN propio o ImageKit.
 */

const GITHUB_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

/**
 * Mapa principal: nombre del ejercicio en español → URL de imagen/ilustración.
 * Las claves están en minúsculas y sin tildes para facilitar la búsqueda fuzzy.
 */
const exerciseVisualsMap = {
  
  // PECHO (Chest)
  
  "press banca": `${GITHUB_BASE}/Barbell_Bench_Press_-_Medium_Grip/`,
  "press banca con barra": `${GITHUB_BASE}/Barbell_Bench_Press_-_Medium_Grip/`,
  "press banca con mancuernas": `${GITHUB_BASE}/Dumbbell_Bench_Press/`,
  "press inclinado con barra": `${GITHUB_BASE}/Barbell_Incline_Bench_Press_-_Medium_Grip/`,
  "press inclinado con mancuernas": `${GITHUB_BASE}/Incline_Dumbbell_Press/`,
  "press declinado": `${GITHUB_BASE}/Decline_Barbell_Bench_Press/`,
  "press declinado con barra": `${GITHUB_BASE}/Decline_Barbell_Bench_Press/`,
  "aperturas con mancuernas": `${GITHUB_BASE}/Dumbbell_Flyes/`,
  "aperturas en polea": `${GITHUB_BASE}/Cable_Crossover/`,
  "fondos en paralelas": `${GITHUB_BASE}/Dips_-_Chest_Version/`,
  "flexiones": `${GITHUB_BASE}/Pushups/`,
  "cruces en polea": `${GITHUB_BASE}/Cable_Crossover/`,
  "press en maquina": `${GITHUB_BASE}/Leverage_Chest_Press/`,

  
  // ESPALDA (Back)
  
  "dominadas": `${GITHUB_BASE}/Pullups/`,
  "dominadas con agarre ancho": `${GITHUB_BASE}/Wide-Grip_Pulldown_Behind_The_Neck/`,
  "jalon al pecho": `${GITHUB_BASE}/Wide-Grip_Lat_Pulldown/`,
  "jalon frontal": `${GITHUB_BASE}/Wide-Grip_Lat_Pulldown/`,
  "remo con barra": `${GITHUB_BASE}/Bent_Over_Barbell_Row/`,
  "remo con mancuerna": `${GITHUB_BASE}/One-Arm_Dumbbell_Row/`,
  "remo en polea baja": `${GITHUB_BASE}/Seated_Cable_Rows/`,
  "remo sentado en polea": `${GITHUB_BASE}/Seated_Cable_Rows/`,
  "peso muerto": `${GITHUB_BASE}/Barbell_Deadlift/`,
  "peso muerto convencional": `${GITHUB_BASE}/Barbell_Deadlift/`,
  "peso muerto rumano": `${GITHUB_BASE}/Romanian_Deadlift_With_Dumbbells/`,
  "peso muerto sumo": `${GITHUB_BASE}/Sumo_Deadlift/`,
  "pullover": `${GITHUB_BASE}/Straight-Arm_Dumbbell_Pullover/`,
  "remo en t": `${GITHUB_BASE}/Bent_Over_Two-Arm_Long_Bar_Row/`,

  
  // PIERNAS (Legs)
  
  "sentadilla": `${GITHUB_BASE}/Barbell_Full_Squat/`,
  "sentadilla con barra": `${GITHUB_BASE}/Barbell_Full_Squat/`,
  "sentadilla frontal": `${GITHUB_BASE}/Front_Barbell_Squat/`,
  "sentadilla bulgara": `${GITHUB_BASE}/Dumbbell_Single_Leg_Split_Squat/`,
  "sentadilla goblet": `${GITHUB_BASE}/Goblet_Squat/`,
  "sentadilla hack": `${GITHUB_BASE}/Barbell_Hack_Squat/`,
  "prensa de piernas": `${GITHUB_BASE}/Leg_Press/`,
  "prensa": `${GITHUB_BASE}/Leg_Press/`,
  "extension de cuadriceps": `${GITHUB_BASE}/Leg_Extensions/`,
  "extensiones de pierna": `${GITHUB_BASE}/Leg_Extensions/`,
  "curl de pierna": `${GITHUB_BASE}/Seated_Leg_Curl/`,
  "curl femoral": `${GITHUB_BASE}/Seated_Leg_Curl/`,
  "curl femoral sentado": `${GITHUB_BASE}/Seated_Leg_Curl/`,
  "curl femoral acostado": `${GITHUB_BASE}/Lying_Leg_Curls/`,
  "zancadas": `${GITHUB_BASE}/Dumbbell_Lunges_Walking/`,
  "zancadas con mancuernas": `${GITHUB_BASE}/Dumbbell_Lunges_Walking/`,
  "hip thrust": `${GITHUB_BASE}/Barbell_Hip_Thrust/`,
  "elevacion de gemelos": `${GITHUB_BASE}/Standing_Calf_Raises/`,
  "gemelos en maquina": `${GITHUB_BASE}/Standing_Calf_Raises/`,
  "elevacion de pantorrilla": `${GITHUB_BASE}/Standing_Calf_Raises/`,
  "buenos dias": `${GITHUB_BASE}/Good_Morning/`,

  
  // HOMBROS (Shoulders)
  
  "press militar": `${GITHUB_BASE}/Standing_Military_Press/`,
  "press militar con barra": `${GITHUB_BASE}/Standing_Military_Press/`,
  "press militar con mancuernas": `${GITHUB_BASE}/Dumbbell_Shoulder_Press/`,
  "press arnold": `${GITHUB_BASE}/Arnold_Dumbbell_Press/`,
  "elevaciones laterales": `${GITHUB_BASE}/Side_Lateral_Raise/`,
  "elevaciones frontales": `${GITHUB_BASE}/Front_Dumbbell_Raise/`,
  "elevacion lateral con mancuernas": `${GITHUB_BASE}/Side_Lateral_Raise/`,
  "pajaros": `${GITHUB_BASE}/Seated_Bent-Over_Rear_Delt_Raise/`,
  "pajaros con mancuernas": `${GITHUB_BASE}/Seated_Bent-Over_Rear_Delt_Raise/`,
  "face pull": `${GITHUB_BASE}/Face_Pull/`,
  "face pulls": `${GITHUB_BASE}/Face_Pull/`,
  "encogimientos con barra": `${GITHUB_BASE}/Barbell_Shrug/`,
  "encogimientos": `${GITHUB_BASE}/Barbell_Shrug/`,

  
  // BRAZOS - BÍCEPS (Biceps)
  
  "curl de biceps con barra": `${GITHUB_BASE}/Barbell_Curl/`,
  "curl con barra": `${GITHUB_BASE}/Barbell_Curl/`,
  "curl de biceps con mancuernas": `${GITHUB_BASE}/Dumbbell_Bicep_Curl/`,
  "curl con mancuernas": `${GITHUB_BASE}/Dumbbell_Bicep_Curl/`,
  "curl martillo": `${GITHUB_BASE}/Hammer_Curls/`,
  "curl concentrado": `${GITHUB_BASE}/Concentration_Curls/`,
  "curl en predicador": `${GITHUB_BASE}/Preacher_Curl/`,
  "curl scott": `${GITHUB_BASE}/Preacher_Curl/`,
  "curl en polea": `${GITHUB_BASE}/Cable_Hammer_Curls_-_Rope_Attachment/`,
  "curl inclinado con mancuernas": `${GITHUB_BASE}/Incline_Dumbbell_Curl/`,

  
  // BRAZOS - TRÍCEPS (Triceps)
  
  "extension de triceps en polea": `${GITHUB_BASE}/Triceps_Pushdown_-_Rope_Attachment/`,
  "extension de triceps": `${GITHUB_BASE}/Triceps_Pushdown_-_Rope_Attachment/`,
  "press frances": `${GITHUB_BASE}/EZ-Bar_Skullcrusher/`,
  "press frances con barra z": `${GITHUB_BASE}/EZ-Bar_Skullcrusher/`,
  "fondos para triceps": `${GITHUB_BASE}/Dips_-_Triceps_Version/`,
  "patada de triceps": `${GITHUB_BASE}/Dumbbell_Kickback/`,
  "extension de triceps con mancuerna": `${GITHUB_BASE}/Dumbbell_One-Arm_Triceps_Extension/`,
  "press cerrado": `${GITHUB_BASE}/Close-Grip_Barbell_Bench_Press/`,

  
  // ABDOMINALES (Core)
  
  "crunch": `${GITHUB_BASE}/Crunches/`,
  "crunch abdominal": `${GITHUB_BASE}/Crunches/`,
  "abdominales": `${GITHUB_BASE}/Crunches/`,
  "plancha": `${GITHUB_BASE}/Plank/`,
  "plancha frontal": `${GITHUB_BASE}/Plank/`,
  "elevacion de piernas": `${GITHUB_BASE}/Hanging_Leg_Raise/`,
  "elevacion de piernas colgado": `${GITHUB_BASE}/Hanging_Leg_Raise/`,
  "russian twist": `${GITHUB_BASE}/Russian_Twist/`,
  "rueda abdominal": `${GITHUB_BASE}/Ab_Roller/`,

  
  // GLÚTEOS (Glutes)
  
  "patada de gluteo": `${GITHUB_BASE}/Glute_Kickback/`,
  "patada de gluteo en polea": `${GITHUB_BASE}/Glute_Kickback/`,
  "puente de gluteos": `${GITHUB_BASE}/Barbell_Hip_Thrust/`,

  
  // CUERPO COMPLETO / FUNCIONAL
  
  "clean and press": `${GITHUB_BASE}/Clean_and_Press/`,
  "swing con kettlebell": `${GITHUB_BASE}/Kettlebell_Sumo_Deadlift_High_Pull/`,
  "burpees": `${GITHUB_BASE}/Burpee/`,
};


// NORMALIZACIÓN Y BÚSQUEDA FUZZY


/**
 * Normaliza un string removiendo tildes, convirtiendo a minúsculas
 * y limpiando espacios extra para matching robusto.
 */
function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Elimina diacríticos (tildes)
    .replace(/\s+/g, " ")           // Espacios múltiples → uno solo
    .trim();
}

/**
 * Objeto Proxy que intercepta accesos por clave y aplica normalización
 * automática. Esto permite que `exerciseVisuals["Press Banca con Barra"]`
 * funcione sin importar mayúsculas ni tildes.
 */
export const exerciseVisuals = new Proxy(exerciseVisualsMap, {
  get(target, prop) {
    if (typeof prop !== "string") return undefined;

    const normalizedKey = normalize(prop);

    // 1. Búsqueda exacta normalizada
    if (target[normalizedKey]) {
      return target[normalizedKey];
    }

    // 2. Búsqueda parcial: si alguna clave del diccionario está contenida
    //    en el nombre del ejercicio, o viceversa.
    const keys = Object.keys(target);
    
    // Primero intentamos que el nombre del ejercicio contenga una clave
    const containedMatch = keys.find(key => normalizedKey.includes(key));
    if (containedMatch) return target[containedMatch];

    // Luego intentamos que una clave contenga el nombre del ejercicio
    const reverseMatch = keys.find(key => key.includes(normalizedKey));
    if (reverseMatch) return target[reverseMatch];

    // 3. Sin coincidencia → undefined (fallback al diseño original)
    return undefined;
  }
});

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
import { API_URL } from "../../../config/api";


//  CONFIG 
const OFF_BASE   = "https://world.openfoodfacts.org";
const USDA_BASE  = "https://api.nal.usda.gov/fdc/v1";
const USDA_KEY   = "ySDEC3JdUGIr5yi9ZaNo8otGCmLyHnE2w0Qiqt1F"; // ← Reemplazar con tu API key de https://fdc.nal.usda.gov/api-key-signup
const SCANNER_ID = "nut-qr-reader";

// Nutrient IDs from USDA FoodData Central
const USDA_NUTRIENT_IDS = {
  ENERGY:  1008,  // Energy (KCAL)
  PROTEIN: 1003,  // Protein (G)
  CARBS:   1005,  // Carbohydrate, by difference (G)
  FAT:     1004,  // Total lipid / fat (G)
};

//  TRANSLATION SYSTEM (ES ↔ EN)
// Comprehensive bidirectional dictionary for food search & display
const FOOD_DICT = [
  // Proteins
  ["pollo", "chicken"], ["pechuga", "breast"], ["muslo", "thigh"],
  ["carne", "meat"], ["ternera", "beef"], ["cerdo", "pork"],
  ["cordero", "lamb"], ["pavo", "turkey"], ["conejo", "rabbit"],
  ["jamón", "ham"], ["jamon", "ham"], ["salchicha", "sausage"],
  ["tocino", "bacon"], ["bistec", "steak"], ["filete", "fillet"],
  ["huevo", "egg"], ["huevos", "eggs"],
  ["pescado", "fish"], ["atún", "tuna"], ["atun", "tuna"],
  ["salmón", "salmon"], ["salmon", "salmon"], ["bacalao", "cod"],
  ["merluza", "hake"], ["sardina", "sardine"], ["anchoa", "anchovy"],
  ["gamba", "shrimp"], ["camarón", "shrimp"], ["langostino", "prawn"],
  ["calamar", "squid"], ["pulpo", "octopus"], ["mejillón", "mussel"],
  ["almeja", "clam"], ["marisco", "seafood"],
  // Dairy
  ["leche", "milk"], ["queso", "cheese"], ["yogur", "yogurt"],
  ["mantequilla", "butter"], ["nata", "cream"], ["crema", "cream"],
  ["requesón", "cottage cheese"], ["cuajada", "curd"],
  // Grains & Carbs
  ["arroz", "rice"], ["pan", "bread"], ["pasta", "pasta"],
  ["fideos", "noodles"], ["avena", "oats"], ["trigo", "wheat"],
  ["maíz", "corn"], ["maiz", "corn"], ["cebada", "barley"],
  ["centeno", "rye"], ["harina", "flour"], ["cereal", "cereal"],
  ["patata", "potato"], ["papa", "potato"], ["batata", "sweet potato"],
  ["boniato", "sweet potato"],
  // Vegetables
  ["tomate", "tomato"], ["lechuga", "lettuce"], ["espinaca", "spinach"],
  ["brócoli", "broccoli"], ["brocoli", "broccoli"], ["coliflor", "cauliflower"],
  ["zanahoria", "carrot"], ["cebolla", "onion"], ["ajo", "garlic"],
  ["pimiento", "pepper"], ["pepino", "cucumber"], ["calabacín", "zucchini"],
  ["calabaza", "pumpkin"], ["berenjena", "eggplant"], ["alcachofa", "artichoke"],
  ["espárrago", "asparagus"], ["judía", "bean"], ["frijol", "bean"],
  ["guisante", "pea"], ["lenteja", "lentil"], ["garbanzo", "chickpea"],
  ["soja", "soy"], ["champiñón", "mushroom"], ["seta", "mushroom"],
  ["aguacate", "avocado"], ["aceitunas", "olives"], ["remolacha", "beet"],
  ["apio", "celery"], ["col", "cabbage"], ["repollo", "cabbage"],
  ["rábano", "radish"], ["nabo", "turnip"], ["puerro", "leek"],
  ["ensalada", "salad"], ["verdura", "vegetable"],
  // Fruits
  ["manzana", "apple"], ["plátano", "banana"], ["platano", "banana"],
  ["naranja", "orange"], ["fresa", "strawberry"], ["uva", "grape"],
  ["melocotón", "peach"], ["pera", "pear"], ["sandía", "watermelon"],
  ["melón", "melon"], ["piña", "pineapple"], ["mango", "mango"],
  ["kiwi", "kiwi"], ["cereza", "cherry"], ["ciruela", "plum"],
  ["frambuesa", "raspberry"], ["arándano", "blueberry"],
  ["limón", "lemon"], ["lima", "lime"], ["higo", "fig"],
  ["coco", "coconut"], ["granada", "pomegranate"], ["fruta", "fruit"],
  // Nuts & Seeds
  ["almendra", "almond"], ["nuez", "walnut"], ["cacahuete", "peanut"],
  ["avellana", "hazelnut"], ["pistacho", "pistachio"], ["anacardo", "cashew"],
  ["semilla", "seed"], ["girasol", "sunflower"], ["chía", "chia"],
  ["lino", "flaxseed"], ["sésamo", "sesame"],
  // Oils & Fats
  ["aceite", "oil"], ["oliva", "olive"], ["girasol", "sunflower"],
  ["margarina", "margarine"], ["manteca", "lard"],
  // Beverages
  ["agua", "water"], ["café", "coffee"], ["cafe", "coffee"],
  ["té", "tea"], ["zumo", "juice"], ["jugo", "juice"],
  ["cerveza", "beer"], ["vino", "wine"],
  // Sweets & Snacks
  ["azúcar", "sugar"], ["azucar", "sugar"], ["miel", "honey"],
  ["chocolate", "chocolate"], ["galleta", "cookie"], ["helado", "ice cream"],
  ["tarta", "cake"], ["pastel", "cake"], ["mermelada", "jam"],
  // Prepared
  ["pizza", "pizza"], ["hamburguesa", "hamburger"],
  ["tortilla", "tortilla"], ["sopa", "soup"], ["caldo", "broth"],
  // Cooking terms (help with USDA descriptions)
  ["crudo", "raw"], ["cocido", "cooked"], ["asado", "roasted"],
  ["frito", "fried"], ["hervido", "boiled"], ["al horno", "baked"],
  ["a la plancha", "grilled"], ["ahumado", "smoked"],
  ["congelado", "frozen"], ["seco", "dried"], ["fresco", "fresh"],
  ["entero", "whole"], ["desnatado", "skim"], ["semidesnatado", "semi-skim"],
  ["sin piel", "skinless"], ["con piel", "with skin"],
  ["sin hueso", "boneless"], ["molido", "ground"],
];

// Build lookup maps for fast access
const ES_TO_EN = new Map(FOOD_DICT.map(([es, en]) => [es.toLowerCase(), en]));
const EN_TO_ES = new Map(FOOD_DICT.map(([es, en]) => [en.toLowerCase(), es]));

/** Translate a search query from Spanish to English for USDA */
function translateQueryToEN(text) {
  const words = text.toLowerCase().split(/\s+/);
  const translated = words.map(w => ES_TO_EN.get(w) || w);
  return translated.join(" ");
}

/** Translate a USDA food description from English to Spanish */
function translateDescriptionToES(desc) {
  if (!desc) return "";
  let result = desc;
  // Sort by length descending so longer phrases match first (e.g., "sweet potato" before "potato")
  const entries = [...EN_TO_ES.entries()].sort((a, b) => b[0].length - a[0].length);
  for (const [en, es] of entries) {
    const regex = new RegExp(`\\b${en}\\b`, "gi");
    result = result.replace(regex, es);
  }
  // Capitalize first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
}


//  HELPERS 

/** Parse nutritional values (per 100 g) from an Open Food Facts product object */
function parseOFFProduct(product, t) {
  const n = product.nutriments || {};
  return {
    name:   product.product_name || product.abbreviated_product_name || t("nutrition.search.unnamed_food"),
    brand:  product.brands || "",
    image:  product.image_front_small_url || product.image_url || null,
    grams:  100,
    source: "OFF",
    nutritionPer100: {
      calories: n["energy-kcal_100g"] ?? n["energy-kcal"] ?? 0,
      protein:  n["proteins_100g"]    ?? n["proteins"]    ?? 0,
      carbs:    n["carbohydrates_100g"] ?? n["carbohydrates"] ?? 0,
      fat:      n["fat_100g"]          ?? n["fat"]          ?? 0,
    },
  };
}

/** Extract a nutrient value from USDA foodNutrients array */
function getUSDANutrient(foodNutrients, nutrientId) {
  const found = foodNutrients.find(n => n.nutrientId === nutrientId);
  return found ? found.value : 0;
}

/** Parse nutritional values (per 100 g) from a USDA FoodData Central food object */
function parseUSDAProduct(food, t) {
  const nutrients = food.foodNutrients || [];
  const originalName = food.description || t("nutrition.search.unnamed_food");
  const spanishName  = translateDescriptionToES(originalName);

  return {
    name:         spanishName,
    nameOriginal: originalName,
    brand:        food.brandOwner || food.brandName || "",
    image:        null,
    grams:        100,
    source:       "USDA",
    dataType:     food.dataType || "",
    category:     food.foodCategory || "",
    nutritionPer100: {
      calories: getUSDANutrient(nutrients, USDA_NUTRIENT_IDS.ENERGY),
      protein:  getUSDANutrient(nutrients, USDA_NUTRIENT_IDS.PROTEIN),
      carbs:    getUSDANutrient(nutrients, USDA_NUTRIENT_IDS.CARBS),
      fat:      getUSDANutrient(nutrients, USDA_NUTRIENT_IDS.FAT),
    },
  };
}

/** Format kcal from parsed nutritionPer100 */
function kcalPer100(parsed) {
  return Math.round(parsed.nutritionPer100.calories);
}

// Source badge configuration
const SOURCE_CONFIG = {
  USDA: {
    label: "USDA",
    bg:    "rgba(34,197,94,0.12)",
    color: "#22c55e",
    icon:  "🏛️",
  },
  OFF: {
    label: "OFF",
    bg:    "rgba(59,130,246,0.12)",
    color: "#3b82f6",
    icon:  "📦",
  },
};

//  SOURCE BADGE 
function SourceBadge({ source }) {
  const config = SOURCE_CONFIG[source] || SOURCE_CONFIG.OFF;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0"
      style={{ background: config.bg, color: config.color }}
    >
      <span className="text-[8px]">{config.icon}</span>
      {config.label}
    </span>
  );
}

//  FOOD EMOJI GENERATOR 
function getFoodEmoji(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("chicken") || n.includes("pollo")) return "🍗";
  if (n.includes("rice") || n.includes("arroz")) return "🍚";
  if (n.includes("egg") || n.includes("huevo")) return "🥚";
  if (n.includes("milk") || n.includes("leche")) return "🥛";
  if (n.includes("bread") || n.includes("pan")) return "🍞";
  if (n.includes("fish") || n.includes("pescado") || n.includes("salmon") || n.includes("tuna") || n.includes("atún")) return "🐟";
  if (n.includes("beef") || n.includes("ternera") || n.includes("steak") || n.includes("carne")) return "🥩";
  if (n.includes("apple") || n.includes("manzana")) return "🍎";
  if (n.includes("banana") || n.includes("plátano") || n.includes("platano")) return "🍌";
  if (n.includes("orange") || n.includes("naranja")) return "🍊";
  if (n.includes("tomato") || n.includes("tomate")) return "🍅";
  if (n.includes("potato") || n.includes("patata") || n.includes("papa")) return "🥔";
  if (n.includes("cheese") || n.includes("queso")) return "🧀";
  if (n.includes("pasta") || n.includes("spaghetti") || n.includes("noodle")) return "🍝";
  if (n.includes("salad") || n.includes("ensalada") || n.includes("lettuce") || n.includes("lechuga")) return "🥗";
  if (n.includes("avocado") || n.includes("aguacate")) return "🥑";
  if (n.includes("broccoli") || n.includes("brócoli")) return "🥦";
  if (n.includes("carrot") || n.includes("zanahoria")) return "🥕";
  if (n.includes("pork") || n.includes("cerdo")) return "🥓";
  if (n.includes("yogurt") || n.includes("yogur")) return "🥛";
  if (n.includes("nut") || n.includes("almond") || n.includes("almendra") || n.includes("nuez")) return "🥜";
  if (n.includes("oil") || n.includes("aceite")) return "🫒";
  if (n.includes("butter") || n.includes("mantequilla")) return "🧈";
  if (n.includes("coffee") || n.includes("café")) return "☕";
  if (n.includes("water") || n.includes("agua")) return "💧";
  if (n.includes("juice") || n.includes("zumo") || n.includes("jugo")) return "🧃";
  if (n.includes("cookie") || n.includes("galleta")) return "🍪";
  if (n.includes("chocolate")) return "🍫";
  if (n.includes("ice cream") || n.includes("helado")) return "🍦";
  if (n.includes("pizza")) return "🍕";
  if (n.includes("ham") || n.includes("jamón") || n.includes("jamon")) return "🥓";
  if (n.includes("shrimp") || n.includes("gamba") || n.includes("camarón")) return "🦐";
  if (n.includes("corn") || n.includes("maíz") || n.includes("maiz")) return "🌽";
  if (n.includes("pepper") || n.includes("pimiento")) return "🌶️";
  if (n.includes("bean") || n.includes("judía") || n.includes("frijol") || n.includes("lentil") || n.includes("lenteja")) return "🫘";
  if (n.includes("mushroom") || n.includes("champiñón") || n.includes("seta")) return "🍄";
  if (n.includes("honey") || n.includes("miel")) return "🍯";
  if (n.includes("cereal")) return "🥣";
  if (n.includes("sugar") || n.includes("azúcar") || n.includes("azucar")) return "🍬";
  return "🍽️";
}

/** Get a subtle category-based gradient for foods without images */
function getCategoryStyle(name) {
  const n = (name || "").toLowerCase();
  // Meats & Proteins
  if (n.match(/chicken|pollo|beef|ternera|pork|cerdo|meat|carne|lamb|turkey|pavo|ham|jam|steak|bacon/)) 
    return { bg: "linear-gradient(145deg, #2a1215 0%, #44181d 100%)", border: "rgba(248,113,113,0.15)" };
  // Fish & Seafood
  if (n.match(/fish|pescado|salmon|tuna|atún|shrimp|gamba|cod|sardine|hake|squid/))
    return { bg: "linear-gradient(145deg, #0c2d3f 0%, #164e63 100%)", border: "rgba(34,211,238,0.15)" };
  // Vegetables
  if (n.match(/salad|ensalada|lettuce|lechuga|broccoli|brócoli|carrot|zanahoria|tomato|tomate|pepper|pimiento|spinach|espinaca|onion|cebolla|cucumber|pepino|bean|jud|lentil|lenteja|pea|guisante|mushroom|seta|garlic|ajo|celery|apio|cabbage|col|asparagus|artichoke|eggplant|vegetable|verdura/))
    return { bg: "linear-gradient(145deg, #0a2818 0%, #14532d 100%)", border: "rgba(74,222,128,0.15)" };
  // Grains & Carbs
  if (n.match(/rice|arroz|bread|pan |pasta|noodle|fideo|oat|avena|wheat|trigo|corn|maíz|potato|patata|papa|flour|harina|cereal/))
    return { bg: "linear-gradient(145deg, #271506 0%, #451a03 100%)", border: "rgba(251,191,36,0.15)" };
  // Fruits
  if (n.match(/apple|manzana|banana|plátano|orange|naranja|strawberry|fresa|grape|uva|peach|pear|melon|mango|kiwi|cherry|lemon|limón|pineapple|piña|blueberry|raspberry|fruit|fruta/))
    return { bg: "linear-gradient(145deg, #2e1065 0%, #4c1d95 100%)", border: "rgba(167,139,250,0.15)" };
  // Dairy
  if (n.match(/milk|leche|cheese|queso|yogurt|yogur|butter|mantequilla|cream|nata|curd/))
    return { bg: "linear-gradient(145deg, #1e1b4b 0%, #312e81 100%)", border: "rgba(129,140,248,0.15)" };
  // Eggs
  if (n.match(/egg|huevo/))
    return { bg: "linear-gradient(145deg, #422006 0%, #713f12 100%)", border: "rgba(253,224,71,0.18)" };
  // Nuts & Seeds
  if (n.match(/nut |nuez|almond|almendra|walnut|peanut|cacahuete|hazelnut|pistacho|seed|semilla/))
    return { bg: "linear-gradient(145deg, #1c1917 0%, #44403c 100%)", border: "rgba(214,211,209,0.12)" };
  // Oils
  if (n.match(/oil|aceite|olive|oliva/))
    return { bg: "linear-gradient(145deg, #1a2e05 0%, #365314 100%)", border: "rgba(163,230,53,0.12)" };
  // Beverages
  if (n.match(/water|agua|coffee|café|tea|té|juice|zumo|jugo|beer|cerveza|wine|vino/))
    return { bg: "linear-gradient(145deg, #172554 0%, #1e3a5f 100%)", border: "rgba(96,165,250,0.15)" };
  // Generic default
  return { bg: "linear-gradient(145deg, #18181b 0%, #27272a 100%)", border: "rgba(161,161,170,0.1)" };
}

//  RESULTS CARD 
function FoodResultCard({ food, onSelect }) {
  const kcal = kcalPer100(food);
  const n    = food.nutritionPer100;
  const hasImage = !!food.image;
  const catStyle = !hasImage ? getCategoryStyle(food.nameOriginal || food.name) : null;

  return (
    <button
      onClick={() => onSelect(food)}
      className="w-full text-left flex items-center gap-3 p-3 rounded-[18px] transition-all duration-150 active:scale-[0.98]"
      style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Thumbnail */}
      <div
        className="w-14 h-14 rounded-[14px] overflow-hidden shrink-0 flex items-center justify-center relative"
        style={hasImage
          ? { background: "#111" }
          : { background: catStyle.bg, border: `1px solid ${catStyle.border}` }
        }
      >
        {hasImage ? (
          <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[26px] drop-shadow-md relative z-10">
            {getFoodEmoji(food.nameOriginal || food.name)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[13px] font-bold text-white truncate flex-1">{food.name}</p>
          <SourceBadge source={food.source} />
        </div>
        {/* Show original English name for USDA results */}
        {food.nameOriginal && food.nameOriginal !== food.name && (
          <p className="text-[10px] text-white/25 truncate italic">{food.nameOriginal}</p>
        )}
        {food.brand && (
          <p className="text-[11px] text-white/40 truncate">{food.brand}</p>
        )}
        {food.category && !food.brand && (
          <p className="text-[11px] text-white/40 truncate">{food.category}</p>
        )}
        <div className="flex gap-3 mt-1.5 flex-wrap">
          <span className="text-[10px] font-bold" style={{ color: "#3b82f6" }}>
            {kcal} kcal
          </span>
          <span className="text-[10px] text-white/40">
            Prot: {Math.round(n.protein)}g
          </span>
          <span className="text-[10px] text-white/40">
            Carbs: {Math.round(n.carbs)}g
          </span>
          <span className="text-[10px] text-white/40">
            Grasas: {Math.round(n.fat)}g
          </span>
        </div>
      </div>

      {/* Add arrow */}
      <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"
           strokeLinecap="round" className="w-4 h-4 shrink-0">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>
  );
}

//  SCANNER VIEW 
function ScannerSection({ onDetected }) {
  const { t } = useTranslation();
  // "idle" | "requesting" | "active" | "error" | "denied"
  const [status,     setStatus]     = useState("idle");
  const [errorMsg,   setErrorMsg]   = useState(null);
  const [scannerMsg, setScannerMsg] = useState(null); // feedback when scanning
  const scannerRef  = useRef(null);   // html5Qrcode instance
  const containerRef = useRef(null);  // div element that html5-qrcode mounts into
  const fileInputRef = useRef(null);

  //  Stop & cleanup 
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch (_) {}
      try { scannerRef.current.clear(); }     catch (_) {}
      scannerRef.current = null;
    }
    setStatus("idle");
  }, []);

  // auto-cleanup on unmount
  useEffect(() => () => { stopScanner(); }, [stopScanner]);

  //  Start camera flow 
  const startCamera = useCallback(async () => {
    setStatus("requesting");
    setErrorMsg(null);
    setScannerMsg(null);

    // 1. Check browser support
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setErrorMsg(t("nutrition.search.scanner.not_supported"));
      return;
    }

    // 2. Explicitly request permission first (this triggers the browser's permission prompt)
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    } catch (err) {
      const isDenied = err.name === "NotAllowedError" || err.name === "PermissionDeniedError";
      setStatus(isDenied ? "denied" : "error");
      setErrorMsg(
        isDenied
          ? t("nutrition.search.scanner.permission_denied")
          : t("nutrition.search.scanner.not_accessible")
      );
      return;
    }

    // 3. Stop the raw stream (html5-qrcode abrirá la suya propia)
    stream.getTracks().forEach(t => t.stop());

    // 4. Wait a frame to ensure the container div is painted
    await new Promise(r => requestAnimationFrame(r));

    // 5. Start html5-qrcode on the container div
    try {
      const { Html5Qrcode: H } = await import("html5-qrcode");
      const qr = new H(SCANNER_ID);
      scannerRef.current = qr;

      await qr.start(
        { facingMode: { exact: "environment" } },
        { fps: 10, qrbox: { width: 250, height: 160 }, aspectRatio: 1.6 },
        (decodedText) => {
          setScannerMsg(t("nutrition.search.scanner.detected_code", { code: decodedText }));
          onDetected(decodedText);
          stopScanner();
        },
        () => {} // frame error – normal, ignore
      );

      setStatus("active");
    } catch (err) {
      console.error("html5-qrcode error:", err);
      setStatus("error");
      setErrorMsg(t("nutrition.search.scanner.init_error"));
    }
  }, [onDetected, stopScanner]);

  //  Handle file upload fallback 
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScannerMsg(t("nutrition.search.scanner.analyzing"));
    setErrorMsg(null);
    try {
      const { Html5Qrcode: H } = await import("html5-qrcode");
      const qr = new H("nut-file-reader");
      const result = await qr.scanFile(file, false);
      setScannerMsg(null);
      onDetected(result);
    } catch {
      setScannerMsg(null);
      setErrorMsg(t("nutrition.search.scanner.not_found"));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/*  Camera viewport (always in DOM so html5-qrcode can find it)  */}
      <div
        id={SCANNER_ID}
        ref={containerRef}
        className="w-full overflow-hidden transition-all duration-300"
        style={{
          borderRadius: "18px",
          background: "#0a0a0a",
          minHeight: status === "active" ? 230 : 0,
          border: status === "active" ? "1px solid rgba(255,255,255,0.1)" : "none",
        }}
      />

      {/* Hidden div required by html5-qrcode scanFile */}
      <div id="nut-file-reader" style={{ display: "none" }} />

      {/*  Status-based feedback  */}
      {status === "requesting" && (
        <div className="flex items-center justify-center gap-3 py-5 text-sm text-white/60">
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeOpacity=".25"/>
            <path d="M21 12a9 9 0 0 1-9 9" strokeLinecap="round"/>
          </svg>
          {t("nutrition.search.scanner.requesting_permission")}
        </div>
      )}

      {scannerMsg && status === "active" && (
        <div className="text-xs text-center py-2 px-4 rounded-[12px] font-medium"
          style={{ background: "rgba(52,211,153,0.1)", color: "#34d399" }}>
          {scannerMsg}
        </div>
      )}

      {/*  Buttons  */}
      <div className="space-y-2.5">
        {/* Open / Stop camera button */}
        {status !== "active" && status !== "requesting" && (
          <button
            onClick={startCamera}
            disabled={status === "requesting"}
            className="w-full h-12 rounded-[16px] text-sm font-bold flex items-center justify-center gap-2.5 transition-all active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#1e40af,#4f46e5)", color: "#fff" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" className="w-5 h-5">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
            {t("nutrition.search.scanner.start")}
          </button>
        )}

        {status === "active" && (
          <button
            onClick={stopScanner}
            className="w-full h-10 rounded-[14px] text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ background: "#2a2a2a", color: "rgba(255,255,255,0.6)" }}
          >
            {t("nutrition.search.scanner.stop")}
          </button>
        )}

        {/* Fallback: upload image — NO 'capture' attr so it works on PC */}
        <label
          className="w-full h-12 rounded-[16px] text-sm font-bold flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-95"
          style={{ background: "#1a1a1a", border: "1px dashed rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" className="w-5 h-5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          {t("nutrition.search.scanner.upload")}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileUpload}
          />
        </label>

        {/* Denied / error tip */}
        {status === "denied" && (
          <div className="rounded-[14px] p-3 space-y-1 text-xs"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
            <p className="font-bold text-red-400">🔒 {t("nutrition.search.scanner.permission_denied")}</p>
            <p className="text-white/50 leading-relaxed">
              {t("nutrition.search.scanner.permission_tip")}
            </p>
          </div>
        )}
      </div>

      {/* Generic error */}
      {errorMsg && status !== "denied" && (
        <div
          className="text-xs text-center py-2 px-4 rounded-[12px] font-medium"
          style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}
        >
          {errorMsg}
        </div>
      )}
    </div>
  );
}

//  SEARCH SOURCES INDICATOR
function SearchSourcesBar({ usdaCount, offCount, loading }) {
  const { t } = useTranslation();
  if (loading || (usdaCount === 0 && offCount === 0)) return null;
  const total = usdaCount + offCount;

  return (
    <div
      className="flex items-center justify-between px-3 py-2 rounded-[12px]"
      style={{ background: "#111", border: "1px solid rgba(255,255,255,0.04)" }}
    >
      <span className="text-[11px] text-white/40 font-medium">
        {total} {t("nutrition.search.results_found")}
      </span>
      <div className="flex items-center gap-2">
        {usdaCount > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: "#22c55e" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e" }} />
            {usdaCount} USDA
          </span>
        )}
        {offCount > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: "#3b82f6" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#3b82f6" }} />
            {offCount} OFF
          </span>
        )}
      </div>
    </div>
  );
}

//  LOADING SKELETON 
function SearchSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-[18px]" style={{ background: "#1a1a1a" }}>
          <div className="w-14 h-14 rounded-[12px]" style={{ background: "#252525" }} />
          <div className="flex-1 space-y-2">
            <div className="h-3 rounded-full w-3/4" style={{ background: "#252525" }} />
            <div className="h-2 rounded-full w-1/2" style={{ background: "#1f1f1f" }} />
            <div className="flex gap-3">
              <div className="h-2 rounded-full w-12" style={{ background: "#1f1f1f" }} />
              <div className="h-2 rounded-full w-8" style={{ background: "#1f1f1f" }} />
              <div className="h-2 rounded-full w-8" style={{ background: "#1f1f1f" }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

//  MAIN MODAL 
export default function FoodSearchModal({ mealLabel, onSelect, onClose }) {
  const { t } = useTranslation();
  const [tab,         setTab]         = useState("search"); // "search" | "scan"
  const [query,       setQuery]       = useState("");
  const [results,     setResults]     = useState([]);
  const [usdaCount,   setUsdaCount]   = useState(0);
  const [offCount,    setOffCount]    = useState(0);
  const [loading,     setLoading]     = useState(false);
  const [apiError,    setApiError]    = useState(null);
  const [gramsInput,  setGramsInput]  = useState(100);
  const [pendingFood, setPendingFood] = useState(null); // food to confirm with grams

  const searchTimeoutRef = useRef(null);
  const abortRef         = useRef(null); // AbortController for cancellation

  //  Combined search: USDA + OpenFoodFacts in parallel 
  const doSearch = useCallback(async (text) => {
    if (!text.trim()) { setResults([]); setUsdaCount(0); setOffCount(0); return; }

    // Cancel previous in-flight search
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setApiError(null);

    try {
      // Translate query to English for USDA (user types in Spanish)
      const usdaQuery = translateQueryToEN(text);

      // Launch both API calls in parallel
      const [usdaResult, offResult] = await Promise.allSettled([
        //  USDA FoodData Central (searched in English) 
        (async () => {
          // Usamos multiples parámetros dataType en lugar de comas para evitar errores 400 en Android WebView
          const url = `${USDA_BASE}/foods/search?api_key=${USDA_KEY}&query=${encodeURIComponent(usdaQuery)}&pageSize=15&dataType=Foundation&dataType=SR%20Legacy`;
          const res = await fetch(url, { signal: controller.signal });
          if (!res.ok) throw new Error("USDA API Error");
          const data = await res.json();
          return (data.foods || [])
            .filter(f => f.description)
            .map(f => parseUSDAProduct(f, t));
        })(),

        //  OpenFoodFacts 
        (async () => {
          const url = `${API_URL}/api/nutrition/off/search?terms=${encodeURIComponent(text)}`;
          const res = await fetch(url, { signal: controller.signal });
          if (!res.ok) throw new Error("OFF API Error");
          const data = await res.json();
          return (data.products || [])
            .filter(p => p.product_name)
            .map(p => parseOFFProduct(p, t));
        })(),
      ]);

      // Don't update state if this search was cancelled
      if (controller.signal.aborted) return;

      const usdaFoods = usdaResult.status === "fulfilled" ? usdaResult.value : [];
      const offFoods  = offResult.status  === "fulfilled" ? offResult.value  : [];

      // Merge: USDA generic foods first, then OFF branded products
      const merged = [...usdaFoods, ...offFoods];

      setUsdaCount(usdaFoods.length);
      setOffCount(offFoods.length);
      setResults(merged);

      // Show error only if BOTH failed
      if (usdaResult.status === "rejected" && offResult.status === "rejected") {
        setApiError(t("nutrition.search.errors.generic"));
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setApiError(t("nutrition.search.errors.generic"));
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const handleQueryChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => doSearch(v), 500);
  };

  //  Barcode detected (OFF only — USDA doesn't have barcodes) 
  const handleBarcode = useCallback(async (code) => {
    setTab("search");
    setLoading(true);
    setApiError(null);
    try {
      const url = `${API_URL}/api/nutrition/off/barcode/${code}`;
      const res  = await fetch(url);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const parsed = parseOFFProduct(data.product, t);
        setResults([parsed]);
        setUsdaCount(0);
        setOffCount(1);
      } else {
        setApiError(t("nutrition.search.errors.not_found", { code }));
        setResults([]);
        setUsdaCount(0);
        setOffCount(0);
      }
    } catch {
      setApiError(t("nutrition.search.errors.barcode"));
    } finally {
      setLoading(false);
    }
  }, []);

  //  Select food → open grams configurator 
  const handleSelectFood = (food) => {
    setPendingFood(food);
    setGramsInput(100);
  };

  //  Confirm with grams 
  const handleConfirm = () => {
    if (!pendingFood) return;
    onSelect({ ...pendingFood, grams: Number(gramsInput) || 100 });
  };

  // Prevent body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Cleanup abort controller
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  //  GRAMS CONFIRMATION SCREEN
  if (pendingFood) {
    const factor = (Number(gramsInput) || 0) / 100;
    const n      = pendingFood.nutritionPer100;
    return (
      <div
        className="fixed inset-0 z-[200] flex flex-col"
        style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(10px)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pb-4" style={{ paddingTop: 'calc(1.5rem + var(--safe-area-top))' }}>
          <button
            onClick={() => setPendingFood(null)}
            className="h-9 w-9 rounded-full flex items-center justify-center"
            style={{ background: "#1a1a1a" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5"
                 strokeLinecap="round" className="w-4 h-4">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t("nutrition.search.add_portion")}</p>
              <SourceBadge source={pendingFood.source} />
            </div>
            <p className="text-sm font-bold text-white truncate">{pendingFood.name}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 space-y-4">
          {/* Food image or emoji */}
          <div
            className="w-full h-36 rounded-[18px] overflow-hidden flex items-center justify-center"
            style={{ background: pendingFood.image ? "transparent" : "#111" }}
          >
            {pendingFood.image ? (
              <img src={pendingFood.image} alt={pendingFood.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-7xl">{getFoodEmoji(pendingFood.name)}</span>
            )}
          </div>

          {/* Grams input */}
          <div className="rounded-[20px] p-5 space-y-3" style={{ background: "#111" }}>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{t("nutrition.search.amount")}</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setGramsInput(g => Math.max(1, Number(g) - 10))}
                className="h-11 w-11 rounded-full flex items-center justify-center text-xl font-light shrink-0"
                style={{ background: "#1e1e1e" }}
              >−</button>
              <input
                type="number"
                min="1"
                max="5000"
                value={gramsInput}
                onChange={e => setGramsInput(e.target.value)}
                className="flex-1 text-center text-3xl font-black bg-transparent text-white outline-none"
              />
              <button
                onClick={() => setGramsInput(g => Number(g) + 10)}
                className="h-11 w-11 rounded-full flex items-center justify-center text-xl font-light shrink-0"
                style={{ background: "#1e1e1e" }}
              >+</button>
            </div>
            <p className="text-center text-xs text-white/30">{t("nutrition.search.grams")}</p>
          </div>

          {/* Nutritional preview */}
          <div className="rounded-[20px] p-4" style={{ background: "#111" }}>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">{t("nutrition.search.nutritional_value")}</p>
            <div className="grid grid-cols-4 gap-3 text-center">
              {[
                { label: t("nutrition.macros.calories_short"), val: Math.round((n.calories || 0) * factor), color: "#3b82f6" },
                { label: t("nutrition.protein"),  val: `${Math.round((n.protein  || 0) * factor)}g`, color: "#a78bfa" },
                { label: t("nutrition.carbs"),    val: `${Math.round((n.carbs   || 0) * factor)}g`, color: "#f59e0b" },
                { label: t("nutrition.fat"),     val: `${Math.round((n.fat     || 0) * factor)}g`, color: "#f87171" },
              ].map(item => (

                <div key={item.label} className="rounded-[14px] py-3 px-2" style={{ background: "#1a1a1a" }}>
                  <p className="text-base font-black" style={{ color: item.color }}>{item.val}</p>
                  <p className="text-[9px] font-bold text-white/30 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-5 pt-4" style={{ paddingBottom: 'calc(2rem + var(--safe-area-bottom))' }}>
          <button
            onClick={handleConfirm}
            className="w-full h-14 rounded-[18px] text-base font-black text-white transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg,#2563eb,#6366f1)", boxShadow: "0 8px 24px rgba(59,130,246,0.35)" }}
          >
            {t("nutrition.search.add_to", { meal: mealLabel })}
          </button>
        </div>
      </div>
    );
  }

  //  MAIN SEARCH SCREEN 
  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: "#000" }}
    >
      {/*  TOP BAR  */}
      <div className="px-5 pb-3" style={{ paddingTop: 'calc(1.5rem + var(--safe-area-top))' }}>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "#1a1a1a" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5"
                 strokeLinecap="round" className="w-4 h-4">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
          <div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t("nutrition.search.add_food")}</p>
            <p className="text-sm font-bold text-white">{mealLabel}</p>
          </div>
        </div>

        {/*  SEGMENTED TABS  */}
        <div
          className="flex p-1 rounded-[14px]"
          style={{ background: "#111" }}
        >
          {[
            { id: "search", label: t("nutrition.search.search_tab") },
            { id: "scan",   label: t("nutrition.search.scan_tab") },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 h-9 rounded-[11px] text-xs font-bold transition-all duration-200"
              style={
                tab === t.id
                  ? { background: "linear-gradient(135deg,#1e40af,#4f46e5)", color: "#fff" }
                  : { color: "rgba(255,255,255,0.4)" }
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/*  CONTENT  */}
      <div className="flex-1 overflow-y-auto px-5 pb-10">

        {/* Search tab */}
        {tab === "search" && (
          <div className="space-y-3">
            <div className="relative">
              <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"
                   strokeLinecap="round" className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                type="search"
                placeholder={t("nutrition.search.placeholder")}
                value={query}
                onChange={handleQueryChange}
                autoFocus
                className="w-full h-12 pl-11 pr-4 rounded-[16px] text-sm font-medium text-white outline-none"
                style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)" }}
              />
            </div>

            {/* Source info bar */}
            <SearchSourcesBar usdaCount={usdaCount} offCount={offCount} loading={loading} />

            {loading && <SearchSkeleton />}

            {apiError && !loading && (
              <div
                className="text-xs text-center py-3 px-4 rounded-[14px] font-medium"
                style={{ background: "rgba(239,68,68,0.08)", color: "#f87171" }}
              >
                {apiError}
              </div>
            )}

            {!loading && !apiError && results.length === 0 && query.length > 2 && (
              <div className="py-10 text-center text-white/30 text-sm">
                {t("nutrition.search.no_results", { query })}
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-2">
                {results.map((food, i) => (
                  <FoodResultCard key={`${food.source}-${i}`} food={food} onSelect={handleSelectFood} />
                ))}
              </div>
            )}

            {!query && !loading && results.length === 0 && (
              <div className="py-12 flex flex-col items-center gap-4 text-center">
                <span className="text-5xl">🍽️</span>
                <div>
                  <p className="text-sm text-white/40 font-medium mb-3">
                    {t("nutrition.search.search_prompt")}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[t("nutrition.search.usda_label"), t("nutrition.search.off_label")].map(label => (
                      <span
                        key={label}
                        className="text-[10px] font-bold px-3 py-1.5 rounded-full"
                        style={{ background: "#111", color: "rgba(255,255,255,0.3)" }}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-white/20 mt-3 whitespace-pre-line">
                    {t("nutrition.search.databases_info")}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scanner tab */}
        {tab === "scan" && (
          <ScannerSection onDetected={handleBarcode} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

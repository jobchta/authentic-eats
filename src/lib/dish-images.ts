// Maps cuisine types and dish names to local food images for rich visual cards
import dishRamen from "@/assets/dish-ramen.jpg";
import dishTacos from "@/assets/dish-tacos.jpg";
import dishButterChicken from "@/assets/dish-butter-chicken.jpg";
import dishCroissant from "@/assets/dish-croissant.jpg";
import dishPadthai from "@/assets/dish-padthai.jpg";
import dishEthiopian from "@/assets/dish-ethiopian.jpg";
import dishPizza from "@/assets/dish-pizza.jpg";
import dishCeviche from "@/assets/dish-ceviche.jpg";
import dishBibimbap from "@/assets/dish-bibimbap.jpg";
import dishKebab from "@/assets/dish-kebab.jpg";
import dishMoussaka from "@/assets/dish-moussaka.jpg";
import dishPekingDuck from "@/assets/dish-peking-duck.jpg";
import dishAsado from "@/assets/dish-asado.jpg";
import dishTagine from "@/assets/dish-tagine.jpg";
import dishPho from "@/assets/dish-pho.jpg";
import dishPaella from "@/assets/dish-paella.jpg";

// Name-based matching (partial, case-insensitive)
const nameMap: Record<string, string> = {
  ramen: dishRamen,
  tacos: dishTacos,
  "al pastor": dishTacos,
  "butter chicken": dishButterChicken,
  tikka: dishButterChicken,
  croissant: dishCroissant,
  "pad thai": dishPadthai,
  "doro wat": dishEthiopian,
  injera: dishEthiopian,
  pizza: dishPizza,
  margherita: dishPizza,
  ceviche: dishCeviche,
  bibimbap: dishBibimbap,
  kebab: dishKebab,
  adana: dishKebab,
  moussaka: dishMoussaka,
  "peking duck": dishPekingDuck,
  asado: dishAsado,
  tagine: dishTagine,
  pho: dishPho,
  "phở": dishPho,
  paella: dishPaella,
  biryani: dishButterChicken,
  masala: dishButterChicken,
  dosa: dishButterChicken,
  curry: dishButterChicken,
  sushi: dishRamen,
  tempura: dishRamen,
  "tom yum": dishPadthai,
  "green curry": dishPadthai,
  "som tam": dishPadthai,
  empanada: dishAsado,
  chimichurri: dishAsado,
  couscous: dishTagine,
  feijoada: dishAsado,
  "banh mi": dishPho,
  bun: dishPho,
  gyoza: dishRamen,
  carbonara: dishPizza,
  risotto: dishPizza,
  tapas: dishPaella,
  souvlaki: dishMoussaka,
  hummus: dishKebab,
  falafel: dishKebab,
  shawarma: dishKebab,
};

// Cuisine-type fallback
const cuisineMap: Record<string, string> = {
  japanese: dishRamen,
  mexican: dishTacos,
  indian: dishButterChicken,
  french: dishCroissant,
  thai: dishPadthai,
  ethiopian: dishEthiopian,
  italian: dishPizza,
  peruvian: dishCeviche,
  korean: dishBibimbap,
  turkish: dishKebab,
  greek: dishMoussaka,
  chinese: dishPekingDuck,
  argentine: dishAsado,
  moroccan: dishTagine,
  vietnamese: dishPho,
  spanish: dishPaella,
  lebanese: dishKebab,
  middle_eastern: dishKebab,
  brazilian: dishAsado,
  indonesian: dishPadthai,
  filipino: dishPadthai,
  colombian: dishCeviche,
  ecuadorian: dishCeviche,
  australian: dishAsado,
  british: dishCroissant,
  german: dishMoussaka,
  portuguese: dishPaella,
};

// Gradient fallbacks by continent for dishes without images
export const continentGradients: Record<string, string> = {
  Asia: "from-amber-900 via-orange-800 to-yellow-900",
  Europe: "from-rose-900 via-burgundy to-slate-800",
  Americas: "from-emerald-900 via-teal-800 to-cyan-900",
  Africa: "from-orange-900 via-amber-800 to-yellow-800",
  Oceania: "from-purple-900 via-indigo-800 to-blue-900",
  "North America": "from-blue-900 via-slate-800 to-indigo-900",
  "South America": "from-emerald-900 via-teal-800 to-cyan-900",
};

export function getDishImage(dishName: string, cuisineType: string): string | null {
  const lowerName = dishName.toLowerCase();

  // Try name-based match first
  for (const [key, img] of Object.entries(nameMap)) {
    if (lowerName.includes(key)) return img;
  }

  // Try cuisine-type match
  const lowerCuisine = cuisineType.toLowerCase();
  for (const [key, img] of Object.entries(cuisineMap)) {
    if (lowerCuisine.includes(key)) return img;
  }

  return null;
}

// Get all images as an array for cycling through
export const allDishImages = [
  dishRamen, dishTacos, dishButterChicken, dishCroissant,
  dishPadthai, dishEthiopian, dishPizza, dishCeviche,
  dishBibimbap, dishKebab, dishMoussaka, dishPekingDuck,
  dishAsado, dishTagine, dishPho, dishPaella,
];

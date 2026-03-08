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

export type Dish = {
  id: string;
  name: string;
  cuisine: string;
  country: string;
  city: string;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  region: string;
  tags: string[];
  trending?: boolean;
  promoted?: boolean;
};

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  city: string;
  country: string;
  rating: number;
  reviews: number;
  tier: "Legendary" | "Exceptional" | "Outstanding" | "Remarkable";
  speciality: string;
  priceRange: string;
  region: string;
};

export type Cuisine = {
  name: string;
  emoji: string;
  count: number;
  region: string;
};

export type Region = {
  name: string;
  dishCount: number;
  restaurantCount: number;
  topCity: string;
};

export const dishes: Dish[] = [
  { id: "1", name: "Tonkotsu Ramen", cuisine: "Japanese", country: "Japan", city: "Tokyo", rating: 4.9, reviews: 18420, image: dishRamen, description: "Rich pork bone broth simmered for 18 hours with chashu, ajitama egg, and handmade noodles", region: "Asia", tags: ["soup", "noodles", "comfort"], trending: true },
  { id: "2", name: "Tacos al Pastor", cuisine: "Mexican", country: "Mexico", city: "Mexico City", rating: 4.8, reviews: 24100, image: dishTacos, description: "Spit-grilled marinated pork with pineapple, cilantro, and salsa verde on corn tortillas", region: "Americas", tags: ["street food", "grilled", "spicy"], trending: true },
  { id: "3", name: "Butter Chicken", cuisine: "Indian", country: "India", city: "Delhi", rating: 4.9, reviews: 31200, image: dishButterChicken, description: "Tender tandoori chicken in a velvety tomato-cream sauce with aromatic spices and butter", region: "Asia", tags: ["curry", "creamy", "comfort"], trending: true },
  { id: "4", name: "Croissant au Beurre", cuisine: "French", country: "France", city: "Paris", rating: 4.7, reviews: 15800, image: dishCroissant, description: "72-hour laminated dough, pure AOP French butter, golden and impossibly flaky", region: "Europe", tags: ["pastry", "breakfast", "bakery"], promoted: true },
  { id: "5", name: "Pad Thai Goong", cuisine: "Thai", country: "Thailand", city: "Bangkok", rating: 4.8, reviews: 19300, image: dishPadthai, description: "Wok-fired rice noodles with tiger prawns, tamarind, peanuts, and fresh lime", region: "Asia", tags: ["noodles", "street food", "sweet-sour"] },
  { id: "6", name: "Doro Wat", cuisine: "Ethiopian", country: "Ethiopia", city: "Addis Ababa", rating: 4.7, reviews: 8900, image: dishEthiopian, description: "Spiced chicken stew slow-cooked with berbere and served on spongy injera flatbread", region: "Africa", tags: ["stew", "spicy", "traditional"] },
  { id: "7", name: "Pizza Margherita", cuisine: "Italian", country: "Italy", city: "Naples", rating: 4.9, reviews: 42300, image: dishPizza, description: "San Marzano tomatoes, fior di latte, fresh basil, extra virgin olive oil, wood-fired at 485°C", region: "Europe", tags: ["classic", "cheese", "wood-fired"], trending: true },
  { id: "8", name: "Ceviche de Corvina", cuisine: "Peruvian", country: "Peru", city: "Lima", rating: 4.8, reviews: 14600, image: dishCeviche, description: "Fresh sea bass cured in tiger's milk with red onion, choclo corn, and sweet potato", region: "Americas", tags: ["seafood", "raw", "citrus"] },
  { id: "9", name: "Dolsot Bibimbap", cuisine: "Korean", country: "South Korea", city: "Seoul", rating: 4.8, reviews: 16700, image: dishBibimbap, description: "Sizzling stone pot rice with seasoned vegetables, gochujang, and a crispy egg", region: "Asia", tags: ["rice", "spicy", "colorful"], trending: true },
  { id: "10", name: "Adana Kebab", cuisine: "Turkish", country: "Turkey", city: "Istanbul", rating: 4.7, reviews: 13200, image: dishKebab, description: "Hand-minced lamb charcoal-grilled on flat skewers with sumac onions and lavash", region: "Middle East", tags: ["grilled", "meat", "traditional"] },
  { id: "11", name: "Moussaka", cuisine: "Greek", country: "Greece", city: "Athens", rating: 4.6, reviews: 11400, image: dishMoussaka, description: "Layers of silky eggplant, spiced lamb ragù, and golden béchamel baked to perfection", region: "Europe", tags: ["baked", "comfort", "layered"] },
  { id: "12", name: "Peking Duck", cuisine: "Chinese", country: "China", city: "Beijing", rating: 4.9, reviews: 28900, image: dishPekingDuck, description: "Air-dried and roasted until lacquered, served with thin pancakes, hoisin, and scallion", region: "Asia", tags: ["roasted", "classic", "celebratory"], trending: true },
  { id: "13", name: "Asado", cuisine: "Argentine", country: "Argentina", city: "Buenos Aires", rating: 4.8, reviews: 17500, image: dishAsado, description: "Slow-grilled beef ribs over wood embers with chimichurri and crusty bread", region: "Americas", tags: ["grilled", "beef", "social"] },
  { id: "14", name: "Lamb Tagine", cuisine: "Moroccan", country: "Morocco", city: "Marrakech", rating: 4.7, reviews: 10200, image: dishTagine, description: "Slow-braised lamb with preserved lemons, apricots, almonds, and fragrant ras el hanout", region: "Africa", tags: ["slow-cooked", "sweet-savory", "aromatic"] },
  { id: "15", name: "Phở Bò", cuisine: "Vietnamese", country: "Vietnam", city: "Hanoi", rating: 4.9, reviews: 22100, image: dishPho, description: "24-hour bone broth with rare beef, rice noodles, star anise, cinnamon, and fresh herbs", region: "Asia", tags: ["soup", "noodles", "aromatic"], trending: true },
  { id: "16", name: "Paella Valenciana", cuisine: "Spanish", country: "Spain", city: "Valencia", rating: 4.8, reviews: 19800, image: dishPaella, description: "Saffron-infused bomba rice with seafood, slow-cooked over orange wood for socarrat", region: "Europe", tags: ["rice", "seafood", "saffron"] },
];

export const restaurants: Restaurant[] = [
  { id: "r1", name: "Sukiyabashi Jiro", cuisine: "Japanese", city: "Tokyo", country: "Japan", rating: 4.97, reviews: 12400, tier: "Legendary", speciality: "Omakase Sushi", priceRange: "$$$$", region: "Asia" },
  { id: "r2", name: "Pujol", cuisine: "Mexican", city: "Mexico City", country: "Mexico", rating: 4.93, reviews: 8900, tier: "Legendary", speciality: "Mole Madre", priceRange: "$$$$", region: "Americas" },
  { id: "r3", name: "Gaggan Anand", cuisine: "Indian", city: "Bangkok", country: "Thailand", rating: 4.95, reviews: 7600, tier: "Legendary", speciality: "Progressive Indian", priceRange: "$$$$", region: "Asia" },
  { id: "r4", name: "Septime", cuisine: "French", city: "Paris", country: "France", rating: 4.88, reviews: 9200, tier: "Exceptional", speciality: "Neo-Bistro", priceRange: "$$$", region: "Europe" },
  { id: "r5", name: "Noma", cuisine: "Nordic", city: "Copenhagen", country: "Denmark", rating: 4.96, reviews: 11300, tier: "Legendary", speciality: "New Nordic", priceRange: "$$$$", region: "Europe" },
  { id: "r6", name: "Central", cuisine: "Peruvian", city: "Lima", country: "Peru", rating: 4.94, reviews: 7800, tier: "Legendary", speciality: "Altitude Cuisine", priceRange: "$$$$", region: "Americas" },
  { id: "r7", name: "Den", cuisine: "Japanese", city: "Tokyo", country: "Japan", rating: 4.91, reviews: 6500, tier: "Exceptional", speciality: "Inventive Japanese", priceRange: "$$$$", region: "Asia" },
  { id: "r8", name: "Asador Etxebarri", cuisine: "Basque", city: "Atxondo", country: "Spain", rating: 4.92, reviews: 5400, tier: "Legendary", speciality: "Open-Flame Grill", priceRange: "$$$$", region: "Europe" },
  { id: "r9", name: "Karavalli", cuisine: "Indian", city: "Bangalore", country: "India", rating: 4.85, reviews: 14200, tier: "Outstanding", speciality: "Coastal Karnataka", priceRange: "$$", region: "Asia" },
  { id: "r10", name: "La Cabrera", cuisine: "Argentine", city: "Buenos Aires", country: "Argentina", rating: 4.82, reviews: 18900, tier: "Outstanding", speciality: "Parrilla Steak", priceRange: "$$", region: "Americas" },
  { id: "r11", name: "Dishoom", cuisine: "Indian", city: "London", country: "UK", rating: 4.86, reviews: 32100, tier: "Exceptional", speciality: "Bombay Café", priceRange: "$$", region: "Europe" },
  { id: "r12", name: "Tim Ho Wan", cuisine: "Chinese", city: "Hong Kong", country: "China", rating: 4.84, reviews: 41200, tier: "Outstanding", speciality: "Dim Sum", priceRange: "$", region: "Asia" },
  { id: "r13", name: "Le Comptoir de la Gastronomie", cuisine: "French", city: "Paris", country: "France", rating: 4.78, reviews: 8700, tier: "Remarkable", speciality: "Foie Gras & Cassoulet", priceRange: "$$$", region: "Europe" },
  { id: "r14", name: "Bún Chả Hương Liên", cuisine: "Vietnamese", city: "Hanoi", country: "Vietnam", rating: 4.83, reviews: 25600, tier: "Outstanding", speciality: "Bún Chả (Obama visited)", priceRange: "$", region: "Asia" },
  { id: "r15", name: "Reem Al Bawadi", cuisine: "Emirati", city: "Dubai", country: "UAE", rating: 4.79, reviews: 9800, tier: "Remarkable", speciality: "Grilled Meats & Mezze", priceRange: "$$", region: "Middle East" },
  { id: "r16", name: "Yardbird", cuisine: "Japanese", city: "Hong Kong", country: "China", rating: 4.87, reviews: 11900, tier: "Exceptional", speciality: "Yakitori", priceRange: "$$$", region: "Asia" },
];

export const cuisines: Cuisine[] = [
  { name: "Italian", emoji: "🇮🇹", count: 2840, region: "Europe" },
  { name: "Japanese", emoji: "🇯🇵", count: 2120, region: "Asia" },
  { name: "Mexican", emoji: "🇲🇽", count: 1950, region: "Americas" },
  { name: "Indian", emoji: "🇮🇳", count: 1870, region: "Asia" },
  { name: "French", emoji: "🇫🇷", count: 1640, region: "Europe" },
  { name: "Thai", emoji: "🇹🇭", count: 1520, region: "Asia" },
  { name: "Chinese", emoji: "🇨🇳", count: 2350, region: "Asia" },
  { name: "Ethiopian", emoji: "🇪🇹", count: 680, region: "Africa" },
  { name: "Korean", emoji: "🇰🇷", count: 1280, region: "Asia" },
  { name: "Peruvian", emoji: "🇵🇪", count: 890, region: "Americas" },
  { name: "Turkish", emoji: "🇹🇷", count: 1100, region: "Middle East" },
  { name: "Greek", emoji: "🇬🇷", count: 960, region: "Europe" },
  { name: "Vietnamese", emoji: "🇻🇳", count: 1340, region: "Asia" },
  { name: "Spanish", emoji: "🇪🇸", count: 1420, region: "Europe" },
  { name: "Moroccan", emoji: "🇲🇦", count: 740, region: "Africa" },
  { name: "Argentine", emoji: "🇦🇷", count: 820, region: "Americas" },
  { name: "Lebanese", emoji: "🇱🇧", count: 980, region: "Middle East" },
  { name: "Brazilian", emoji: "🇧🇷", count: 1150, region: "Americas" },
  { name: "Nigerian", emoji: "🇳🇬", count: 560, region: "Africa" },
  { name: "Indonesian", emoji: "🇮🇩", count: 920, region: "Asia" },
  { name: "Georgian", emoji: "🇬🇪", count: 480, region: "Europe" },
  { name: "Filipino", emoji: "🇵🇭", count: 670, region: "Asia" },
  { name: "Jamaican", emoji: "🇯🇲", count: 410, region: "Americas" },
  { name: "Swedish", emoji: "🇸🇪", count: 380, region: "Europe" },
];

export const regions: Region[] = [
  { name: "Asia", dishCount: 12400, restaurantCount: 4200, topCity: "Tokyo" },
  { name: "Europe", dishCount: 9800, restaurantCount: 3600, topCity: "Paris" },
  { name: "Americas", dishCount: 7600, restaurantCount: 2800, topCity: "Mexico City" },
  { name: "Middle East", dishCount: 4200, restaurantCount: 1500, topCity: "Istanbul" },
  { name: "Africa", dishCount: 2800, restaurantCount: 900, topCity: "Marrakech" },
  { name: "Oceania", dishCount: 1600, restaurantCount: 620, topCity: "Melbourne" },
];

export const stats = {
  dishes: 38400,
  restaurants: 13620,
  cities: 2840,
  countries: 195,
  reviews: 2400000,
  contributors: 184000,
};

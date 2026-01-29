export interface FoodItem {
  id: string;
  label: string;
  nameAr?: string;
  sourceType: "outside" | "home" | "both";
  kcal: number;
  price: number;
  currency: "KWD" | "EGP";
  defaultServingDescription: string;
  r2Key?: string;
}

export const SEED_FOOD_ITEMS: FoodItem[] = [
  {
    id: "half-chicken-rice-fries",
    label: "Half grilled chicken + rice & fries",
    nameAr: "نصف دجاج مشوي على الفحم مع رز وبطاطا",
    sourceType: "outside",
    kcal: 1150,
    price: 1.5,
    currency: "KWD",
    defaultServingDescription:
      "Restaurant plate: ~1/2 grilled chicken with rice, small fries and salad (e.g. Abu Tareq, Farwaniya).",
  },
  {
    id: "hawawshi",
    label: "Hawawshi",
    nameAr: "حواوشي",
    sourceType: "both",
    kcal: 650,
    price: 0.5,
    currency: "KWD",
    defaultServingDescription:
      "One piece of hawawshi (flat bread stuffed with minced meat, onions and spices).",
  },
  {
    id: "koshary-small",
    label: "Koshary – small portion",
    nameAr: "كشري – حجم صغير",
    sourceType: "outside",
    kcal: 800,
    price: 0.5,
    currency: "KWD",
    defaultServingDescription:
      "Takeaway cup of koshary (small): rice, pasta, lentils, chickpeas, fried onions and tomato sauce.",
  },
  {
    id: "fried-liver-bread",
    label: "Fried liver with bread & salad",
    nameAr: "كبدة مقلية بالعيش والسلطة",
    sourceType: "outside",
    kcal: 620,
    price: 0.5,
    currency: "KWD",
    defaultServingDescription:
      "Plate with fried liver slices, some bread and salad (street-style liver dish).",
  },
];

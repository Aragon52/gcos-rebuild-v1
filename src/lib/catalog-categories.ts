/** Maps sourced product text onto the storefront's curated category list. */

export const STOREFRONT_CATEGORIES = [
  "GC-Special",
  "Men's Fashion",
  "Women's Fashion",
  "Shoes",
  "Bags & Accessories",
  "Watches",
  "Home & Kitchen",
  "Beauty & Personal Care",
  "Health & Wellness",
  "Pet Supplies",
  "Electronics & Gadgets",
  "Toys & Games",
  "Sports & Outdoors",
] as const;

export type StorefrontCategory = (typeof STOREFRONT_CATEGORIES)[number];

const KEYWORDS: Record<StorefrontCategory, string[]> = {
  "GC-Special": [],
  "Men's Fashion": ["men", "mens", "shirt", "hoodie", "jacket", "trousers", "suit", "tie", "menswear", "polo"],
  "Women's Fashion": ["women", "womens", "dress", "skirt", "blouse", "legging", "lingerie", "gown", "womenswear"],
  Shoes: ["shoe", "sneaker", "boot", "sandal", "loafer", "heels", "footwear", "slipper", "trainer"],
  "Bags & Accessories": ["bag", "backpack", "wallet", "purse", "belt", "tote", "luggage", "sunglass", "hat", "scarf", "jewel", "necklace", "earring", "bracelet", "ring"],
  Watches: ["watch", "timepiece", "chronograph", "smartwatch"],
  "Home & Kitchen": ["kitchen", "home", "furniture", "cookware", "mug", "bedding", "pillow", "lamp", "decor", "towel", "storage", "vacuum", "chair", "table", "candle"],
  "Beauty & Personal Care": ["beauty", "skincare", "serum", "makeup", "lipstick", "shampoo", "fragrance", "perfume", "cosmetic", "lotion", "razor", "hair"],
  "Health & Wellness": ["health", "wellness", "supplement", "vitamin", "massage", "therapy", "sleep", "medical", "first aid"],
  "Pet Supplies": ["pet", "dog", "cat", "puppy", "kitten", "leash", "aquarium", "litter"],
  "Electronics & Gadgets": ["electronic", "gadget", "headphone", "earbud", "speaker", "charger", "laptop", "phone", "camera", "keyboard", "mouse", "monitor", "tablet", "drone", "cable", "power bank", "bluetooth"],
  "Toys & Games": ["toy", "game", "puzzle", "lego", "board game", "plush", "doll", "figure", "console"],
  "Sports & Outdoors": ["sport", "outdoor", "fitness", "yoga", "camping", "hiking", "bike", "cycling", "running", "gym", "dumbbell", "tent", "fishing", "golf"],
};

/** Picks the best storefront category for a sourced product from its text signals. */
export function suggestCategory(...signals: (string | undefined | null)[]): StorefrontCategory {
  const haystack = signals.filter(Boolean).join(" ").toLowerCase();
  let best: StorefrontCategory = "GC-Special";
  let bestScore = 0;

  for (const category of STOREFRONT_CATEGORIES) {
    let score = 0;
    for (const keyword of KEYWORDS[category]) {
      if (haystack.includes(keyword)) score += keyword.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = category;
    }
  }

  return best;
}

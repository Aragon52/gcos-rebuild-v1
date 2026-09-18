import { createContext, useContext } from "react";
import type { Product, Category } from "@/lib/types";
import { useDbProducts, useDbCategories } from "@/hooks/use-db-products";

export interface ProductsContextType {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
}

export const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  "gc-special": "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=200&h=200",
  "men's-fashion": "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=200&h=200",
  "mens-fashion": "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=200&h=200",
  "women's-fashion": "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=200&h=200",
  "womens-fashion": "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=200&h=200",
  "home-&-kitchen": "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=200&h=200",
  "home-kitchen": "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=200&h=200",
  "beauty-&-personal-care": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=200&h=200",
  "pet-supplies": "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=200&h=200",
  "electronics-&-gadgets": "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=200&h=200",
  "toys-&-games": "https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=200&h=200",
  "sports-&-outdoors": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=200&h=200",
  "bags-&-accessories": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=200&h=200",
  watches: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=200&h=200",
  "health-&-wellness": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=200&h=200",
  shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&h=200",
};

const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

export function getCategoryImage(slug: string, providedImage?: string, products?: Product[], categoryName?: string): string {
  if (providedImage && providedImage.trim() !== "" && !providedImage.includes("placeholder.svg") && providedImage.startsWith("http")) {
    return providedImage;
  }

  // Prefer the curated, label-accurate category picture
  const curated = CATEGORY_DEFAULT_IMAGES[slug] || CATEGORY_DEFAULT_IMAGES[slug.replace(/&-/g, "")];
  if (curated) return curated;

  // Otherwise use a product image from the inventory for this category (slug-normalized match)
  if (products && categoryName) {
    const catSlug = slugify(categoryName);
    const productWithImage = products.find(p =>
      p.category && slugify(p.category) === catSlug && p.image && p.image.startsWith("http")
    );
    if (productWithImage) {
      return productWithImage.image;
    }
  }

  return "";
}

export function mapCategories(dbCategories: Record<string, unknown>[], products?: Product[]): Category[] {
  return dbCategories.map((c) => {
    const name = String(c.name || "");
    const slug = c.slug ? String(c.slug) : name.toLowerCase().replace(/\s+/g, '-');
    const count = products
      ? products.filter(p => (p.category || "").toLowerCase().replace(/\s+/g, '-') === slug).length
      : Number(c.product_count ?? 0);
    return {
      id: String(c.id),
      name,
      slug,
      image: getCategoryImage(slug, String(c.image ?? ""), products, name),
      count,
    };
  });
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  const { data: dbProducts, isLoading: loadingP } = useDbProducts();
  const { data: dbCategories, isLoading: loadingC } = useDbCategories();

  if (ctx) return ctx;

  const products = dbProducts ?? [];
  const mappedCategories = mapCategories((dbCategories ?? []) as Record<string, unknown>[], products);

  // Derive any categories that exist in products but not in dbCategories
  const uniqueCategorySlugs = new Set(mappedCategories.map(c => c.slug));
  const derivedCategoriesMap = new Map<string, Category>();
  
  products.forEach(p => {
    const pCategory = p.category || "Uncategorized";
    const slug = pCategory.toLowerCase().replace(/\s+/g, '-');
    if (!uniqueCategorySlugs.has(slug)) {
      const existing = derivedCategoriesMap.get(slug);
      if (!existing) {
        derivedCategoriesMap.set(slug, {
          id: slug,
          name: pCategory, // Use the first encountered case variant
          slug: slug,
          image: getCategoryImage(slug, "", products, pCategory),
          count: 1
        });
      } else {
        existing.count = (existing.count || 0) + 1;
      }
    }
  });
  
  const derivedCategories = Array.from(derivedCategoriesMap.values());

  const categories = [...mappedCategories, ...derivedCategories];

  return {
    products,
    categories,
    isLoading: loadingP || loadingC,
  } satisfies ProductsContextType;
}

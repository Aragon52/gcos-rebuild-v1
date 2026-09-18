import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Search, Sparkles, ExternalLink } from "lucide-react";
import { searchGlobalCatalog, type SourcedProduct } from "@/lib/catalog-sourcing.functions";
import { STOREFRONT_CATEGORIES } from "@/lib/catalog-categories";
import { useProductMutations } from "@/hooks/use-db-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const formatPrice = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(amount);

export function SourceProductsDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SourcedProduct[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [categoryOverrides, setCategoryOverrides] = useState<Record<string, string>>({});
  const [isImporting, setIsImporting] = useState(false);

  const search = useServerFn(searchGlobalCatalog);
  const { bulkSyncProducts } = useProductMutations();

  const selectedIds = Object.keys(selected).filter((id) => selected[id]);

  const runSearch = async () => {
    if (query.trim().length < 2) return;
    setIsSearching(true);
    try {
      const parsedMax = Number.parseFloat(maxPrice);
      const response = await search({
        data: {
          query: query.trim(),
          limit: 24,
          ...(Number.isFinite(parsedMax) && parsedMax > 0 ? { maxPrice: parsedMax } : {}),
        },
      });
      setResults(response.products);
      setSelected(Object.fromEntries(response.products.map((p) => [p.sourceId, true])));
      setCategoryOverrides({});
      if (response.products.length === 0) {
        toast({ title: "No products found", description: "Try a different search term." });
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Could not reach the product catalog.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const importSelected = async () => {
    const chosen = results.filter((p) => selected[p.sourceId]);
    if (chosen.length === 0) return;
    setIsImporting(true);
    try {
      await bulkSyncProducts.mutateAsync(
        chosen.map((p) => ({
          id: `src-${p.sourceId.split("/").pop()}`,
          name: p.name,
          price: p.price,
          image: p.image,
          description: p.description,
          category: categoryOverrides[p.sourceId] ?? p.category,
          sku: p.sku,
          stock: 50,
          inStock: true,
          seller: p.seller,
        })),
      );
      setOpen(false);
      setResults([]);
      setSelected({});
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 h-8">
          <Sparkles className="h-3.5 w-3.5" />
          Source products
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Source products</DialogTitle>
          <DialogDescription>
            Search live products from stores across the Shopify network, then add the ones you want to your inventory
            with their real photo, description, price and category.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="For example: wireless earbuds, yoga mat, dog bed"
              className="pl-8"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="source-max-price" className="text-xs text-muted-foreground whitespace-nowrap">
              Max price
            </Label>
            <Input
              id="source-max-price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              inputMode="decimal"
              placeholder="Any"
              className="w-24"
            />
          </div>
          <Button onClick={runSearch} disabled={isSearching || query.trim().length < 2} className="gap-1.5">
            {isSearching ? <LoadingSpinner size={14} /> : <Search className="h-4 w-4" />}
            Search
          </Button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
          {results.map((product) => (
            <div key={product.sourceId} className="flex gap-3 rounded-lg border p-2.5">
              <Checkbox
                checked={Boolean(selected[product.sourceId])}
                onCheckedChange={(checked) =>
                  setSelected((prev) => ({ ...prev, [product.sourceId]: checked === true }))
                }
                className="mt-1"
              />
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="h-16 w-16 rounded object-cover bg-muted shrink-0"
                />
              ) : (
                <div className="h-16 w-16 rounded bg-muted shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {formatPrice(product.price, product.currency)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{product.description}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Select
                    value={categoryOverrides[product.sourceId] ?? product.category}
                    onValueChange={(value) =>
                      setCategoryOverrides((prev) => ({ ...prev, [product.sourceId]: value }))
                    }
                  >
                    <SelectTrigger className="h-7 w-52 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STOREFRONT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category} className="text-xs">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {product.seller && (
                    <span className="text-[11px] text-muted-foreground truncate">by {product.seller}</span>
                  )}
                  {product.sourceUrl && (
                    <a
                      href={product.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={`Open ${product.name} at the source store`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
          {results.length === 0 && !isSearching && (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Search to see products you can add to your inventory.
            </p>
          )}
        </div>

        <DialogFooter className="items-center sm:justify-between">
          <span className="text-xs text-muted-foreground">{selectedIds.length} selected</span>
          <Button onClick={importSelected} disabled={isImporting || selectedIds.length === 0} className="gap-1.5">
            {isImporting && <LoadingSpinner size={14} />}
            Add to inventory
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

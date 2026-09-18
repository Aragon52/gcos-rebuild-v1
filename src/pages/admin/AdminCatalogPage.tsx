import { useMemo, useState } from "react";
import { Search, PackagePlus, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDbProducts, useProductMutations } from "@/hooks/use-db-products";
import { SourceProductsDialog } from "@/components/admin/SourceProductsDialog";
import type { Product } from "@/lib/types";

const PAGE_SIZE = 40;

type StockFilter = "all" | "in-stock" | "low" | "out";
type OriginFilter = "sourced" | "all";

/** Products pulled in from the global catalog carry these id / sku prefixes. */
function isSourced(product: Product): boolean {
  return (
    String(product.id).startsWith("src-") ||
    String(product.sku || "").startsWith("SHC-")
  );
}

function stockLabel(stock: number): { label: string; tone: string } {
  if (stock <= 0) return { label: "Out of stock", tone: "bg-destructive/10 text-destructive" };
  if (stock < 15) return { label: "Low stock", tone: "bg-amber-500/10 text-amber-600" };
  return { label: "In stock", tone: "bg-emerald-500/10 text-emerald-600" };
}

export default function AdminCatalogPage() {
  const { data: products, isLoading } = useDbProducts();
  const { updateProduct } = useProductMutations();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [origin, setOrigin] = useState<OriginFilter>("sourced");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [reorder, setReorder] = useState<Record<string, string>>({});

  const all = useMemo(() => products ?? [], [products]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    all.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [all]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return all.filter((p) => {
      if (origin === "sourced" && !isSourced(p)) return false;
      if (category !== "all" && p.category !== category) return false;

      const stock = Number(p.stock ?? 0);
      if (stockFilter === "in-stock" && stock < 15) return false;
      if (stockFilter === "low" && (stock <= 0 || stock >= 15)) return false;
      if (stockFilter === "out" && stock > 0) return false;

      if (!term) return true;
      return (
        p.name.toLowerCase().includes(term) ||
        String(p.sku || "").toLowerCase().includes(term) ||
        String(p.seller || "").toLowerCase().includes(term)
      );
    });
  }, [all, origin, category, stockFilter, search]);

  const rows = filtered.slice(0, visible);

  const totalUnits = filtered.reduce((sum, p) => sum + Number(p.stock ?? 0), 0);
  const outOfStock = filtered.filter((p) => Number(p.stock ?? 0) <= 0).length;

  const handleRestock = async (product: Product) => {
    const raw = reorder[product.id];
    const qty = Number(raw);
    if (!raw || Number.isNaN(qty) || qty <= 0) return;
    const nextStock = Number(product.stock ?? 0) + qty;
    await updateProduct.mutateAsync({
      id: product.id,
      stock: nextStock,
      inStock: nextStock > 0,
    });
    setReorder((prev) => ({ ...prev, [product.id]: "" }));
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setStockFilter("all");
    setOrigin("sourced");
    setVisible(PAGE_SIZE);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product catalog</h1>
          <p className="text-sm text-muted-foreground">
            Everything sourced into your store, with live stock resellers can sell from.
          </p>
        </div>
        <SourceProductsDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products listed</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{filtered.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Units available</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{totalUnits.toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Out of stock</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{outOfStock}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisible(PAGE_SIZE);
                }}
                placeholder="Search by name, SKU or store"
                className="pl-9"
              />
            </div>

            <Select
              value={origin}
              onValueChange={(v) => {
                setOrigin(v as OriginFilter);
                setVisible(PAGE_SIZE);
              }}
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sourced">Sourced products</SelectItem>
                <SelectItem value="all">All products</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={category}
              onValueChange={(v) => {
                setCategory(v);
                setVisible(PAGE_SIZE);
              }}
            >
              <SelectTrigger className="w-[190px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={stockFilter}
              onValueChange={(v) => {
                setStockFilter(v as StockFilter);
                setVisible(PAGE_SIZE);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any stock level</SelectItem>
                <SelectItem value="in-stock">In stock</SelectItem>
                <SelectItem value="low">Low stock</SelectItem>
                <SelectItem value="out">Out of stock</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={resetFilters}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[230px]">Reorder quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Loading catalog…
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No products match these filters.
                    </TableCell>
                  </TableRow>
                )}

                {rows.map((product) => {
                  const stock = Number(product.stock ?? 0);
                  const status = stockLabel(stock);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            loading="lazy"
                            className="h-10 w-10 rounded-md object-cover bg-muted"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium max-w-[320px]">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.sku || "No SKU"}
                              {product.seller ? ` · ${product.seller}` : ""}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{product.category || "—"}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${Number(product.price ?? 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium">{stock}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={status.tone}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={1}
                            inputMode="numeric"
                            placeholder="Qty"
                            value={reorder[product.id] ?? ""}
                            onChange={(e) =>
                              setReorder((prev) => ({ ...prev, [product.id]: e.target.value }))
                            }
                            className="h-9 w-24"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updateProduct.isPending || !reorder[product.id]}
                            onClick={() => handleRestock(product)}
                          >
                            <PackagePlus className="mr-1 h-4 w-4" />
                            Add
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {visible < filtered.length && (
            <div className="mt-4 flex justify-center">
              <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Show more ({filtered.length - visible} left)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

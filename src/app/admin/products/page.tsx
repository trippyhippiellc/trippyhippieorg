"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import {
  Plus, Pencil, Trash2, X, CheckCircle, Image as ImageIcon,
  ChevronUp, ChevronDown, Eye, EyeOff, Search, RefreshCw,
  AlertCircle, ArrowUpDown, ExternalLink,
} from "lucide-react";

function fmt(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}
function makeSlug(text: string): string {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-")
    .replace(/^-+/, "").replace(/-+$/, "");
}

const CATEGORIES   = ["flower","vape","edible","concentrate","topical","accessory","preroll","other"];
const STRAIN_TYPES = ["","sativa","indica","hybrid"];

interface BulkTier { quantity: number; discount_percent: number; label: string; }

interface ProductForm {
  name:                 string;
  slug:                 string;
  description:          string;
  category:             string;
  strain_type:          string;
  price_retail:         string;
  price_wholesale:      string;
  price_compare:        string;
  stock_quantity:       string;
  thca_percentage:      string;
  weight_grams:         string;
  image_url:            string;
  gallery_input:        string;
  images:               string[];
  is_active:            boolean;
  is_featured:          boolean;
  tags:                 string;
  state_restrictions:   string[];
  bulk_tiers:           BulkTier[];
}

const EMPTY: ProductForm = {
  name: "", slug: "", description: "", category: "flower", strain_type: "",
  price_retail: "", price_wholesale: "", price_compare: "",
  stock_quantity: "0", thca_percentage: "", weight_grams: "",
  image_url: "", gallery_input: "", images: [],
  is_active: true, is_featured: false, tags: "", state_restrictions: [],
  bulk_tiers: [
    { quantity: 2, discount_percent: 5,  label: "2 for 5% off"  },
    { quantity: 4, discount_percent: 10, label: "4 for 10% off" },
    { quantity: 8, discount_percent: 15, label: "8 for 15% off" },
  ],
};

interface DBProduct {
  id:                   string;
  name:                 string;
  slug:                 string;
  description:          string | null;
  category:             string;
  strain_type:          string | null;
  price_retail:         number;
  price_wholesale:      number | null;
  price_compare:        number | null;
  stock_quantity:       number;
  thca_percentage:      number | null;
  weight_grams:         number | null;
  images:               string[];
  is_active:            boolean;
  is_featured:          boolean;
  tags:                 string[];
  state_restrictions:   string[] | null;
  bulk_tiers:           BulkTier[];
  created_at:           string;
  average_rating:       number;
  review_count:         number;
}

type SortField = "name" | "price_retail" | "stock_quantity" | "created_at" | "category";
type SortDir   = "asc" | "desc";

export default function AdminProductsPage() {
  const { profile, isLoading } = useAuth();
  const router   = useRouter();
  const supabase = createClient();
  const toast    = useToast();

  useEffect(() => {
    if (isLoading) return;
    if (!profile?.is_admin) router.replace("/not-found");
  }, [isLoading, profile, router]);

  const [products,     setProducts]     = useState<DBProduct[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [form,         setForm]         = useState<ProductForm>(EMPTY);
  const [editingId,    setEditingId]    = useState<string | null>(null);
  const [showForm,     setShowForm]     = useState(false);
  const [slugLocked,   setSlugLocked]   = useState(false);
  const [search,       setSearch]       = useState("");
  const [filterCat,    setFilterCat]    = useState("");
  const [filterStock,  setFilterStock]  = useState<"" | "in" | "out">("");
  const [filterActive, setFilterActive] = useState<"" | "active" | "inactive">("");
  const [sortField,    setSortField]    = useState<SortField>("created_at");
  const [sortDir,      setSortDir]      = useState<SortDir>("desc");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).from("products").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setProducts((data ?? []) as DBProduct[]);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  function setField<K extends keyof ProductForm>(field: K, value: ProductForm[K]) {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === "name" && !slugLocked) next.slug = makeSlug(value as string);
      return next;
    });
  }

  function startEdit(p: DBProduct) {
    setForm({
      name:                 p.name,
      slug:                 p.slug,
      description:          p.description ?? "",
      category:             p.category,
      strain_type:          p.strain_type ?? "",
      price_retail:         String(p.price_retail / 100),
      price_wholesale:      p.price_wholesale != null ? String(p.price_wholesale / 100) : "",
      price_compare:        p.price_compare   != null ? String(p.price_compare   / 100) : "",
      stock_quantity:       String(p.stock_quantity),
      thca_percentage:      p.thca_percentage != null ? String(p.thca_percentage) : "",
      weight_grams:         p.weight_grams    != null ? String(p.weight_grams)    : "",
      image_url:            p.images?.[0] ?? "",
      gallery_input:        "",
      images:               p.images?.slice(1) ?? [],
      is_active:            p.is_active,
      is_featured:          p.is_featured,
      tags:                 (p.tags ?? []).join(", "),
      state_restrictions:   p.state_restrictions ?? [],
      bulk_tiers:           Array.isArray(p.bulk_tiers) && p.bulk_tiers.length > 0 ? p.bulk_tiers : EMPTY.bulk_tiers,
    });
    setEditingId(p.id);
    setSlugLocked(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelForm() { setForm(EMPTY); setEditingId(null); setSlugLocked(false); setShowForm(false); }

  function addGalleryUrl() {
    const url = form.gallery_input.trim();
    if (!url) return;
    if (form.images.includes(url)) { toast.error("URL already in gallery."); return; }
    setForm(prev => ({ ...prev, images: [...prev.images, url], gallery_input: "" }));
  }
  function removeGalleryUrl(idx: number) { setForm(prev => ({ ...prev, images: prev.images.filter((_,i) => i !== idx) })); }
  function moveGalleryUrl(idx: number, dir: "up" | "down") {
    const imgs = [...form.images];
    const to   = dir === "up" ? idx - 1 : idx + 1;
    if (to < 0 || to >= imgs.length) return;
    [imgs[idx], imgs[to]] = [imgs[to], imgs[idx]];
    setForm(prev => ({ ...prev, images: imgs }));
  }

  function updateTier(i: number, field: keyof BulkTier, raw: string) {
    setForm(prev => ({
      ...prev,
      bulk_tiers: prev.bulk_tiers.map((t, idx) => {
        if (idx !== i) return t;
        const val = field === "label" ? raw : (parseFloat(raw) || 0);
        const updated = { ...t, [field]: val };
        if (field !== "label") updated.label = `${updated.quantity} for ${updated.discount_percent}% off`;
        return updated;
      }),
    }));
  }
  function addTier() { setForm(prev => ({ ...prev, bulk_tiers: [...prev.bulk_tiers, { quantity: 2, discount_percent: 5, label: "2 for 5% off" }] })); }
  function removeTier(i: number) { setForm(prev => ({ ...prev, bulk_tiers: prev.bulk_tiers.filter((_,idx) => idx !== i) })); }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim())         { toast.error("Product name is required.");        return; }
    if (!form.price_retail.trim()) { toast.error("Retail price is required.");        return; }
    if (!form.slug.trim())         { toast.error("Slug is required.");                return; }
    const retailCents = Math.round(parseFloat(form.price_retail) * 100);
    if (isNaN(retailCents) || retailCents <= 0) { toast.error("Retail price must be a positive number."); return; }
    setSaving(true);
    const finalSlug = makeSlug(form.slug);
    const payload = {
      name:                 form.name.trim(),
      slug:                 finalSlug,
      description:          form.description.trim() || null,
      category:             form.category,
      strain_type:          form.strain_type || null,
      price_retail:         retailCents,
      price_wholesale:      form.price_wholesale ? Math.round(parseFloat(form.price_wholesale) * 100) : null,
      price_compare:        form.price_compare   ? Math.round(parseFloat(form.price_compare)   * 100) : null,
      stock_quantity:       parseInt(form.stock_quantity) || 0,
      thca_percentage:      form.thca_percentage ? parseFloat(form.thca_percentage) : null,
      weight_grams:         form.weight_grams    ? parseFloat(form.weight_grams)    : null,
      images:               [form.image_url.trim(), ...form.images].filter(Boolean),
      is_active:            form.is_active,
      is_featured:          form.is_featured,
      tags:                 form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      state_restrictions:   form.state_restrictions.length > 0 ? form.state_restrictions : null,
      bulk_tiers:           form.bulk_tiers,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const { data: slugRows } = await db.from("products").select("id").eq("slug", finalSlug);
    const conflict = ((slugRows ?? []) as { id:string }[]).some(r => r.id !== editingId);
    if (conflict) { toast.error(`Slug "${finalSlug}" is already in use.`); setSaving(false); return; }
    let dbError: { message: string } | null = null;
    if (editingId) { ({ error: dbError } = await db.from("products").update(payload).eq("id", editingId)); }
    else           { ({ error: dbError } = await db.from("products").insert(payload)); }
    if (dbError) { toast.error(dbError.message); }
    else { toast.success(editingId ? "Product updated!" : "Product created!"); cancelForm(); await fetchProducts(); }
    setSaving(false);
  }

  async function deleteProduct(id: string, name: string) {
    if (!confirm(`Permanently delete "${name}"?`)) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted."); setProducts(prev => prev.filter(p => p.id !== id)); }
  }
  async function toggleActive(id: string, current: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("products").update({ is_active: !current }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(!current ? "Activated." : "Deactivated."); setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p)); }
  }
  async function toggleFeatured(id: string, current: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("products").update({ is_featured: !current }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(!current ? "Featured." : "Unfeatured."); setProducts(prev => prev.map(p => p.id === id ? { ...p, is_featured: !current } : p)); }
  }

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  }

  const visible = [...products]
    .filter(p => {
      const ms = !search       || p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase());
      const mc = !filterCat    || p.category === filterCat;
      const mk = !filterStock  || (filterStock  === "in"     ? p.stock_quantity > 0 : p.stock_quantity <= 0);
      const ma = !filterActive || (filterActive === "active" ? p.is_active          : !p.is_active);
      return ms && mc && mk && ma;
    })
    .sort((a, b) => {
      let cmp = 0;
      if      (sortField === "name")           cmp = a.name.localeCompare(b.name);
      else if (sortField === "price_retail")   cmp = a.price_retail - b.price_retail;
      else if (sortField === "stock_quantity") cmp = a.stock_quantity - b.stock_quantity;
      else if (sortField === "created_at")     cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      else if (sortField === "category")       cmp = a.category.localeCompare(b.category);
      return sortDir === "asc" ? cmp : -cmp;
    });

  if (isLoading || !profile?.is_admin) {
    return <div className="space-y-3">{Array.from({length:6}).map((_,i) => <Skeleton key={i} className="h-16 rounded-card" />)}</div>;
  }

  const SortBtn = ({ field, label }: { field: SortField; label: string }) => (
    <button onClick={() => toggleSort(field)} className="flex items-center gap-1 text-brand-cream-dark hover:text-brand-cream transition-colors">
      {label}<ArrowUpDown className={`h-3 w-3 ${sortField === field ? "text-brand-green" : "opacity-40"}`} />
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-cream">Products</h1>
          <p className="text-xs text-brand-cream-dark mt-0.5">
            {products.length} total · {products.filter(p => p.is_active).length} active · {products.filter(p => p.stock_quantity <= 0).length} out of stock
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw className="h-3.5 w-3.5" />} onClick={fetchProducts} disabled={loading}>Refresh</Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setForm(EMPTY); setEditingId(null); setSlugLocked(false); setShowForm(true); window.scrollTo({top:0,behavior:"smooth"}); }}>Add Product</Button>
        </div>
      </div>

      {showForm && (
        <div className="glass-card border border-brand-green/20 p-6 rounded-card space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-brand-cream">{editingId ? "Edit Product" : "New Product"}</h2>
            <button onClick={cancelForm} className="text-brand-cream-dark hover:text-brand-cream transition-colors"><X className="h-5 w-5" /></button>
          </div>
          <form onSubmit={saveProduct} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Product Name *" value={form.name} onChange={e => setField("name", e.target.value)} placeholder="Blue Dream 3.5g" required />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-brand-cream-muted flex items-center justify-between">
                  <span>URL Slug *</span>
                  <button type="button" onClick={() => setSlugLocked(l => !l)} className="text-xs text-brand-green hover:underline">{slugLocked ? "Auto-sync slug" : "Lock / edit slug"}</button>
                </label>
                <Input value={form.slug} onChange={e => { setSlugLocked(true); setField("slug", e.target.value); }} placeholder="blue-dream-3-5g" />
                <p className="text-xs text-brand-cream-dark">URL: /product/<span className="text-brand-green">{form.slug || "…"}</span></p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label="Category *" value={form.category} onChange={e => setField("category", e.target.value)} required>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </Select>
              <Select label="Strain Type" value={form.strain_type} onChange={e => setField("strain_type", e.target.value)}>
                {STRAIN_TYPES.map(s => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : "None / N/A"}</option>)}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-cream-muted">State Restrictions (optional)</label>
              <p className="text-xs text-brand-cream-dark mb-2">Select states where this product is NOT available. Leave empty to allow sales in all states.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 p-3 rounded-brand bg-white/3 border border-white/5 max-h-48 overflow-y-auto">
                {["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"].map(state => (
                  <label key={state} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.state_restrictions.includes(state)}
                      onChange={e => {
                        if (e.target.checked) {
                          setField("state_restrictions", [...form.state_restrictions, state]);
                        } else {
                          setField("state_restrictions", form.state_restrictions.filter(s => s !== state));
                        }
                      }}
                      className="w-4 h-4 rounded bg-white/10 border border-white/20 text-brand-green focus:ring-2 focus:ring-brand-green/40 cursor-pointer"
                    />
                    <span className="text-xs text-brand-cream">{state}</span>
                  </label>
                ))}
              </div>
              {form.state_restrictions.length > 0 && (
                <p className="text-xs text-yellow-400">Restricted in: {form.state_restrictions.join(", ")}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-brand-cream-muted">Description</label>
              <textarea value={form.description} onChange={e => setField("description", e.target.value)} rows={3} placeholder="Describe the product…"
                className="w-full px-3 py-2.5 text-sm bg-[#162816] border border-white/10 rounded-brand text-brand-cream placeholder:text-brand-cream-dark focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 resize-none" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-cream-muted flex items-center gap-2"><ImageIcon className="h-4 w-4 text-brand-green" /> Primary / Hero Image URL</label>
              <Input value={form.image_url} onChange={e => setField("image_url", e.target.value)} placeholder="https://cdn.example.com/product-hero.webp" />
              {form.image_url && (
                <div className="flex items-start gap-3 p-3 rounded-brand bg-white/3 border border-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.image_url} alt="Primary preview" className="h-20 w-20 object-cover rounded-brand flex-shrink-0 bg-white/5" onError={e => { (e.target as HTMLImageElement).style.display="none"; }} />
                  <div>
                    <p className="text-xs text-brand-green font-medium mb-1">Primary image preview</p>
                    <p className="text-xs text-brand-cream-dark break-all">{form.image_url}</p>
                    <button type="button" onClick={() => setField("image_url", "")} className="text-xs text-red-400 hover:text-red-300 mt-1">Remove</button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-cream-muted flex items-center gap-2"><ImageIcon className="h-4 w-4 text-brand-cream-dark" /> Gallery / Additional Images</label>
              <div className="flex gap-2">
                <Input value={form.gallery_input} onChange={e => setField("gallery_input", e.target.value)} placeholder="https://cdn.example.com/image-2.webp" onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addGalleryUrl(); } }} />
                <Button type="button" variant="ghost" size="sm" onClick={addGalleryUrl} className="flex-shrink-0">Add</Button>
              </div>
              {form.images.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {form.images.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 rounded-brand bg-white/3 border border-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Gallery ${idx+1}`} className="h-10 w-10 object-cover rounded flex-shrink-0 bg-white/5" onError={e => { (e.target as HTMLImageElement).style.display="none"; }} />
                      <span className="text-xs text-brand-cream-dark truncate flex-1">{url}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button type="button" onClick={() => moveGalleryUrl(idx,"up")}   disabled={idx===0}                    className="p-1 text-brand-cream-dark hover:text-brand-cream disabled:opacity-30"><ChevronUp   className="h-3 w-3" /></button>
                        <button type="button" onClick={() => moveGalleryUrl(idx,"down")} disabled={idx===form.images.length-1} className="p-1 text-brand-cream-dark hover:text-brand-cream disabled:opacity-30"><ChevronDown className="h-3 w-3" /></button>
                        <button type="button" onClick={() => removeGalleryUrl(idx)}      className="p-1 text-red-400 hover:text-red-300"><X className="h-3 w-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-brand-cream-dark">No gallery images added yet.</p>}
            </div>

            <div>
              <p className="text-sm font-medium text-brand-cream-muted mb-3">Pricing (enter in dollars, e.g. 25.00)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Input label="Retail Price ($) *"   type="number" step="0.01" min="0" value={form.price_retail}    onChange={e => setField("price_retail",    e.target.value)} placeholder="25.00" required />
                <Input label="Wholesale Price ($)"  type="number" step="0.01" min="0" value={form.price_wholesale} onChange={e => setField("price_wholesale", e.target.value)} placeholder="18.00" />
                <Input label="Compare-At Price ($)" type="number" step="0.01" min="0" value={form.price_compare}   onChange={e => setField("price_compare",   e.target.value)} placeholder="32.00" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Input label="Stock Qty"    type="number" min="0"                       value={form.stock_quantity}  onChange={e => setField("stock_quantity",  e.target.value)} />
              <Input label="THCa %"       type="number" step="0.01" min="0" max="100" value={form.thca_percentage} onChange={e => setField("thca_percentage", e.target.value)} placeholder="24.5" />
              <Input label="Weight (g)"   type="number" step="0.1"  min="0"           value={form.weight_grams}    onChange={e => setField("weight_grams",    e.target.value)} placeholder="3.5" />
              <Input label="Tags (comma)" value={form.tags} onChange={e => setField("tags", e.target.value)} placeholder="premium, indoor" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-brand-cream-muted">Bulk Discount Tiers</label>
                <button type="button" onClick={addTier} className="text-xs text-brand-green hover:underline flex items-center gap-1"><Plus className="h-3 w-3" /> Add Tier</button>
              </div>
              {form.bulk_tiers.map((tier, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_2fr_auto] gap-2 items-end">
                  <Input label={i===0 ? "Min Qty" : undefined}               type="number" min="1"            value={tier.quantity.toString()}         onChange={e => updateTier(i,"quantity",        e.target.value)} />
                  <Input label={i===0 ? "Discount %" : undefined}            type="number" min="0" max="100"  value={tier.discount_percent.toString()} onChange={e => updateTier(i,"discount_percent",e.target.value)} />
                  <Input label={i===0 ? "Label (shown to customer)" : undefined}                               value={tier.label}                       onChange={e => updateTier(i,"label",e.target.value)} />
                  <button type="button" onClick={() => removeTier(i)} className="mb-0.5 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-brand transition-colors"><X className="h-3.5 w-3.5" /></button>
                </div>
              ))}
              {form.bulk_tiers.length === 0 && <p className="text-xs text-brand-cream-dark">No tiers — product will not show bulk discounts.</p>}
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active}   onChange={e => setField("is_active",   e.target.checked)} className="accent-brand-green" />
                <span className="text-sm text-brand-cream-muted">Active (visible to shoppers)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={e => setField("is_featured", e.target.checked)} className="accent-brand-green" />
                <span className="text-sm text-brand-cream-muted">Featured (shown on homepage)</span>
              </label>
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="submit" variant="primary" isLoading={saving} leftIcon={<CheckCircle className="h-4 w-4" />}>{editingId ? "Save Changes" : "Create Product"}</Button>
              <Button type="button" variant="ghost" onClick={cancelForm}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-cream-dark pointer-events-none" />
          <input type="text" placeholder="Search products or slug…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#162816] border border-white/10 rounded-brand text-brand-cream placeholder:text-brand-cream-dark focus:outline-none focus:border-brand-green" />
        </div>
        <select value={filterCat}    onChange={e => setFilterCat(e.target.value)}                                           className="px-3 py-2 text-sm bg-[#162816] border border-white/10 rounded-brand text-brand-cream focus:outline-none focus:border-brand-green">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <select value={filterStock}  onChange={e => setFilterStock(e.target.value as "" | "in" | "out")}                   className="px-3 py-2 text-sm bg-[#162816] border border-white/10 rounded-brand text-brand-cream focus:outline-none focus:border-brand-green">
          <option value="">All Stock</option><option value="in">In Stock</option><option value="out">Out of Stock</option>
        </select>
        <select value={filterActive} onChange={e => setFilterActive(e.target.value as "" | "active" | "inactive")}         className="px-3 py-2 text-sm bg-[#162816] border border-white/10 rounded-brand text-brand-cream focus:outline-none focus:border-brand-green">
          <option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option>
        </select>
        {(search || filterCat || filterStock || filterActive) && (
          <button onClick={() => { setSearch(""); setFilterCat(""); setFilterStock(""); setFilterActive(""); }} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"><X className="h-3 w-3" /> Clear</button>
        )}
        <span className="text-xs text-brand-cream-dark ml-auto">{visible.length} result{visible.length !== 1 ? "s" : ""}</span>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({length:6}).map((_,i) => <Skeleton key={i} className="h-16 rounded-card" />)}</div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 glass-card border border-white/5 rounded-card">
          <AlertCircle className="h-8 w-8 text-brand-cream-dark mx-auto mb-2" />
          <p className="text-brand-cream-muted text-sm">No products match your filters.</p>
          {products.length === 0 && <Button variant="primary" size="sm" className="mt-4" leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setForm(EMPTY); setEditingId(null); setShowForm(true); }}>Add Your First Product</Button>}
        </div>
      ) : (
        <div className="glass-card border border-white/5 rounded-card overflow-hidden">
          <div className="grid grid-cols-[40px_1fr_90px_60px_100px_130px] gap-3 items-center px-4 py-2.5 border-b border-white/5 text-xs">
            <div />
            <SortBtn field="name"           label="Product"  />
            <SortBtn field="price_retail"   label="Price"    />
            <SortBtn field="stock_quantity" label="Stock"    />
            <SortBtn field="category"       label="Category" />
            <span className="text-brand-cream-dark">Actions</span>
          </div>
          {visible.map(p => (
            <div key={p.id} className="grid grid-cols-[40px_1fr_90px_60px_100px_130px] gap-3 items-center px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
              <div className="w-10 h-10 rounded-brand bg-white/5 overflow-hidden flex-shrink-0">
                {p.images?.[0]
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display="none"; }} />
                  : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-4 w-4 text-brand-cream-dark" /></div>}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-medium text-brand-cream text-sm truncate">{p.name}</span>
                  {p.is_featured         && <Badge variant="featured"  className="text-xs">Featured</Badge>}
                  {!p.is_active          && <Badge variant="cancelled" className="text-xs">Inactive</Badge>}
                  {p.stock_quantity <= 0 && <Badge variant="pending"   className="text-xs">Out of Stock</Badge>}
                </div>
                <p className="text-xs text-brand-cream-dark truncate">
                  /{p.slug}
                  {p.images?.length > 0   && <span className="ml-2 opacity-60">+{p.images.length} img</span>}
                  {p.review_count > 0      && <span className="ml-2 text-brand-green/70">★ {p.average_rating?.toFixed(1)} ({p.review_count})</span>}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-brand-cream">{fmt(p.price_retail)}</p>
                {p.price_wholesale != null && <p className="text-xs text-brand-cream-dark">{fmt(p.price_wholesale)} ws</p>}
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${p.stock_quantity > 0 ? "text-brand-cream" : "text-red-400"}`}>{p.stock_quantity}</p>
                <p className="text-xs text-brand-cream-dark">units</p>
              </div>
              <span className="text-xs text-brand-cream-muted capitalize">{p.category}</span>
              <div className="flex items-center gap-1">
                <a href={`/product/${p.slug}`} target="_blank" rel="noopener noreferrer" title="View" className="w-7 h-7 flex items-center justify-center rounded-brand hover:bg-white/5 text-brand-cream-dark hover:text-brand-cream transition-colors"><ExternalLink className="h-3.5 w-3.5" /></a>
                <button onClick={() => toggleFeatured(p.id, p.is_featured)} title={p.is_featured ? "Unfeature" : "Feature"} className={`w-7 h-7 flex items-center justify-center rounded-brand hover:bg-white/5 transition-colors ${p.is_featured ? "text-brand-green" : "text-brand-cream-dark hover:text-brand-cream"}`}><span className="text-xs font-bold">★</span></button>
                <button onClick={() => toggleActive(p.id, p.is_active)} title={p.is_active ? "Deactivate" : "Activate"} className="w-7 h-7 flex items-center justify-center rounded-brand hover:bg-white/5 text-brand-cream-dark hover:text-brand-cream transition-colors">{p.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
                <button onClick={() => startEdit(p)} title="Edit" className="w-7 h-7 flex items-center justify-center rounded-brand hover:bg-white/5 text-brand-cream-dark hover:text-brand-cream transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => deleteProduct(p.id, p.name)} title="Delete" className="w-7 h-7 flex items-center justify-center rounded-brand hover:bg-red-500/10 text-brand-cream-dark hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
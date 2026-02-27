"use client";

import { useState, useEffect, useMemo } from "react";
import { FlaskConical, ExternalLink, ShieldCheck, Check, Search, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/hooks/useToast";

/* src/app/(main)/coa/page.tsx */

interface Product {
  id: string;
  name: string;
  category: string;
  thca_percentage: number | null;
}

export default function COAPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
      setPhone(user.user_metadata?.phone || "");
    }
  }, [user]);

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products?active=true");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return uniqueCategories.sort();
  }, [products]);

  function toggleProduct(productId: string) {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    if (!name || !email) {
      toast.error("Name and email are required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/coa/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          requestedProductIds: selectedProducts,
        }),
      });

      if (res.ok) {
        toast.success("COA request submitted! We'll email you the certificates soon.");
        setSelectedProducts([]);
        setName("");
        setEmail("");
        setPhone("");
        setIsProductSelectorOpen(false);
      } else {
        toast.error("Failed to submit request. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-brand section-padding">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 text-brand-green text-sm font-semibold mb-4">
          <FlaskConical className="h-4 w-4" />
          THIRD-PARTY TESTED
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-cream mb-4">
          Request Certificates of Analysis
        </h1>
        <p className="text-brand-cream-muted text-lg max-w-2xl mx-auto">
          Every product batch is independently tested by a certified third-party laboratory.
          All products contain ≤0.3% Δ9-THC per the 2018 Farm Bill.
        </p>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {[
          { icon: ShieldCheck, title: "Farm Bill Compliant",   desc: "All products ≤0.3% Δ9-THC on dry weight basis" },
          { icon: FlaskConical, title: "Independent Testing",  desc: "Tested by accredited third-party labs" },
          { icon: ShieldCheck, title: "Full Transparency",     desc: "COAs available for every batch, every product" },
        ].map(b => (
          <div key={b.title} className="glass-card border border-brand-green/10 p-5 rounded-card text-center">
            <b.icon className="h-7 w-7 text-brand-green mx-auto mb-3" />
            <h3 className="font-semibold text-brand-cream mb-1">{b.title}</h3>
            <p className="text-xs text-brand-cream-muted">{b.desc}</p>
          </div>
        ))}
      </div>

      {/* Product Selector Widget */}
      <div className="glass-card border border-brand-green/10 rounded-card overflow-hidden mb-8">
        <button
          onClick={() => setIsProductSelectorOpen(!isProductSelectorOpen)}
          className="w-full p-5 border-b border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center">
              <FlaskConical className="h-5 w-5 text-brand-green" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-brand-cream">Select Products</h3>
              <p className="text-sm text-brand-cream-muted">
                {selectedProducts.length === 0
                  ? "Choose products for COA requests"
                  : `${selectedProducts.length} product${selectedProducts.length !== 1 ? 's' : ''} selected`
                }
              </p>
            </div>
          </div>
          {isProductSelectorOpen ? (
            <ChevronUp className="h-5 w-5 text-brand-cream-muted" />
          ) : (
            <ChevronDown className="h-5 w-5 text-brand-cream-muted" />
          )}
        </button>

        {isProductSelectorOpen && (
          <div className="p-5 border-t border-white/5">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  leftAddon={<Search className="h-4 w-4" />}
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-brand bg-[#162816] border border-white/10 text-brand-cream placeholder-brand-cream-muted focus:border-brand-green focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product List */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-brand-green border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-brand-cream-muted">Loading products...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredProducts.map(product => (
                  <div key={product.id} className="flex items-center gap-4 p-3 rounded-brand bg-[#162816] border border-white/5">
                    <button
                      onClick={() => toggleProduct(product.id)}
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-colors ${
                        selectedProducts.includes(product.id)
                          ? "bg-brand-green border-brand-green"
                          : "border-white/30 hover:border-brand-green"
                      }`}
                    >
                      {selectedProducts.includes(product.id) && (
                        <Check className="h-3 w-3 text-black mx-auto" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-brand-cream truncate">{product.name}</p>
                      <p className="text-xs text-brand-cream-dark capitalize flex items-center gap-2">
                        {product.category}
                        {product.thca_percentage && (
                          <>
                            <span>•</span>
                            <span className="text-brand-green">THCa {product.thca_percentage}%</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FlaskConical className="h-10 w-10 text-brand-cream-dark mx-auto mb-4" />
                <p className="text-brand-cream-muted">No products found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Request Form */}
      <div className="glass-card border border-brand-green/10 rounded-card p-6">
        <h2 className="font-display font-semibold text-brand-cream mb-4">Submit Request</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <Input
            label="Phone (optional)"
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={submitting || selectedProducts.length === 0}
            leftIcon={submitting ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : undefined}
          >
            {submitting ? "Submitting..." : "Request COAs"}
          </Button>
        </form>
      </div>

      <div className="mt-8 text-center">
        <Link href="/shop" className="inline-flex items-center gap-2 text-brand-green hover:underline text-sm font-medium">
          Browse Products →
        </Link>
      </div>
    </div>
  );
}

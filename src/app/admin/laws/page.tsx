"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/hooks/useToast";
import {
  Save,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface StateLaw {
  state_code: string;
  state_name: string;
  allows_thca_flower: boolean;
  allows_vapes: boolean;
  allows_edibles: boolean;
  allows_accessories: boolean;
  shipping_allowed: boolean;
  notes: string | null;
  updated_at: string;
}

type UpdateableStateLawFields = Partial<
  Omit<StateLaw, "state_code" | "state_name" | "updated_at">
>;

export default function AdminLawsPage() {
  const [stateLaws, setStateLaws] = useState<StateLaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const supabase = createClient();
  const toast = useToast();

  useEffect(() => {
    fetchStateLaws();
  }, []);

  async function fetchStateLaws() {
    setLoading(true);
    const { data, error } = await supabase
      .from("state_laws")
      .select("*")
      .order("state_code");

    if (error) {
      toast.error("Failed to load state laws");
    } else {
      setStateLaws((data ?? []) as StateLaw[]);
    }
    setLoading(false);
  }

  async function updateStateLaw(code: string, updates: UpdateableStateLawFields) {
    setSaving(code);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("state_laws")
      .update(updates as any)
      .eq("state_code", code);

    if (error) {
      toast.error(`Failed to update ${code}`);
    } else {
      toast.success(`${code} updated`);
      setStateLaws((prev) =>
        prev.map((s) =>
          s.state_code === code ? { ...s, ...updates } : s
        )
      );
    }
    setSaving(null);
  }

  function toggleField(
    code: string,
    field: keyof Omit<StateLaw, "state_code" | "state_name" | "notes" | "updated_at">
  ) {
    const current = stateLaws.find((s) => s.state_code === code);
    if (!current) return;
    updateStateLaw(code, { [field]: !current[field] });
  }

  function updateNotes(code: string, notes: string) {
    setStateLaws((prev) =>
      prev.map((s) =>
        s.state_code === code ? { ...s, notes: notes || null } : s
      )
    );
  }

  async function saveNotes(code: string) {
    const current = stateLaws.find((s) => s.state_code === code);
    if (!current) return;
    await updateStateLaw(code, { notes: current.notes });
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-card" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-brand-cream">
          State Compliance Laws
        </h1>
        <p className="text-xs text-brand-cream-dark mt-0.5">
          Manage product legality and shipping restrictions by state
        </p>
      </div>

      <div className="glass-card border border-white/5 rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="text-left py-3 px-4 font-semibold text-brand-cream">
                  State
                </th>
                <th className="text-center py-3 px-4 font-semibold text-brand-cream">
                  Flower
                </th>
                <th className="text-center py-3 px-4 font-semibold text-brand-cream">
                  Vapes
                </th>
                <th className="text-center py-3 px-4 font-semibold text-brand-cream">
                  Edibles
                </th>
                <th className="text-center py-3 px-4 font-semibold text-brand-cream">
                  Accessories
                </th>
                <th className="text-center py-3 px-4 font-semibold text-brand-cream">
                  Shipping
                </th>
                <th className="text-left py-3 px-4 font-semibold text-brand-cream">
                  Notes
                </th>
                <th className="text-center py-3 px-4 font-semibold text-brand-cream">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {stateLaws.map((law) => (
                <tr
                  key={law.state_code}
                  className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-brand-cream">
                        {law.state_name}
                      </p>
                      <p className="text-xs text-brand-cream-dark">
                        {law.state_code}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() =>
                        toggleField(law.state_code, "allows_thca_flower")
                      }
                      disabled={saving === law.state_code}
                      className={`inline-flex items-center justify-center h-8 w-8 rounded-brand transition-colors ${
                        law.allows_thca_flower
                          ? "bg-brand-green/20 text-brand-green hover:bg-brand-green/30"
                          : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      } disabled:opacity-50`}
                    >
                      {law.allows_thca_flower ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => toggleField(law.state_code, "allows_vapes")}
                      disabled={saving === law.state_code}
                      className={`inline-flex items-center justify-center h-8 w-8 rounded-brand transition-colors ${
                        law.allows_vapes
                          ? "bg-brand-green/20 text-brand-green hover:bg-brand-green/30"
                          : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      } disabled:opacity-50`}
                    >
                      {law.allows_vapes ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() =>
                        toggleField(law.state_code, "allows_edibles")
                      }
                      disabled={saving === law.state_code}
                      className={`inline-flex items-center justify-center h-8 w-8 rounded-brand transition-colors ${
                        law.allows_edibles
                          ? "bg-brand-green/20 text-brand-green hover:bg-brand-green/30"
                          : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      } disabled:opacity-50`}
                    >
                      {law.allows_edibles ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() =>
                        toggleField(law.state_code, "allows_accessories")
                      }
                      disabled={saving === law.state_code}
                      className={`inline-flex items-center justify-center h-8 w-8 rounded-brand transition-colors ${
                        law.allows_accessories
                          ? "bg-brand-green/20 text-brand-green hover:bg-brand-green/30"
                          : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      } disabled:opacity-50`}
                    >
                      {law.allows_accessories ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() =>
                        toggleField(law.state_code, "shipping_allowed")
                      }
                      disabled={saving === law.state_code}
                      className={`inline-flex items-center justify-center h-8 w-8 rounded-brand transition-colors ${
                        law.shipping_allowed
                          ? "bg-brand-green/20 text-brand-green hover:bg-brand-green/30"
                          : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      } disabled:opacity-50`}
                    >
                      {law.shipping_allowed ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={law.notes || ""}
                        onChange={(e) =>
                          updateNotes(law.state_code, e.target.value)
                        }
                        placeholder="e.g., requires ID"
                        className="text-xs px-2 py-1.5 bg-white/5 border border-white/10 rounded-brand text-brand-cream placeholder:text-brand-cream-dark focus:outline-none focus:border-brand-green flex-1 min-w-0"
                      />
                      {law.notes && (
                        <button
                          onClick={() => saveNotes(law.state_code)}
                          disabled={saving === law.state_code}
                          className="p-1.5 text-brand-green hover:bg-brand-green/10 rounded-brand transition-colors disabled:opacity-50"
                          title="Save notes"
                        >
                          <Save className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <p className="text-xs text-brand-cream-dark">
                      {new Date(law.updated_at).toLocaleDateString()}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card border border-brand-green/10 p-6 rounded-card">
        <h2 className="font-semibold text-brand-cream mb-3">Info</h2>
        <ul className="space-y-2 text-sm text-brand-cream-muted">
          <li>
            • Click any checkbox to toggle product category or shipping legality
          </li>
          <li>
            • Add optional notes (e.g., "requires ID", "mail only", "no vapes")
          </li>
          <li>
            • Changes save automatically when you toggle or click the save icon
          </li>
          <li>
            • Full compliance matrix visible to customers at{" "}
            <a
              href="/legal"
              className="text-brand-green hover:underline inline-flex items-center gap-1"
            >
              /legal <ExternalLink className="h-3 w-3" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
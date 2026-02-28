"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Palette } from "lucide-react";

interface Font {
  id: string;
  name: string;
  file_path: string;
  description: string | null;
}

export function FontSettings() {
  const supabase = createClient();
  const [fonts, setFonts] = useState<Font[]>([]);
  const [activeFontId, setActiveFontId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Load fonts and active font on mount
  useEffect(() => {
    const loadFonts = async () => {
      try {
        // Get all fonts
        const { data: fontsData } = await supabase
          .from("fonts")
          .select("*")
          .order("name");

        setFonts(fontsData || []);

        // Get active font
        const { data: settings } = await supabase
          .from("font_settings")
          .select("active_font_id")
          .single();

        setActiveFontId((settings as any)?.active_font_id || null);
      } catch (err) {
        console.error("Font load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFonts();
  }, []);

  const handleFontChange = async (fontId: string | null) => {
    setUpdating(true);
    try {
      const response = await fetch("/api/admin/fonts/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fontId }),
      });

      if (!response.ok) throw new Error("Failed to update font");

      setActiveFontId(fontId);
      
      // Apply font immediately to show preview
      const selectedFont = fonts.find(f => f.id === fontId);
      if (selectedFont) {
        document.documentElement.style.setProperty(
          "--active-font",
          `'${selectedFont.name}', system-ui, -apple-system, sans-serif`
        );
      } else {
        document.documentElement.style.setProperty(
          "--active-font",
          "system-ui, -apple-system, sans-serif"
        );
      }

      toast.success("Font updated");
    } catch (err) {
      toast.error("Failed to update font");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card border border-white/10 rounded-card p-6 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          <div className="h-10 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card border border-brand-green/10 p-6 rounded-card space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="h-5 w-5 text-brand-green" />
        <h2 className="font-semibold text-brand-cream">Site Font</h2>
      </div>

      <p className="text-sm text-brand-cream-muted mb-4">
        Select a font to display across the entire site. Each option shows a preview in its own style.
      </p>

      {/* Font Options */}
      <div className="space-y-2">
        {/* Default Font Option */}
        <button
          onClick={() => handleFontChange(null)}
          disabled={updating}
          className={`w-full text-left px-4 py-3 rounded-card border-2 transition-all ${
            activeFontId === null
              ? "border-brand-green bg-brand-green/10"
              : "border-white/10 hover:border-white/20"
          } disabled:opacity-50`}
          style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
        >
          <p className="font-semibold text-brand-cream">Default Font</p>
          <p className="text-xs text-brand-cream-muted">System font (clean & readable)</p>
        </button>

        {/* Custom Font Options */}
        {fonts.map(font => (
          <button
            key={font.id}
            onClick={() => handleFontChange(font.id)}
            disabled={updating}
            className={`w-full text-left px-4 py-3 rounded-card border-2 transition-all ${
              activeFontId === font.id
                ? "border-brand-green bg-brand-green/10"
                : "border-white/10 hover:border-white/20"
            } disabled:opacity-50`}
            style={{ fontFamily: `'${font.name}', system-ui, -apple-system, sans-serif` }}
          >
            <p className="font-semibold text-brand-cream">{font.name}</p>
            {font.description && (
              <p className="text-xs text-brand-cream-muted">{font.description}</p>
            )}
          </button>
        ))}
      </div>

      {/* Status */}
      {activeFontId && (
        <div className="mt-4 p-3 rounded-card bg-brand-green/10 border border-brand-green/20 text-sm text-brand-green">
          ✓ Active font applied to entire site
        </div>
      )}
    </div>
  );
}

export default FontSettings;

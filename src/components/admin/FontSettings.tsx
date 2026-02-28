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
  color: string | null;
}

export function FontSettings() {
  const supabase = createClient();
  const [fonts, setFonts] = useState<Font[]>([]);
  const [activeFontId, setActiveFontId] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<string>("inherit");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Load fonts and active font on mount
  useEffect(() => {
    const loadFonts = async () => {
      try {
        // Get all fonts
        const { data: fontsData } = await supabase
          .from("fonts")
          .select("*")
          .order("name");

        setFonts((fontsData as any) || []);

        // Get active font
        const { data: settings } = await supabase
          .from("font_settings")
          .select("active_font_id")
          .single();

        setActiveFontId((settings as any)?.active_font_id || null);
        
        // Load active font's color
        if ((settings as any)?.active_font_id) {
          const font = (fontsData as any)?.find((f: Font) => f.id === (settings as any).active_font_id);
          setActiveColor(font?.color || "inherit");
        }
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
      
      // Get the selected font's color
      const selectedFont = fonts.find(f => f.id === fontId);
      const fontColor = selectedFont?.color || "inherit";
      setActiveColor(fontColor);
      
      // Apply font and color immediately
      if (selectedFont) {
        document.body.style.fontFamily = `'${selectedFont.name}', system-ui, -apple-system, sans-serif`;
        document.documentElement.style.fontFamily = `'${selectedFont.name}', system-ui, -apple-system, sans-serif`;
        document.documentElement.style.setProperty("--active-font-color", fontColor);
      } else {
        document.body.style.fontFamily = "system-ui, -apple-system, sans-serif";
        document.documentElement.style.setProperty("--active-font-color", "inherit");
      }

      toast.success("Font updated");
    } catch (err) {
      toast.error("Failed to update font");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleColorChange = async (newColor: string) => {
    setUpdating(true);
    try {
      const response = await fetch("/api/admin/fonts/set-color", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fontId: activeFontId, color: newColor }),
      });

      if (!response.ok) throw new Error("Failed to update color");

      setActiveColor(newColor);
      document.documentElement.style.setProperty("--active-font-color", newColor);
      
      // Update local font list
      setFonts(fonts.map(f => 
        f.id === activeFontId ? { ...f, color: newColor } : f
      ));

      toast.success("Font color updated");
    } catch (err) {
      toast.error("Failed to update color");
      console.error(err);
    } finally {
      setUpdating(false);
      setShowColorPicker(false);
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
            style={{ 
              fontFamily: `'${font.name}', system-ui, -apple-system, sans-serif`,
              color: activeFontId === font.id && font.color && font.color !== "inherit" ? font.color : undefined
            }}
          >
            <p className="font-semibold text-brand-cream">{font.name}</p>
            {font.description && (
              <p className="text-xs text-brand-cream-muted">{font.description}</p>
            )}
          </button>
        ))}
      </div>

      {/* Color Picker for Active Font */}
      {activeFontId && (
        <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-brand-cream">Font Color</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                disabled={updating}
                className="w-10 h-10 rounded border-2 border-white/20 cursor-pointer hover:border-white/40 transition-all disabled:opacity-50"
                style={{ backgroundColor: activeColor === "inherit" ? "transparent" : activeColor }}
                title="Click to pick color"
              />
              {activeColor !== "inherit" && (
                <button
                  onClick={() => handleColorChange("inherit")}
                  disabled={updating}
                  className="text-xs px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          
          {showColorPicker && (
            <div className="space-y-2">
              <input
                type="color"
                value={activeColor === "inherit" ? "#000000" : activeColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full h-10 cursor-pointer"
                disabled={updating}
              />
              <div className="grid grid-cols-6 gap-2">
                {["#FFFF00", "#FF0000", "#00FF00", "#0000FF", "#FFFFFF", "#000000"].map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className="h-8 rounded border-2 border-white/20 hover:border-white/40 transition-all"
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {activeColor === color && <span className="text-white">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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

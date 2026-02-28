import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Hook to load and apply the active font from database
 * Call this in AppProvider or layout useEffect
 */
export function useFontLoader() {
  useEffect(() => {
    const loadActiveFont = async () => {
      try {
        const supabase = createClient();

        // Get active font setting
        const { data: fontSettings } = await supabase
          .from("font_settings")
          .select("active_font_id")
          .single();

        if (!(fontSettings as any)?.active_font_id) {
          // No custom font, use default
          document.body.style.fontFamily = "system-ui, -apple-system, sans-serif";
          return;
        }

        // Get font details
        const { data: font } = await supabase
          .from("fonts")
          .select("name, file_path")
          .eq("id", (fontSettings as any).active_font_id)
          .single();

        if (font as any) {
          // Apply font directly to body
          document.body.style.fontFamily = `'${(font as any).name}', system-ui, -apple-system, sans-serif`;
          console.log(`Font loaded: ${(font as any).name}`);
        }
      } catch (err) {
        console.error("Font loader error:", err);
      }
    };

    // Load font immediately
    loadActiveFont();
    
    // Also load after a short delay to ensure DOM is ready
    const timeout = setTimeout(loadActiveFont, 100);
    
    return () => clearTimeout(timeout);
  }, []);
}

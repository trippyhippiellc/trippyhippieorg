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
          document.documentElement.style.setProperty(
            "--active-font",
            "system-ui, -apple-system, sans-serif"
          );
          return;
        }

        // Get font details
        const { data: font } = await supabase
          .from("fonts")
          .select("name, file_path")
          .eq("id", (fontSettings as any).active_font_id)
          .single();

        if (font as any) {
          // Apply font by name
          document.documentElement.style.setProperty(
            "--active-font",
            `'${(font as any).name}', system-ui, -apple-system, sans-serif`
          );
        }
      } catch (err) {
        console.error("Font loader error:", err);
      }
    };

    loadActiveFont();
  }, []);
}

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Hook to load and apply the active font from database
 * Applies both font-family and color
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
          document.documentElement.style.setProperty("--active-font-color", "inherit");
          return;
        }

        // Get font details including color
        const { data: font } = await supabase
          .from("fonts")
          .select("name, file_path, color")
          .eq("id", (fontSettings as any).active_font_id)
          .single();

        if (font as any) {
          const fontName = (font as any).name;
          const fontColor = (font as any).color || "inherit";
          
          // Apply font to body and html
          document.body.style.fontFamily = `'${fontName}', system-ui, -apple-system, sans-serif`;
          document.documentElement.style.fontFamily = `'${fontName}', system-ui, -apple-system, sans-serif`;
          
          // Apply color via CSS variable
          document.documentElement.style.setProperty("--active-font-color", fontColor);
          
          console.log(`Font loaded: ${fontName}, Color: ${fontColor}`);
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

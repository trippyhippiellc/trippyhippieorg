-- Create RPC function to update site settings
CREATE OR REPLACE FUNCTION public.update_site_settings(
  p_is_construction_mode BOOLEAN DEFAULT NULL,
  p_construction_password TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  is_construction_mode BOOLEAN,
  construction_password TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  UPDATE site_settings ss
  SET
    is_construction_mode = COALESCE(p_is_construction_mode, ss.is_construction_mode),
    construction_password = COALESCE(p_construction_password, ss.construction_password),
    updated_at = CURRENT_TIMESTAMP
  WHERE TRUE
  RETURNING ss.id, ss.is_construction_mode, ss.construction_password, ss.created_at, ss.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

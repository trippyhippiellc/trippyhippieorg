-- Create site_settings table for construction mode and global settings
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_construction_mode BOOLEAN NOT NULL DEFAULT FALSE,
  construction_password TEXT NOT NULL DEFAULT 'construction123',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_site_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER site_settings_updated_at
BEFORE UPDATE ON site_settings
FOR EACH ROW
EXECUTE FUNCTION update_site_settings_timestamp();

-- Insert default row
INSERT INTO site_settings (is_construction_mode, construction_password)
VALUES (FALSE, 'construction123')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read construction mode status (needed for public check)
CREATE POLICY "Allow public read construction status" ON site_settings
  FOR SELECT USING (true);

-- Allow only admins to update settings
CREATE POLICY "Allow only admins to update settings" ON site_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = TRUE
    )
  );

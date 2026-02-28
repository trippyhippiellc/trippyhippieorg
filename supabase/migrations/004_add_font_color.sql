-- Add color support to fonts table
ALTER TABLE fonts ADD COLUMN color VARCHAR(7) DEFAULT NULL;

-- Update RuneScape font to yellow
UPDATE fonts SET color = '#FFFF00' WHERE name = 'RuneScape';

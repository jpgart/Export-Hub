-- Drop existing table and recreate with correct structure
DROP TABLE IF EXISTS exports;

-- Create exports table with ALL CSV columns
CREATE TABLE exports (
    id BIGSERIAL PRIMARY KEY,
    season TEXT,
    etd_week TEXT,
    region TEXT,
    market TEXT,
    country TEXT,
    transport TEXT,
    specie TEXT,
    variety TEXT,
    importer TEXT,
    exporter TEXT,
    arrival_port TEXT,
    boxes DECIMAL(10, 3),
    kilograms DECIMAL(10, 3),
    extraction_week_number INTEGER,
    file_source TEXT,
    week_start_date DATE,
    week_end_date DATE,
    calendar_week INTEGER,
    calendar_year INTEGER,
    industry_season TEXT,
    season_start_year INTEGER,
    season_end_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exports_season ON exports(season);
CREATE INDEX IF NOT EXISTS idx_exports_country ON exports(country);
CREATE INDEX IF NOT EXISTS idx_exports_specie ON exports(specie);
CREATE INDEX IF NOT EXISTS idx_exports_calendar_year ON exports(calendar_year);
CREATE INDEX IF NOT EXISTS idx_exports_extraction_week ON exports(extraction_week_number);

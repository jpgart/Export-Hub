// scripts/upload-csv.mjs
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Manually load environment variables from .env.local
const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const projectRoot = path.resolve(scriptDir, '..');
const envPath = path.resolve(projectRoot, '.env.local');
console.log('Looking for .env.local at:', envPath);
const envFile = fs.readFileSync(envPath, 'utf-8');
const envConfig = envFile.split('\n').reduce((acc, line) => {
  const trimmedLine = line.trim();
  if (trimmedLine && !trimmedLine.startsWith('#')) {
    const [key, ...value] = trimmedLine.split('=');
    if (key && value.length > 0) {
      // Remove quotes from the value
      const cleanValue = value.join('=').replace(/^["']|["']$/g, '');
      acc[key.trim()] = cleanValue;
    }
  }
  return acc;
}, {});

console.log('Environment variables loaded:');
console.log('SUPABASE_URL:', envConfig.NEXT_PUBLIC_SUPABASE_URL ? 'Found' : 'Missing');
console.log('SUPABASE_KEY:', envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Found (length: ' + envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ')' : 'Missing');

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl);
console.log('Key preview:', supabaseKey ? supabaseKey.substring(0, 50) + '...' : 'Not found');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or Key is missing in .env.local');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const csvFilePath = path.resolve(scriptDir, '2023-2024.csv');

async function processAndUpload() {
  console.log('Starting CSV processing...');

  const fileContent = fs.readFileSync(csvFilePath, 'utf8');

  Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: header => header.toLowerCase().replace(/\s+/g, '_'),
    complete: async (results) => {
      console.log(`Parsed ${results.data.length} rows from CSV.`);
      console.log('Headers found:', Object.keys(results.data[0]));

      // Convert data types and map only ESSENTIAL fields (core export data)
      const formattedData = results.data.map(row => ({
        season: row.season || null,
        etd_week: row.etd_week || null,
        region: row.region || null,
        market: row.market || null,
        country: row.country || null,
        transport: row.transport || null,
        specie: row.specie || null,
        variety: row.variety || null,
        importer: row.importer || null,
        exporter: row.exporter || null,
        arrival_port: row.arrival_port || null,
        boxes: parseFloat(row.boxes) || 0,
        kilograms: parseFloat(row.kilograms) || 0,
        extraction_week_number: parseInt(row.extraction_week_number, 10) || null,
        file_source: row.file_source || null,
        week_start_date: row.week_start_date?.match(/^\d{4}-\d{2}-\d{2}$/) ? row.week_start_date : null,
        week_end_date: row.week_end_date?.match(/^\d{4}-\d{2}-\d{2}$/) ? row.week_end_date : null,
        calendar_week: parseInt(row.calendar_week, 10) || null,
        calendar_year: parseInt(row.calendar_year, 10) || null,
        industry_season: row.industry_season || null,
        season_start_year: parseInt(row.season_start_year, 10) || null,
        season_end_year: parseInt(row.season_end_year, 10) || null
        // Omitidos: fecha_procesamiento, validacion_status, tipo_descarga, fuente_validacion
      }));

      console.log('Sample formatted data:', formattedData[0]);

      // Supabase has a limit on how many rows you can insert at once.
      // Let's break it into chunks of 500.
      const chunkSize = 500;
      for (let i = 0; i < formattedData.length; i += chunkSize) {
        const chunk = formattedData.slice(i, i + chunkSize);
        console.log(`Uploading chunk ${Math.floor(i / chunkSize) + 1} of ${Math.ceil(formattedData.length / chunkSize)}...`);
        
        const { error } = await supabase.from('exports').insert(chunk);

        if (error) {
          console.error('Error inserting chunk:', error);
          // Optional: Stop on first error or continue
          return; 
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log('🎉 Successfully uploaded all data to Supabase!');
    },
    error: (error) => {
      console.error('Error parsing CSV:', error);
    }
  });
}

processAndUpload();
import { NeedCategory, NeedSeverity } from '../types/need.types';

export interface ParsedNeedRow {
  area: string;
  lat: number;
  lng: number;
  category: NeedCategory;
  severity: NeedSeverity;
  description: string;
  reportedCount: number;
}

export interface ParseResult {
  rows: ParsedNeedRow[];
  errors: string[];
}

const SEVERITY_MAP: Record<string, NeedSeverity> = {
  low: 'low', medium: 'medium', high: 'high', critical: 'critical',
  '1': 'low', '2': 'medium', '3': 'high', '4': 'critical',
};

const CATEGORY_MAP: Record<string, NeedCategory> = {
  medical: 'medical', shelter: 'shelter',
  food: 'food_distribution', food_distribution: 'food_distribution',
  education: 'education', water: 'water_sanitation',
  water_sanitation: 'water_sanitation', general: 'general',
};

// Urgency scoring — mirrors backend scoring.js
const SEVERITY_SCORE: Record<NeedSeverity, number> = { low: 0, medium: 10, high: 22, critical: 30 };
const CATEGORY_SCORE: Record<NeedCategory, number> = {
  medical: 15, shelter: 12, food_distribution: 10,
  water_sanitation: 8, education: 6, general: 3,
};

export function computeUrgencyScore(row: ParsedNeedRow): { total: number; breakdown: Record<string, number> } {
  const volume = Math.min(row.reportedCount / 30, 1.0) * 35;
  const severity = SEVERITY_SCORE[row.severity] ?? 0;
  const recency = 20; // new rows are always fresh
  const category = CATEGORY_SCORE[row.category] ?? 3;
  const total = Math.round(Math.min(volume + severity + recency + category, 100) * 100) / 100;
  return { total, breakdown: { volume: Math.round(volume * 100) / 100, severity, recency, category } };
}

/** Normalize a header string to a lowercase key */
function norm(s: string) {
  return s.trim().toLowerCase().replace(/[\s_-]+/g, '_');
}

/**
 * Parse CSV text into need rows.
 * Expected columns (flexible naming):
 *   area/location, lat, lng, category, severity, description, reported_count/reports/count
 */
export function parseCsv(text: string): ParseResult {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { rows: [], errors: ['CSV has no data rows'] };

  const headers = lines[0].split(',').map(norm);
  const rows: ParsedNeedRow[] = [];
  const errors: string[] = [];

  const col = (aliases: string[]) => aliases.map((a) => headers.indexOf(a)).find((i) => i >= 0) ?? -1;

  const areaIdx       = col(['area', 'location', 'place', 'zone']);
  const latIdx        = col(['lat', 'latitude']);
  const lngIdx        = col(['lng', 'lon', 'longitude']);
  const categoryIdx   = col(['category', 'type', 'need_type']);
  const severityIdx   = col(['severity', 'urgency', 'priority']);
  const descIdx       = col(['description', 'desc', 'details', 'notes']);
  const countIdx      = col(['reported_count', 'reports', 'count', 'report_count', 'no_of_reports', 'num_reports']);

  if (areaIdx < 0) errors.push('Missing column: area/location');
  if (categoryIdx < 0) errors.push('Missing column: category/type');
  if (severityIdx < 0) errors.push('Missing column: severity/urgency');
  if (errors.length) return { rows, errors };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle quoted fields
    const cells = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|(?<=,)$|^(?=,))/g)
      ?.map((c) => c.replace(/^"|"$/g, '').trim()) ?? line.split(',').map((c) => c.trim());

    const get = (idx: number) => (idx >= 0 ? cells[idx] ?? '' : '');

    const severity = SEVERITY_MAP[get(severityIdx).toLowerCase()] ?? 'medium';
    const category = CATEGORY_MAP[get(categoryIdx).toLowerCase()] ?? 'general';
    const reportedCount = parseInt(get(countIdx)) || 1;
    const area = get(areaIdx) || `Row ${i}`;
    const lat = parseFloat(get(latIdx)) || 18.5204;
    const lng = parseFloat(get(lngIdx)) || 73.8567;
    const description = get(descIdx) || `${category} need at ${area}`;

    rows.push({ area, lat, lng, category, severity, description, reportedCount });
  }

  return { rows, errors };
}

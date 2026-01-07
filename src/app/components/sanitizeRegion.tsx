// Sanitize region names to extract only country names - handles ANY country/region
export const sanitizeRegion = (region: string | undefined): string | null => {
  if (!region) return null;
  
  let cleaned = region.trim();
  
  // Step 1: Remove all junk patterns (dates, versions, revisions, etc.)
  const junkPatterns = [
    /\b\d{6}\b/g,                    // Dates: "000412", "951005", "040202"
    /\b\d{4}-\d{2}-\d{2}\b/g,        // ISO dates: "2001-01-15"
    /\b\d+-\d+\b/g,                  // Part numbers: "315-5041", "315-5065"
    /\bv\d+p?\b/gi,                  // Version codes: "V28P", "v2", "V119"
    /\b\d+\/\d+\b/g,                 // Fractions: "3/6"
    /\brev\s*\d+\b/gi,               // Revisions: "rev 2", "rev 6"
    /\bversion\s*\d*\b/gi,           // Versions: "version", "version 2"
    /\bset\s*\d+\b/gi,               // Sets: "set 1", "set 2"
    /\bdisc\s*\d+\b/gi,              // Discs: "disc 1", "disc 2"
    /\bdisk\s*\d+\b/gi,              // Disks: "disk 1", "disk 2"
    /\bside\s*[ab]\b/gi,             // Sides: "side a", "side b"
    /\b\d+\s*players?\b/gi,          // Player counts: "2 Players", "4 Players"
    /\bcps\s*\d*\b/gi,               // CPS variants: "CPS1", "CPS2"
    /\bcps\s*changer\b/gi,           // "CPS Changer"
    /\bsample\s*version\b/gi,        // "SAMPLE Version"
    /\bsample\b/gi,                  // "SAMPLE"
    /\bbeta\b/gi,                    // "beta"
    /\bdemo\b/gi,                    // "demo"
    /\bproto(?:type)?\b/gi,          // "proto", "prototype"
    /\bbootleg\b/gi,                 // "bootleg"
    /\bhacked\??\b/gi,               // "hacked", "hacked?"
    /\brallye\b/gi,                  // "Rallye"
    /\bpublicity\b/gi,               // "Publicity"
    /\bedition\b/gi,                 // "Phoenix Edition"
    /\bphoenix\b/gi,                 // "Phoenix"
    /\balt\b/gi,                     // "alt"
    /\bmade\s+in\b/gi,               // "Made in"
    /\btechausa\b/gi,                // Specific manufacturer
    /\b\d+th\b/gi,                   // "11th"
    /,/g,                            // Commas
    /\?/g,                           // Question marks
  ];
  
  // Remove all junk patterns
  junkPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, ' ');
  });
  
  // Step 2: Clean up whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Step 3: If nothing remains, filter it out
  if (!cleaned || cleaned.length < 2) {
    return null;
  }
  
  // Step 4: Normalize common abbreviations to full names
  const abbreviationMap: { [key: string]: string } = {
    'usa': 'USA',
    'us': 'USA',
    'japan': 'Japan',
    'jp': 'Japan',
    'jpn': 'Japan',
    'japanese': 'Japan',
    'europe': 'Europe',
    'eu': 'Europe',
    'eur': 'Europe',
    'world': 'World',
    'asia': 'Asia',
    'asian': 'Asia',
    'korea': 'Korea',
    'kr': 'Korea',
    'korean': 'Korea',
    'china': 'China',
    'cn': 'China',
    'australia': 'Australia',
    'au': 'Australia',
    'brazil': 'Brazil',
    'br': 'Brazil',
    'uk': 'UK',
    'britain': 'UK',
    'united kingdom': 'UK',
    'canada': 'Canada',
    'ca': 'Canada',
    'france': 'France',
    'fr': 'France',
    'germany': 'Germany',
    'de': 'Germany',
    'italy': 'Italy',
    'it': 'Italy',
    'spain': 'Spain',
    'es': 'Spain',
    'mexico': 'Mexico',
    'mx': 'Mexico',
    'argentina': 'Argentina',
    'ar': 'Argentina',
    'sweden': 'Sweden',
    'se': 'Sweden',
    'norway': 'Norway',
    'no': 'Norway',
    'denmark': 'Denmark',
    'dk': 'Denmark',
    'finland': 'Finland',
    'fi': 'Finland',
    'netherlands': 'Netherlands',
    'nl': 'Netherlands',
    'holland': 'Netherlands',
    'belgium': 'Belgium',
    'be': 'Belgium',
    'switzerland': 'Switzerland',
    'ch': 'Switzerland',
    'austria': 'Austria',
    'at': 'Austria',
    'poland': 'Poland',
    'pl': 'Poland',
    'russia': 'Russia',
    'ru': 'Russia',
    'greece': 'Greece',
    'gr': 'Greece',
    'greek': 'Greece',
    'portugal': 'Portugal',
    'pt': 'Portugal',
    'taiwan': 'Taiwan',
    'tw': 'Taiwan',
    'hong kong': 'Hong Kong',
    'hk': 'Hong Kong',
    'singapore': 'Singapore',
    'sg': 'Singapore',
    'thailand': 'Thailand',
    'th': 'Thailand',
    'india': 'India',
    'in': 'India',
    'scandinavia': 'Scandinavia',
    'latin america': 'Latin America',
    'south america': 'South America',
    'new zealand': 'New Zealand',
    'nz': 'New Zealand',
    'ireland': 'Ireland',
    'ie': 'Ireland',
    'czech': 'Czech Republic',
    'hungary': 'Hungary',
    'hu': 'Hungary',
    'romania': 'Romania',
    'ro': 'Romania',
    'turkey': 'Turkey',
    'tr': 'Turkey',
    'south africa': 'South Africa',
    'za': 'South Africa',
    'israel': 'Israel',
    'il': 'Israel',
    'saudi arabia': 'Saudi Arabia',
    'sa': 'Saudi Arabia',
    'uae': 'UAE',
    'united arab emirates': 'UAE',
    'indonesia': 'Indonesia',
    'id': 'Indonesia',
    'malaysia': 'Malaysia',
    'my': 'Malaysia',
    'philippines': 'Philippines',
    'ph': 'Philippines',
    'vietnam': 'Vietnam',
    'vn': 'Vietnam',
    'chile': 'Chile',
    'cl': 'Chile',
    'colombia': 'Colombia',
    'co': 'Colombia',
    'peru': 'Peru',
    'pe': 'Peru',
    'venezuela': 'Venezuela',
    've': 'Venezuela',
  };
  
  // Check if the cleaned string matches any known abbreviation/name
  const cleanedLower = cleaned.toLowerCase();
  if (abbreviationMap[cleanedLower]) {
    return abbreviationMap[cleanedLower];
  }
  
  // Step 5: Capitalize properly (if not in map, it's a new region name)
  // Split by spaces and capitalize each word
  const capitalized = cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return capitalized;
};

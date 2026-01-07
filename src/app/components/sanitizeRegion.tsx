// Sanitize region names - extract ONLY the country/region name
export const sanitizeRegion = (region: string | undefined): string | null => {
  if (!region) return null;
  
  const original = region.trim().toLowerCase();
  
  // Country/region mapping - if ANY of these keywords appear, return the standard name
  const countryMap: Array<{ keywords: RegExp[], name: string }> = [
    { keywords: [/\busa?\b/, /\bunited\s+states\b/, /\bamerica\b/], name: 'USA' },
    { keywords: [/\beurope?\b/, /\beu\b/, /\beur\b/], name: 'Europe' },
    { keywords: [/\bjapan(ese)?\b/, /\bjpn?\b/], name: 'Japan' },
    { keywords: [/\bworld\b/], name: 'World' },
    { keywords: [/\basia(n)?\b/], name: 'Asia' },
    { keywords: [/\bkorea(n)?\b/, /\bkr\b/], name: 'Korea' },
    { keywords: [/\bchina\b/, /\bchinese\b/, /\bcn\b/], name: 'China' },
    { keywords: [/\baustralia\b/, /\bau\b/], name: 'Australia' },
    { keywords: [/\bbrazil\b/, /\bbr\b/], name: 'Brazil' },
    { keywords: [/\bcanada\b/, /\bca\b/], name: 'Canada' },
    { keywords: [/\bfrance\b/, /\bfrench\b/, /\bfr\b/], name: 'France' },
    { keywords: [/\bgermany\b/, /\bgerman\b/, /\bde\b/], name: 'Germany' },
    { keywords: [/\bitaly\b/, /\bitalian\b/, /\bit\b/], name: 'Italy' },
    { keywords: [/\bspain\b/, /\bspanish\b/, /\bes\b/], name: 'Spain' },
    { keywords: [/\buk\b/, /\bunited\s+kingdom\b/, /\bbritain\b/, /\bbritish\b/], name: 'UK' },
    { keywords: [/\bgreece\b/, /\bgreek\b/, /\bgr\b/], name: 'Greece' },
    { keywords: [/\bscandinavia\b/], name: 'Scandinavia' },
    { keywords: [/\bnetherlands\b/, /\bholland\b/, /\bdutch\b/, /\bnl\b/], name: 'Netherlands' },
    { keywords: [/\brussia\b/, /\brussian\b/, /\bru\b/], name: 'Russia' },
    { keywords: [/\bmexico\b/, /\bmexican\b/, /\bmx\b/], name: 'Mexico' },
    { keywords: [/\bargentina\b/, /\bar\b/], name: 'Argentina' },
    { keywords: [/\bsweden\b/, /\bswedish\b/, /\bse\b/], name: 'Sweden' },
    { keywords: [/\bnorway\b/, /\bnorwegian\b/, /\bno\b/], name: 'Norway' },
    { keywords: [/\bdenmark\b/, /\bdanish\b/, /\bdk\b/], name: 'Denmark' },
    { keywords: [/\bfinland\b/, /\bfinnish\b/, /\bfi\b/], name: 'Finland' },
    { keywords: [/\bbelgium\b/, /\bbelgian\b/, /\bbe\b/], name: 'Belgium' },
    { keywords: [/\bswitzerland\b/, /\bswiss\b/, /\bch\b/], name: 'Switzerland' },
    { keywords: [/\baustria\b/, /\baustrian\b/, /\bat\b/], name: 'Austria' },
    { keywords: [/\bpoland\b/, /\bpolish\b/, /\bpl\b/], name: 'Poland' },
    { keywords: [/\bportugal\b/, /\bportuguese\b/, /\bpt\b/], name: 'Portugal' },
    { keywords: [/\btaiwan\b/, /\btaiwanese\b/, /\btw\b/], name: 'Taiwan' },
    { keywords: [/\bhong\s+kong\b/, /\bhk\b/], name: 'Hong Kong' },
    { keywords: [/\bsingapore\b/, /\bsg\b/], name: 'Singapore' },
    { keywords: [/\bthailand\b/, /\bthai\b/, /\bth\b/], name: 'Thailand' },
    { keywords: [/\bindia\b/, /\bindian\b/, /\bin\b/], name: 'India' },
    { keywords: [/\blatin\s+america\b/], name: 'Latin America' },
    { keywords: [/\bsouth\s+america\b/], name: 'South America' },
    { keywords: [/\bnew\s+zealand\b/, /\bnz\b/], name: 'New Zealand' },
    { keywords: [/\bireland\b/, /\birish\b/, /\bie\b/], name: 'Ireland' },
    { keywords: [/\bczech\b/], name: 'Czech Republic' },
    { keywords: [/\bhungary\b/, /\bhungarian\b/, /\bhu\b/], name: 'Hungary' },
    { keywords: [/\bromania\b/, /\bromanian\b/, /\bro\b/], name: 'Romania' },
    { keywords: [/\bturkey\b/, /\bturkish\b/, /\btr\b/], name: 'Turkey' },
    { keywords: [/\bsouth\s+africa\b/, /\bza\b/], name: 'South Africa' },
    { keywords: [/\bisrael\b/, /\bisraeli\b/, /\bil\b/], name: 'Israel' },
    { keywords: [/\bsaudi\s+arabia\b/, /\bsa\b/], name: 'Saudi Arabia' },
    { keywords: [/\buae\b/, /\bunited\s+arab\s+emirates\b/], name: 'UAE' },
    { keywords: [/\bindonesia\b/, /\bindonesian\b/, /\bid\b/], name: 'Indonesia' },
    { keywords: [/\bmalaysia\b/, /\bmalaysian\b/, /\bmy\b/], name: 'Malaysia' },
    { keywords: [/\bphilippines\b/, /\bfilipino\b/, /\bph\b/], name: 'Philippines' },
    { keywords: [/\bvietnam\b/, /\bvietnamese\b/, /\bvn\b/], name: 'Vietnam' },
    { keywords: [/\bchile\b/, /\bchilean\b/, /\bcl\b/], name: 'Chile' },
    { keywords: [/\bcolombia\b/, /\bcolombian\b/, /\bco\b/], name: 'Colombia' },
    { keywords: [/\bperu\b/, /\bperuvian\b/, /\bpe\b/], name: 'Peru' },
    { keywords: [/\bvenezuela\b/, /\bvenezuelan\b/, /\bve\b/], name: 'Venezuela' },
  ];
  
  // Check each country map - return the FIRST match found
  for (const country of countryMap) {
    for (const regex of country.keywords) {
      if (regex.test(original)) {
        return country.name;
      }
    }
  }
  
  // If no country found, return null (filter it out)
  return null;
};

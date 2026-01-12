/**
 * PriceCharting API Integration
 * Documentation: https://www.pricecharting.com/api-documentation
 */

interface PriceData {
  loosePrice: number; // in cents
  cibPrice: number; // in cents
  newPrice: number; // in cents
  productId: string;
  productName: string;
  consoleName: string;
}

interface PriceChartingResponse {
  status: string;
  id?: string;
  'product-name'?: string;
  'console-name'?: string;
  'loose-price'?: number;
  'cib-price'?: number;
  'new-price'?: number;
  'error-message'?: string;
}

/**
 * Fetch price data from PriceCharting API for a single game
 */
export async function fetchPriceData(
  gameName: string,
  consoleName: string,
  apiKey: string
): Promise<PriceData | null> {
  if (!apiKey || !gameName || !consoleName) {
    return null;
  }

  try {
    // Clean up game name for search
    const cleanGameName = cleanGameNameForSearch(gameName);
    const query = `${cleanGameName} ${consoleName}`;
    
    // Make API request
    const url = `https://www.pricecharting.com/api/product?t=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(query)}`;
    
    const response = await fetch(url);
    const data: PriceChartingResponse = await response.json();
    
    if (data.status === 'error') {
      console.error('PriceCharting API error:', data['error-message']);
      return null;
    }
    
    if (data.status === 'success' && data.id) {
      return {
        loosePrice: data['loose-price'] || 0,
        cibPrice: data['cib-price'] || 0,
        newPrice: data['new-price'] || 0,
        productId: data.id,
        productName: data['product-name'] || gameName,
        consoleName: data['console-name'] || consoleName,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching price data:', error);
    return null;
  }
}

/**
 * Clean game name to improve PriceCharting search results
 * Removes region codes, version info, etc.
 */
function cleanGameNameForSearch(gameName: string): string {
  let cleaned = gameName;
  
  // Remove region codes like (USA), (Europe), (Japan), etc.
  cleaned = cleaned.replace(/\([^)]*(?:USA|Europe|Japan|World|Asia|Korea|Brazil|Spain|France|Germany|Italy|UK|China|Taiwan|Australia|Sweden|Netherlands|Canada|Mexico)[^)]*\)/gi, '');
  
  // Remove version info like (Rev 1), (V1.1), etc.
  cleaned = cleaned.replace(/\(Rev\s*\d+\)/gi, '');
  cleaned = cleaned.replace(/\(V\d+\.\d+\)/gi, '');
  
  // Remove clone/hack indicators
  cleaned = cleaned.replace(/\(Beta.*?\)/gi, '');
  cleaned = cleaned.replace(/\(Proto.*?\)/gi, '');
  cleaned = cleaned.replace(/\(Demo.*?\)/gi, '');
  cleaned = cleaned.replace(/\(Sample.*?\)/gi, '');
  cleaned = cleaned.replace(/\(Hack.*?\)/gi, '');
  cleaned = cleaned.replace(/\(Pirate.*?\)/gi, '');
  cleaned = cleaned.replace(/\(Homebrew.*?\)/gi, '');
  cleaned = cleaned.replace(/\(Unl\)/gi, '');
  
  // Remove extra info in brackets
  cleaned = cleaned.replace(/\[.*?\]/g, '');
  
  // Remove multiple spaces and trim
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

/**
 * Map DAT system name to PriceCharting console name
 * PriceCharting has specific console names they use
 */
export function mapSystemToPriceChartingConsole(systemName: string): string {
  const lowerSystem = systemName.toLowerCase();
  
  // Common mappings
  const mappings: Record<string, string> = {
    'nes': 'NES',
    'nintendo': 'NES',
    'nintendo entertainment system': 'NES',
    'famicom': 'Famicom',
    
    'snes': 'Super Nintendo',
    'super nintendo': 'Super Nintendo',
    'super famicom': 'Super Famicom',
    
    'n64': 'Nintendo 64',
    'nintendo 64': 'Nintendo 64',
    
    'gamecube': 'Gamecube',
    'ngc': 'Gamecube',
    
    'wii': 'Wii',
    
    'wii u': 'Wii U',
    'wiiu': 'Wii U',
    
    'switch': 'Nintendo Switch',
    'nintendo switch': 'Nintendo Switch',
    
    'gameboy': 'GameBoy',
    'game boy': 'GameBoy',
    'gb': 'GameBoy',
    
    'gameboy color': 'GameBoy Color',
    'game boy color': 'GameBoy Color',
    'gbc': 'GameBoy Color',
    
    'gameboy advance': 'GameBoy Advance',
    'game boy advance': 'GameBoy Advance',
    'gba': 'GameBoy Advance',
    
    'ds': 'Nintendo DS',
    'nintendo ds': 'Nintendo DS',
    'nds': 'Nintendo DS',
    
    '3ds': 'Nintendo 3DS',
    'nintendo 3ds': 'Nintendo 3DS',
    
    'genesis': 'Sega Genesis',
    'sega genesis': 'Sega Genesis',
    'mega drive': 'PAL Mega Drive',
    'megadrive': 'PAL Mega Drive',
    
    'master system': 'Sega Master System',
    'sega master system': 'Sega Master System',
    'sms': 'Sega Master System',
    
    'game gear': 'Sega Game Gear',
    'gamegear': 'Sega Game Gear',
    'gg': 'Sega Game Gear',
    
    'saturn': 'Sega Saturn',
    'sega saturn': 'Sega Saturn',
    
    'dreamcast': 'Sega Dreamcast',
    'sega dreamcast': 'Sega Dreamcast',
    'dc': 'Sega Dreamcast',
    
    'ps1': 'Playstation',
    'psx': 'Playstation',
    'playstation': 'Playstation',
    'playstation 1': 'Playstation',
    
    'ps2': 'Playstation 2',
    'playstation 2': 'Playstation 2',
    
    'ps3': 'Playstation 3',
    'playstation 3': 'Playstation 3',
    
    'ps4': 'Playstation 4',
    'playstation 4': 'Playstation 4',
    
    'ps5': 'Playstation 5',
    'playstation 5': 'Playstation 5',
    
    'psp': 'PSP',
    
    'vita': 'Playstation Vita',
    'ps vita': 'Playstation Vita',
    'playstation vita': 'Playstation Vita',
    
    'xbox': 'Xbox',
    'xbox original': 'Xbox',
    
    'xbox 360': 'Xbox 360',
    'x360': 'Xbox 360',
    
    'xbox one': 'Xbox One',
    'xbone': 'Xbox One',
    
    'xbox series x': 'Xbox Series X',
    'xbox series': 'Xbox Series X',
    
    'atari 2600': 'Atari 2600',
    '2600': 'Atari 2600',
    
    'atari 5200': 'Atari 5200',
    '5200': 'Atari 5200',
    
    'atari 7800': 'Atari 7800',
    '7800': 'Atari 7800',
    
    'colecovision': 'Colecovision',
    
    'intellivision': 'Intellivision',
    
    'turbografx-16': 'TurboGrafx-16',
    'turbografx': 'TurboGrafx-16',
    'tg16': 'TurboGrafx-16',
    'pc engine': 'JP PC Engine',
    
    '3do': '3DO',
    
    'jaguar': 'Jaguar',
    'atari jaguar': 'Jaguar',
    
    'neo geo': 'Neo Geo AES',
    'neogeo': 'Neo Geo AES',
    'neo-geo': 'Neo Geo AES',
    
    'lynx': 'Atari Lynx',
    'atari lynx': 'Atari Lynx',
    
    'virtual boy': 'Virtual Boy',
    'virtualboy': 'Virtual Boy',
  };
  
  // Try direct mapping
  if (mappings[lowerSystem]) {
    return mappings[lowerSystem];
  }
  
  // Fallback to original name (capitalized)
  return systemName;
}

/**
 * Format price in cents to dollar string
 */
export function formatPrice(priceInCents: number | undefined): string {
  if (priceInCents === undefined || priceInCents === 0) {
    return 'N/A';
  }
  return `$${(priceInCents / 100).toFixed(2)}`;
}

/**
 * Validate API key format (should be 40 characters)
 */
export function isValidApiKey(apiKey: string): boolean {
  return apiKey.length === 40 && /^[a-f0-9]+$/i.test(apiKey);
}

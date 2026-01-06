// Pixel-art style system icons as SVG components

export const SystemIcons: Record<string, JSX.Element> = {
  'SNES': (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="10" width="24" height="12" fill="#d3d3d3" />
      <rect x="3" y="9" width="26" height="14" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="12" cy="16" r="2" fill="currentColor" />
      <circle cx="20" cy="13" r="1.5" fill="#ff0055" />
      <circle cx="23" cy="16" r="1.5" fill="#00ff41" />
      <circle cx="20" cy="19" r="1.5" fill="#0080ff" />
      <circle cx="17" cy="16" r="1.5" fill="#ffff00" />
    </svg>
  ),
  'Genesis': (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="10" width="24" height="12" fill="#1a1a1a" />
      <rect x="3" y="9" width="26" height="14" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="10" y="14" width="3" height="1" fill="currentColor" />
      <rect x="12" y="12" width="1" height="5" fill="currentColor" />
      <circle cx="20" cy="14" r="1.5" fill="currentColor" />
      <circle cx="24" cy="16" r="1.5" fill="currentColor" />
      <circle cx="20" cy="18" r="1.5" fill="currentColor" />
    </svg>
  ),
  'NES': (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="11" width="24" height="10" fill="#8b8b8b" />
      <rect x="3" y="10" width="26" height="12" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="8" y="14" width="3" height="1" fill="currentColor" />
      <rect x="10" y="13" width="1" height="3" fill="currentColor" />
      <circle cx="19" cy="15" r="1.5" fill="#d32f2f" />
      <circle cx="23" cy="15" r="1.5" fill="#d32f2f" />
    </svg>
  ),
  'Game Boy': (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="4" width="16" height="24" rx="2" fill="#9e9e9e" />
      <rect x="7" y="3" width="18" height="26" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="10" y="6" width="12" height="10" fill="#424242" />
      <rect x="13" y="20" width="2" height="1" fill="currentColor" />
      <rect x="14" y="19" width="1" height="3" fill="currentColor" />
      <circle cx="19" cy="20" r="1" fill="currentColor" />
      <circle cx="22" cy="20" r="1" fill="currentColor" />
    </svg>
  ),
  'PlayStation': (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="10" width="24" height="12" fill="#757575" />
      <rect x="3" y="9" width="26" height="14" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="11" cy="16" r="2.5" fill="currentColor" />
      <circle cx="11" cy="16" r="1.5" fill="#424242" />
      <circle cx="21" cy="16" r="2.5" fill="currentColor" />
      <circle cx="21" cy="16" r="1.5" fill="#424242" />
      <rect x="15" y="14" width="2" height="1" fill="currentColor" />
      <rect x="15" y="17" width="2" height="1" fill="currentColor" />
    </svg>
  ),
  'N64': (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 12 L16 8 L24 12 L24 20 L16 24 L8 20 Z" fill="#424242" />
      <path d="M8 12 L16 8 L24 12 L24 20 L16 24 L8 20 Z" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="13" cy="15" r="2" fill="currentColor" />
      <circle cx="19" cy="17" r="1" fill="#ffff00" />
      <circle cx="22" cy="15" r="1" fill="#00ff41" />
      <circle cx="19" cy="13" r="1" fill="#0080ff" />
      <circle cx="16" cy="15" r="1" fill="#ff0055" />
    </svg>
  ),
  'Default': (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="10" width="24" height="12" rx="2" fill="currentColor" fillOpacity="0.3" />
      <rect x="3" y="9" width="26" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="12" cy="16" r="2" fill="currentColor" />
      <circle cx="20" cy="16" r="2" fill="currentColor" />
    </svg>
  )
};

export function getSystemIcon(systemName: string): JSX.Element {
  const normalized = systemName.toLowerCase();
  
  if (normalized.includes('snes') || normalized.includes('super nintendo')) {
    return SystemIcons['SNES'];
  }
  if (normalized.includes('genesis') || normalized.includes('mega drive')) {
    return SystemIcons['Genesis'];
  }
  if (normalized.includes('nes') && !normalized.includes('snes')) {
    return SystemIcons['NES'];
  }
  if (normalized.includes('game boy') || normalized.includes('gameboy')) {
    return SystemIcons['Game Boy'];
  }
  if (normalized.includes('playstation') || normalized.includes('psx') || normalized.includes('ps1')) {
    return SystemIcons['PlayStation'];
  }
  if (normalized.includes('n64') || normalized.includes('nintendo 64')) {
    return SystemIcons['N64'];
  }
  
  return SystemIcons['Default'];
}

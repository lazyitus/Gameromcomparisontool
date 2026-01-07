import { useMemo, useState, useEffect, useCallback, memo, useRef } from 'react';
import { CheckCircle2, XCircle, Star, Search, Filter, Download, LayoutGrid, Table, Gamepad2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { DatFile } from './DatFileUploader';
import type { RomList } from './RomListUploader';
import { sanitizeRegion } from './sanitizeRegion';

interface RomFile {
  name: string;
}

interface GameMatch {
  game: {
    name: string;
    description?: string;
    region?: string;
    category?: string;
    rom?: { name: string };
  };
  hasRom: boolean;
  matchedRom?: RomFile;
  matchMethod?: 'filename' | 'exact';
  systemName: string;
  alternateRegions?: { region: string; hasRom: boolean }[];
}

interface GameComparisonProps {
  datFiles: DatFile[];
  romLists: RomList[];
  onAddToWantList?: (game: {
    id: string;
    name: string;
    systemName: string;
    region?: string;
    category?: string;
    romName?: string;
  }) => void;
  wantedGameIds?: Set<string>;
  triggerMatching?: 'new' | 'all' | null;
  setTriggerMatching?: (value: 'new' | 'all' | null) => void;
}

// Move helper functions OUTSIDE component to prevent recreation
const getBaseGameName = (name: string): string => {
  // Remove common region/language tags like (USA), (Europe), (Japan), (World), etc.
  return name
    .replace(/\s*\([^)]*\)\s*/g, ' ') // Remove anything in parentheses
    .replace(/\s*\[[^\]]*\]\s*/g, ' ') // Remove anything in square brackets
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
    .toLowerCase();
};

// Normalize game name for better matching
const normalizeForMatching = (name: string): string => {
  return name
    .toLowerCase()
    // Remove file extensions
    .replace(/\.(sfc|snes|nes|gb|gbc|gba|gd3|gd7|dx2|mgd|md|smd|gen|32x|sms|gg|sg|n64|z64|v64|nds|3ds|cia|iso|cue|bin|img|mdf|cdi|chd|zip|7z|rar|gz)$/i, '')
    // Remove common tags in parentheses - regions, revisions, etc.
    .replace(/\s*\(rev\s*\d*[a-z]?\)/gi, '') // (Rev 1), (Rev A), etc.
    .replace(/\s*\(v\d+(\.\d+)*\)/gi, '') // (v1.0), (v1.1), etc.
    .replace(/\s*\(version\s*\d+\)/gi, '') // (Version 1), etc.
    .replace(/\s*\(usa\)/gi, '')
    .replace(/\s*\(europe\)/gi, '')
    .replace(/\s*\(japan\)/gi, '')
    .replace(/\s*\(world\)/gi, '')
    .replace(/\s*\(en,fr,de,es,it\)/gi, '') // Multi-language
    .replace(/\s*\(en,fr,de\)/gi, '')
    .replace(/\s*\(en,fr\)/gi, '')
    .replace(/\s*\(en\)/gi, '')
    .replace(/\s*\(ja\)/gi, '')
    .replace(/\s*\([^)]*\)/g, '') // Remove any remaining parentheses content
    .replace(/\s*\[[^\]]*\]/g, '') // Remove square brackets content
    // Normalize separators
    .replace(/\s*&\s*/g, ' and ') // Convert & to "and"
    .replace(/\s*\+\s*/g, ' plus ') // Convert + to "plus"
    .replace(/\s*-\s*/g, ' ') // Convert hyphens to space
    .replace(/\s+vs\.?\s+/gi, ' vs ') // Normalize "vs" and "vs." to just "vs"
    // Remove special characters but keep alphanumeric and spaces
    .replace(/[^a-z0-9\s]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
};

// sanitizeRegion is now imported from ./sanitizeRegion.tsx

// More aggressive matching that handles partial matches better
const matchRomToGame = (romName: string, gameName: string): boolean => {
  const romNorm = normalizeForMatching(romName);
  const gameNorm = normalizeForMatching(gameName);
  
  // Exact match after normalization
  if (romNorm === gameNorm) {
    return true;
  }
  
  // CRITICAL: Handle spacing differences (e.g., "Dino City" vs "DinoCity")
  // Remove ALL spaces and compare
  const romNoSpaces = romNorm.replace(/\s+/g, '');
  const gameNoSpaces = gameNorm.replace(/\s+/g, '');
  
  if (romNoSpaces === gameNoSpaces && romNoSpaces.length >= 3) {
    return true;
  }
  
  // CRITICAL: Handle subtitle cases (e.g., "GunForce" vs "GunForce - Battle Fire Engulfed Terror Island")
  // Check if the shorter name appears at the START of the longer name (subtitle scenario)
  const shorter = romNorm.length < gameNorm.length ? romNorm : gameNorm;
  const longer = romNorm.length >= gameNorm.length ? romNorm : gameNorm;
  
  // If shorter string starts the longer string, it's likely the same game with/without subtitle
  if (shorter.length >= 5 && longer.startsWith(shorter + ' ')) {
    return true;
  }
  
  // Also check without spaces for the start match
  const shorterNoSpaces = romNoSpaces.length < gameNoSpaces.length ? romNoSpaces : gameNoSpaces;
  const longerNoSpaces = romNoSpaces.length >= gameNoSpaces.length ? romNoSpaces : gameNoSpaces;
  
  if (shorterNoSpaces.length >= 5 && longerNoSpaces.startsWith(shorterNoSpaces)) {
    return true;
  }
  
  // Check if one is contained in the other (for cases with subtitles, etc.)
  // Lower threshold to 7 chars to catch more games
  if (shorter.length >= 7 && longer.includes(shorter)) {
    return true;
  }
  
  // Also check without spaces for substring matching
  if (shorterNoSpaces.length >= 7 && longerNoSpaces.includes(shorterNoSpaces)) {
    return true;
  }
  
  // Split into words and check if all significant words match
  const romWords = romNorm.split(' ').filter(w => w.length > 2); // Ignore short words like "a", "of", "the"
  const gameWords = gameNorm.split(' ').filter(w => w.length > 2);
  
  // If we have at least 2 words and they all match, it's a match
  if (romWords.length >= 2 && gameWords.length >= 2) {
    const allRomWordsInGame = romWords.every(word => gameWords.includes(word));
    const allGameWordsInRom = gameWords.every(word => romWords.includes(word));
    
    if (allRomWordsInGame || allGameWordsInRom) {
      return true;
    }
  }
  
  return false;
};

const isOfficialRelease = (name: string): boolean => {
  const lowerName = name.toLowerCase();
  
  // List of tags that indicate unofficial/non-commercial releases
  const unofficialTags = [
    '(proto', '(beta', '(demo', '(sample', '(pirate',
    '(unl)', '(unlicensed)', '(aftermarket)', '(homebrew)',
    '(hack)', '(bootleg)', '(alt)', '(test)',
    '[b]', // bad dump
    '(pre-release)', '(preview)', '(promo)',
  ];
  
  // Check if any unofficial tag is present
  return !unofficialTags.some(tag => lowerName.includes(tag));
};

const hasRevisionTag = (name: string, game?: any): boolean => {
  // For arcade games with cloneof attribute, they are clones/revisions
  if (game && game.cloneof) {
    return true;
  }
  
  const lowerName = name.toLowerCase();
  // Check if the name contains revision tags, set markers, or regional variants
  return /\(rev\s*\d*[a-z]?\)/i.test(lowerName) || 
         /\(v\d+(\.\d+)*\)/i.test(lowerName) ||
         /\(version\s*\d+\)/i.test(lowerName) ||
         /\(set\s*\d+\)/i.test(lowerName) ||
         /\(alt\s*\d*\)/i.test(lowerName) ||
         // Arcade-specific revision patterns
         /\d{2}\/\d{2}\/\d{2}/i.test(lowerName) || // Date codes like 94/07/18
         /revision\s*[a-z]/i.test(lowerName);
};

export function GameComparison({ datFiles, romLists, onAddToWantList, wantedGameIds, triggerMatching, setTriggerMatching }: GameComparisonProps) {
  // Filter states with localStorage persistence
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    return localStorage.getItem('filterSearchQuery') || '';
  });
  
  const [selectedSystem, setSelectedSystem] = useState<string>(() => {
    return localStorage.getItem('filterSelectedSystem') || 'all';
  });
  
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('filterSelectedRegions');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  const [categoryFilter, setCategoryFilter] = useState<string>(() => {
    return localStorage.getItem('filterCategoryFilter') || 'all';
  });
  
  const [releaseTypeFilter, setReleaseTypeFilter] = useState<'all' | 'official' | 'unofficial'>(() => {
    const saved = localStorage.getItem('filterReleaseTypeFilter');
    return (saved as 'all' | 'official' | 'unofficial') || 'all';
  });
  
  const [revisionFilter, setRevisionFilter] = useState<'all' | 'base' | 'revisions'>(() => {
    const saved = localStorage.getItem('filterRevisionFilter');
    return (saved as 'all' | 'base' | 'revisions') || 'all';
  });
  
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(() => {
    const saved = localStorage.getItem('filterViewMode');
    return (saved as 'cards' | 'table') || 'cards';
  });
  
  // Show/hide filters with localStorage persistence
  const [showFilters, setShowFilters] = useState<boolean>(() => {
    const saved = localStorage.getItem('showFilters');
    return saved ? JSON.parse(saved) : true; // Default to visible
  });

  // Track if this is the initial mount to prevent clearing regions on mount
  const isInitialMount = useRef(true);

  // Save all filter states to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('filterSearchQuery', searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('filterSelectedSystem', selectedSystem);
    // Clear region selections when system changes (but not on initial mount)
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      setSelectedRegions(new Set());
    }
  }, [selectedSystem]);

  useEffect(() => {
    localStorage.setItem('filterSelectedRegions', JSON.stringify(Array.from(selectedRegions)));
  }, [selectedRegions]);

  useEffect(() => {
    localStorage.setItem('filterCategoryFilter', categoryFilter);
  }, [categoryFilter]);

  useEffect(() => {
    localStorage.setItem('filterReleaseTypeFilter', releaseTypeFilter);
  }, [releaseTypeFilter]);

  useEffect(() => {
    localStorage.setItem('filterRevisionFilter', revisionFilter);
  }, [revisionFilter]);

  useEffect(() => {
    localStorage.setItem('filterViewMode', viewMode);
  }, [viewMode]);

  // Save filter visibility to localStorage
  useEffect(() => {
    localStorage.setItem('showFilters', JSON.stringify(showFilters));
  }, [showFilters]);
  
  // Persist matching state and results
  const [matchingState, setMatchingState] = useState<'idle' | 'matching' | 'complete'>(() => {
    const saved = localStorage.getItem('matchingState');
    return (saved as 'idle' | 'matching' | 'complete') || 'idle';
  });
  
  const [matchProgress, setMatchProgress] = useState({ current: 0, total: 0, system: '' });
  
  const [comparisonResults, setComparisonResults] = useState<GameMatch[]>(() => {
    const saved = localStorage.getItem('comparisonResults');
    return saved ? JSON.parse(saved) : [];
  });

  // Save matching state to localStorage
  useEffect(() => {
    localStorage.setItem('matchingState', matchingState);
  }, [matchingState]);

  // Save comparison results to localStorage
  useEffect(() => {
    if (comparisonResults.length > 0) {
      localStorage.setItem('comparisonResults', JSON.stringify(comparisonResults));
    }
  }, [comparisonResults]);

  // Handle matching triggers from Setup tab
  useEffect(() => {
    if (!triggerMatching || !setTriggerMatching) return;
    
    if (triggerMatching === 'all') {
      // Re-match all: Clear everything and start fresh
      triggerManualRematch();
    } else if (triggerMatching === 'new') {
      // Match new: Just trigger matching with current settings (will match what's in systemsToMatch)
      setMatchingState('idle');
    }
    
    // Clear the trigger
    setTriggerMatching(null);
  }, [triggerMatching, setTriggerMatching]);

  // Initialize processed tracking from existing results on first load
  useEffect(() => {
    // Only run once on mount
    const hasInitialized = localStorage.getItem('processedTrackingInitialized');
    if (hasInitialized) return;
    
    // If we have comparison results but no processed tracking, initialize it
    if (comparisonResults.length > 0) {
      const existingSystemsInResults = new Set(comparisonResults.map(r => r.systemName));
      
      // Initialize processedDats for systems we have results for
      const initialProcessedDats = datFiles
        .filter(d => existingSystemsInResults.has(d.system))
        .map(d => `${d.name}-${d.system}-${d.games.length}`);
      
      if (initialProcessedDats.length > 0) {
        localStorage.setItem('processedDats', JSON.stringify(initialProcessedDats));
      }
      
      // Initialize processedRomLists for systems we have results for  
      const initialProcessedRoms = romLists
        .filter(r => existingSystemsInResults.has(r.systemName))
        .map(r => `${r.systemName}-${r.roms.length}`);
      
      if (initialProcessedRoms.length > 0) {
        localStorage.setItem('processedRomLists', JSON.stringify(initialProcessedRoms));
      }
    }
    
    // Mark as initialized
    localStorage.setItem('processedTrackingInitialized', 'true');
  }, []); // Only run once on mount

  // Smart incremental matching - only process NEW DAT files and ROM lists
  useEffect(() => {
    console.log('🔍 DETECTION EFFECT RUNNING');
    
    // Get previously processed data
    const processedDatsJson = localStorage.getItem('processedDats');
    const processedDats = processedDatsJson ? JSON.parse(processedDatsJson) : [];
    
    const processedRomsJson = localStorage.getItem('processedRomLists');
    const processedRoms = processedRomsJson ? JSON.parse(processedRomsJson) : [];
    
    console.log('📦 processedDats:', processedDats);
    console.log('📦 processedRoms:', processedRoms);
    
    // CRITICAL FIX: If processedDats is empty, clear systemsToMatch (user cleared everything)
    if (processedDats.length === 0 && datFiles.length > 0) {
      const systemsToMatchJson = localStorage.getItem('systemsToMatch');
      if (systemsToMatchJson) {
        console.log('🧹 processedDats is empty but systemsToMatch exists - clearing stale data');
        localStorage.removeItem('systemsToMatch');
      }
    }
    
    // Create BETTER identifiers for current data using filename + system + game count
    const currentDatIds = datFiles.map(d => `${d.name}-${d.system}-${d.games.length}`);
    const currentRomIds = romLists.map(r => `${r.systemName}-${r.roms.length}`);
    
    console.log('📋 currentDatIds:', currentDatIds);
    console.log('📋 currentRomIds:', currentRomIds);
    
    // Get current system names
    const currentSystems = new Set(datFiles.map(d => d.system));
    
    // DELETION DETECTION: Check if any systems were removed
    // Check BOTH processedDats AND comparisonResults for previously existing systems
    const previousSystems = new Set<string>();
    
    // Add systems from processedDats
    processedDats.forEach((id: string) => {
      const parts = id.split('-');
      if (parts.length >= 2) {
        // Extract system name (it's the second-to-last part before the game count)
        const systemName = parts[parts.length - 2];
        previousSystems.add(systemName);
      }
    });
    
    // ALSO add systems from comparisonResults (in case processedDats was cleared)
    comparisonResults.forEach(result => {
      previousSystems.add(result.systemName);
    });
    
    const deletedSystems = Array.from(previousSystems).filter(sys => !currentSystems.has(sys));
    
    console.log('🗑️ Deleted systems detected:', deletedSystems);
    
    // If systems were deleted, clean up comparison results
    if (deletedSystems.length > 0 && comparisonResults.length > 0) {
      const filteredResults = comparisonResults.filter(
        result => !deletedSystems.includes(result.systemName)
      );
      setComparisonResults(filteredResults);
      
      // Clean up processed tracking
      const updatedProcessedDats = processedDats.filter((id: string) => {
        return !deletedSystems.some(sys => id.includes(`-${sys}-`));
      });
      localStorage.setItem('processedDats', JSON.stringify(updatedProcessedDats));
      
      const updatedProcessedRoms = processedRoms.filter((id: string) => {
        return !deletedSystems.some(sys => id.startsWith(`${sys}-`));
      });
      localStorage.setItem('processedRomLists', JSON.stringify(updatedProcessedRoms));
      
      // Clean up systemsToMatch
      const systemsToMatchJson = localStorage.getItem('systemsToMatch');
      if (systemsToMatchJson) {
        const systemsToMatch = JSON.parse(systemsToMatchJson);
        const updatedSystemsToMatch = {
          newDatSystems: systemsToMatch.newDatSystems.filter((s: string) => !deletedSystems.includes(s)),
          changedRomSystems: systemsToMatch.changedRomSystems.filter((s: string) => !deletedSystems.includes(s))
        };
        
        if (updatedSystemsToMatch.newDatSystems.length === 0 && updatedSystemsToMatch.changedRomSystems.length === 0) {
          localStorage.removeItem('systemsToMatch');
        } else {
          localStorage.setItem('systemsToMatch', JSON.stringify(updatedSystemsToMatch));
        }
      }
      
      // If all systems were deleted, reset to idle
      if (filteredResults.length === 0 && currentSystems.size === 0) {
        setMatchingState('idle');
        localStorage.removeItem('comparisonResults');
        localStorage.removeItem('processedDats');
        localStorage.removeItem('processedRomLists');
        localStorage.removeItem('systemsToMatch');
      }
    }
    
    // Find NEW DAT files (not in processed list)
    // CRITICAL: Only detect "new" DATs if we have a baseline (processedDats is not empty)
    // If processedDats is empty, this is first-time setup and we shouldn't track "new" systems
    const newDats = processedDats.length > 0 
      ? datFiles.filter((d, i) => !processedDats.includes(currentDatIds[i]))
      : [];
    
    console.log('🆕 newDats:', newDats.map(d => d.system));
    
    // Find ROM lists for systems that weren't processed before OR that have changed
    // CRITICAL: Only detect "changed" ROMs if we have a baseline (processedRoms is not empty)
    const newOrChangedRomSystems = processedRoms.length > 0
      ? romLists.filter(r => {
          const currentId = `${r.systemName}-${r.roms.length}`;
          return !processedRoms.includes(currentId);
        }).map(r => r.systemName)
      : [];
    
    console.log('🔄 newOrChangedRomSystems:', newOrChangedRomSystems);
    
    // ALWAYS track new/changed systems, regardless of matchingState
    if (newDats.length > 0 || newOrChangedRomSystems.length > 0) {
      // Store which systems need matching
      const existingSystemsToMatch = localStorage.getItem('systemsToMatch');
      const existingSystems = existingSystemsToMatch ? JSON.parse(existingSystemsToMatch) : { newDatSystems: [], changedRomSystems: [] };
      
      // CRITICAL FIX: Filter out deleted systems from existing tracked systems
      const validExistingNewDats = existingSystems.newDatSystems.filter((sys: string) => currentSystems.has(sys));
      const validExistingChangedRoms = existingSystems.changedRomSystems.filter((sys: string) => currentSystems.has(sys));
      
      const updatedSystemsToMatch = {
        newDatSystems: [...new Set([...validExistingNewDats, ...newDats.map(d => d.system)])],
        changedRomSystems: [...new Set([...validExistingChangedRoms, ...newOrChangedRomSystems])]
      };
      
      console.log('💾 Setting systemsToMatch to:', updatedSystemsToMatch);
      
      localStorage.setItem('systemsToMatch', JSON.stringify(updatedSystemsToMatch));
    }
    
    // Store current ROM lists for change detection (no longer needed, but keep for backward compat)
    romLists.forEach(r => {
      localStorage.setItem(`romList-${r.systemName}`, JSON.stringify({ roms: r.roms }));
    });
  }, [datFiles, romLists, matchingState, comparisonResults]);

  // Manual re-match function - clears all tracking and forces complete re-match
  const triggerManualRematch = () => {
    // Clear all tracking data
    localStorage.removeItem('processedDats');
    localStorage.removeItem('processedRomLists');
    localStorage.removeItem('systemsToMatch');
    localStorage.removeItem('comparisonResults');
    localStorage.removeItem('processedTrackingInitialized');
    
    // Clear ROM list cache
    romLists.forEach(r => {
      localStorage.removeItem(`romList-${r.systemName}`);
    });
    
    // Reset state
    setComparisonResults([]);
    setMatchingState('idle');
  };

  // Manual re-match for a specific system
  const triggerSystemRematch = (systemName: string) => {
    // Get current systems to match
    const systemsToMatchJson = localStorage.getItem('systemsToMatch');
    const existingSystems = systemsToMatchJson ? JSON.parse(systemsToMatchJson) : { newDatSystems: [], changedRomSystems: [] };
    
    // Add this system to the list of systems to match
    localStorage.setItem('systemsToMatch', JSON.stringify({
      newDatSystems: [...new Set([...existingSystems.newDatSystems, systemName])],
      changedRomSystems: [...new Set([...existingSystems.changedRomSystems, systemName])]
    }));

    // Remove results for this system
    const filteredResults = comparisonResults.filter(result => result.systemName !== systemName);
    setComparisonResults(filteredResults);
    
    // Update processed tracking to exclude this system
    const processedDatsJson = localStorage.getItem('processedDats');
    const processedDats = processedDatsJson ? JSON.parse(processedDatsJson) : [];
    const updatedProcessedDats = processedDats.filter((id: string) => !id.includes(`-${systemName}-`));
    localStorage.setItem('processedDats', JSON.stringify(updatedProcessedDats));
    
    const processedRomsJson = localStorage.getItem('processedRomLists');
    const processedRoms = processedRomsJson ? JSON.parse(processedRomsJson) : [];
    const updatedProcessedRoms = processedRoms.filter((id: string) => !id.startsWith(`${systemName}-`));
    localStorage.setItem('processedRomLists', JSON.stringify(updatedProcessedRoms));
    
    // Trigger re-match
    setMatchingState('idle');
  };

  // Start matching process - INCREMENTAL VERSION with REAL-TIME PROGRESS
  const startMatching = async () => {
    setMatchingState('matching');
    
    // Get which systems need matching
    const systemsToMatchJson = localStorage.getItem('systemsToMatch');
    const systemsToMatch = systemsToMatchJson ? JSON.parse(systemsToMatchJson) : { newDatSystems: [], changedRomSystems: [] };
    
    const systemsNeedingMatch = new Set([
      ...systemsToMatch.newDatSystems,
      ...systemsToMatch.changedRomSystems
    ]);
    
    // If no specific systems to match, match everything (first time)
    const isFirstTimeMatch = systemsNeedingMatch.size === 0;
    
    const newResults: GameMatch[] = [];
    let totalGames = 0;
    let processedGames = 0;

    // Calculate total games for progress (only for systems that need matching)
    datFiles.forEach(datFile => {
      if (isFirstTimeMatch || systemsNeedingMatch.has(datFile.system)) {
        totalGames += datFile.games.length;
      }
    });

    setMatchProgress({ current: 0, total: totalGames, system: '' });

    // Get existing results to preserve
    const existingResults = isFirstTimeMatch ? [] : comparisonResults.filter(
      result => !systemsNeedingMatch.has(result.systemName)
    );

    // Process each system ONE AT A TIME with delays to allow UI updates
    for (const datFile of datFiles) {
      // Skip systems that don't need matching
      if (!isFirstTimeMatch && !systemsNeedingMatch.has(datFile.system)) {
        continue;
      }
      
      // Find the ROM list for this system
      const romList = romLists.find(list => list.systemName === datFile.system);
      const romFiles = romList ? romList.roms : [];

      setMatchProgress({ current: processedGames, total: totalGames, system: datFile.system });

      // Process games in batches of 50 to allow UI updates
      const batchSize = 50;
      for (let i = 0; i < datFile.games.length; i += batchSize) {
        const batch = datFile.games.slice(i, Math.min(i + batchSize, datFile.games.length));
        
        batch.forEach(game => {
          let hasRom = false;
          let matchedRom: RomFile | undefined;
          let matchMethod: 'filename' | 'exact' | undefined;

          // Match using the GAME NAME attribute, not individual ROM chip names
          // For arcade/MAME DATs: <game name="88games"> should match "88games.zip"
          // For console DATs: <game name="Super Mario Bros"> should match the game name
          const gameNameToMatch = game.name;
          
          if (gameNameToMatch) {
            const exactMatch = romFiles.find(rom => rom.name === gameNameToMatch);
            if (exactMatch) {
              hasRom = true;
              matchedRom = exactMatch;
              matchMethod = 'exact';
            } else {
              // Try improved fuzzy matching with the new algorithm
              const fuzzyMatch = romFiles.find(rom => matchRomToGame(rom.name, gameNameToMatch));
              if (fuzzyMatch) {
                hasRom = true;
                matchedRom = fuzzyMatch;
                matchMethod = 'filename';
              }
            }
          }

          // NEW: Find alternate regions for this game
          const alternateRegions: { region: string; hasRom: boolean }[] = [];
          const baseName = getBaseGameName(game.name || game.description || '');
          
          // Search all games in the same system for matches with different regions
          datFile.games.forEach(otherGame => {
            if (otherGame.region && otherGame.region !== game.region) {
              const otherBaseName = getBaseGameName(otherGame.name || otherGame.description || '');
              // If base names match, this is the same game in a different region
              if (baseName === otherBaseName) {
                // Check if we have a ROM for this alternate region - be SPECIFIC about the region
                let hasAlternateRom = false;
                
                if (otherGame.rom?.name) {
                  // First try exact match
                  const exactMatch = romFiles.find(rom => rom.name === otherGame.rom!.name);
                  if (exactMatch) {
                    hasAlternateRom = true;
                  } else {
                    // Try fuzzy match but keep the region in the comparison
                    const fuzzyMatch = romFiles.find(rom => {
                      // Normalize but DON'T strip region tags - we need to preserve them
                      const romNormalized = normalizeForMatching(rom.name);
                      const gameNormalized = normalizeForMatching(otherGame.rom!.name);
                      return romNormalized === gameNormalized;
                    });
                    if (fuzzyMatch) {
                      hasAlternateRom = true;
                    }
                  }
                }
                
                // Only add if not already in the list
                if (!alternateRegions.some(ar => ar.region === otherGame.region)) {
                  alternateRegions.push({ 
                    region: otherGame.region, 
                    hasRom: hasAlternateRom 
                  });
                }
              }
            }
          });

          newResults.push({
            game: {
              ...game,
              description: game.description || game.name,
            },
            hasRom,
            matchedRom,
            matchMethod,
            systemName: datFile.system,
            alternateRegions: alternateRegions.length > 0 ? alternateRegions : undefined,
          });

          processedGames++;
        });

        // Update progress after each batch
        setMatchProgress({ current: processedGames, total: totalGames, system: datFile.system });
        
        // Yield to browser to allow UI update (small delay)
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    // Set final results
    setComparisonResults([...existingResults, ...newResults]);
    setMatchProgress({ current: totalGames, total: totalGames, system: 'Complete' });
    setMatchingState('complete');
    
    // Save which DAT files and ROM lists we've processed
    const currentDatIds = datFiles.map(d => `${d.name}-${d.system}-${d.games.length}`);
    const currentRomIds = romLists.map(r => `${r.systemName}-${r.roms.length}`);
    localStorage.setItem('processedDats', JSON.stringify(currentDatIds));
    localStorage.setItem('processedRomLists', JSON.stringify(currentRomIds));
    
    // Clear the systems to match list
    localStorage.removeItem('systemsToMatch');
  };

  // Compare ROMs with DAT files (now only used after matching is complete)
  const comparison = comparisonResults;

  // Get unique systems for filter
  const systems = useMemo(() => {
    const systemSet = new Set<string>();
    comparison.forEach(match => {
      systemSet.add(match.systemName);
    });
    return Array.from(systemSet).sort();
  }, [comparison]);

  // Get unique regions and categories for filters
  const regions = useMemo(() => {
    const regionSet = new Set<string>();
    comparison.forEach(match => {
      // Only include regions from the selected system
      if (selectedSystem === 'all' || match.systemName === selectedSystem) {
        if (match.game.region) {
          const sanitizedRegion = sanitizeRegion(match.game.region);
          if (sanitizedRegion) {
            regionSet.add(sanitizedRegion);
          }
        }
      }
    });
    return Array.from(regionSet).sort();
  }, [comparison, selectedSystem]);

  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    comparison.forEach(match => {
      if (match.game.category) {
        categorySet.add(match.game.category);
      }
    });
    return Array.from(categorySet).sort();
  }, [comparison]);

  // Filter results
  const filteredResults = useMemo(() => {
    return comparison.filter(match => {
      // System filter
      if (selectedSystem !== 'all' && match.systemName !== selectedSystem) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          match.game.name.toLowerCase().includes(query) ||
          match.game.description?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Region filter
      if (selectedRegions.size > 0) {
        const sanitizedGameRegion = sanitizeRegion(match.game.region);
        if (!sanitizedGameRegion || !selectedRegions.has(sanitizedGameRegion)) return false;
      }

      // Category filter
      if (categoryFilter !== 'all') {
        if (match.game.category !== categoryFilter) return false;
      }

      // Release type filter
      if (releaseTypeFilter !== 'all') {
        const isOfficial = isOfficialRelease(match.game.name || match.game.description || '');
        if (releaseTypeFilter === 'official' && !isOfficial) return false;
        if (releaseTypeFilter === 'unofficial' && isOfficial) return false;
      }

      // Revision filter
      if (revisionFilter !== 'all') {
        const hasRev = hasRevisionTag(match.game.name || match.game.description || '', match.game);
        if (revisionFilter === 'base' && hasRev) return false; // Exclude revisions/clones
        if (revisionFilter === 'revisions' && !hasRev) return false; // Only show revisions/clones
      }

      return true;
    });
  }, [comparison, selectedSystem, searchQuery, selectedRegions, categoryFilter, releaseTypeFilter, revisionFilter]);

  const stats = useMemo(() => {
    // Calculate stats based on FILTERED results, not all games
    const total = filteredResults.length;
    const have = filteredResults.filter(m => m.hasRom).length;
    const missing = total - have;
    const percentage = total > 0 ? ((have / total) * 100).toFixed(1) : '0';

    return { total, have, missing, percentage };
  }, [filteredResults]);

  const exportMissingList = () => {
    const missingGames = filteredResults
      .filter(match => !match.hasRom)
      .map(match => match.game.rom?.name || match.game.name)
      .join('\n');

    const blob = new Blob([missingGames], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'missing-roms.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (datFiles.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Upload DAT files to start comparing your collection</p>
      </Card>
    );
  }

  // Show start button if no matching has been done yet
  if (matchingState === 'idle') {
    // Get which systems need matching
    const systemsToMatchJson = localStorage.getItem('systemsToMatch');
    const systemsToMatch = systemsToMatchJson ? JSON.parse(systemsToMatchJson) : { newDatSystems: [], changedRomSystems: [] };
    
    console.log('🎯 IDLE SCREEN - systemsToMatch:', systemsToMatch);
    
    const systemsNeedingMatch = [...new Set([
      ...systemsToMatch.newDatSystems,
      ...systemsToMatch.changedRomSystems
    ])];
    
    console.log('🎯 IDLE SCREEN - systemsNeedingMatch:', systemsNeedingMatch);
    
    // If there are specific systems to match, show only those
    const isFirstTimeMatch = systemsNeedingMatch.length === 0;
    
    console.log('🎯 IDLE SCREEN - isFirstTimeMatch:', isFirstTimeMatch);
    
    // Calculate counts for NEW systems only (or all if first time)
    let newSystemCount = 0;
    let newGameCount = 0;
    let newRomCount = 0;
    
    if (isFirstTimeMatch) {
      // First time - show all
      newSystemCount = datFiles.length;
      newGameCount = datFiles.reduce((sum, dat) => sum + dat.games.length, 0);
      newRomCount = romLists.reduce((sum, list) => sum + list.roms.length, 0);
    } else {
      // Show only new/changed systems
      newSystemCount = systemsNeedingMatch.length;
      
      datFiles.forEach(dat => {
        if (systemsNeedingMatch.includes(dat.system)) {
          newGameCount += dat.games.length;
        }
      });
      
      romLists.forEach(list => {
        if (systemsNeedingMatch.includes(list.systemName)) {
          newRomCount += list.roms.length;
        }
      });
    }
    
    return (
      <Card className="p-12 text-center neon-card">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-6" style={{
              boxShadow: '0 0 30px var(--neon-cyan)'
            }}>
              <Gamepad2 className="size-16 stat-glow-cyan" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold uppercase stat-glow-pink">
            {isFirstTimeMatch ? 'READY TO MATCH' : 'NEW SYSTEMS TO MATCH'}
          </h2>
          
          {!isFirstTimeMatch && systemsNeedingMatch.length > 0 && (
            <div className="p-4 bg-cyan-500/10 border border-cyan-500 rounded-md">
              <p className="text-sm stat-glow-cyan font-medium mb-2">
                {systemsNeedingMatch.length === 1 ? '1 New System Detected' : `${systemsNeedingMatch.length} New Systems Detected`}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {systemsNeedingMatch.map(system => (
                  <Badge key={system} className="neon-badge" style={{
                    borderColor: 'var(--neon-cyan)',
                    color: 'var(--neon-cyan)'
                  }}>
                    {system}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <Card className="p-4 neon-card">
              <p className="text-sm text-muted-foreground uppercase">{isFirstTimeMatch ? 'Systems' : 'New Systems'}</p>
              <p className="text-2xl font-bold stat-glow-cyan">{newSystemCount}</p>
            </Card>
            <Card className="p-4 neon-card">
              <p className="text-sm text-muted-foreground uppercase">Games</p>
              <p className="text-2xl font-bold stat-glow-pink">{newGameCount.toLocaleString()}</p>
            </Card>
            <Card className="p-4 neon-card">
              <p className="text-sm text-muted-foreground uppercase">ROMs</p>
              <p className="text-2xl font-bold stat-glow-purple">{newRomCount.toLocaleString()}</p>
            </Card>
          </div>

          {romLists.length === 0 ? (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500 rounded-md">
              <p className="text-sm text-yellow-400">⚠️ Upload ROM lists in the Setup tab before matching</p>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground">
                {isFirstTimeMatch 
                  ? 'Click below to start matching your ROMs against the DAT database.'
                  : `Click below to match the ${systemsNeedingMatch.length === 1 ? 'new system' : 'new systems'}.`
                }
                <br />
                This may take a few moments for large collections.
              </p>
              
              <Button
                onClick={startMatching}
                size="lg"
                className="neon-button text-lg px-8 py-6"
                style={{
                  boxShadow: '0 0 20px var(--neon-pink)',
                }}
              >
                <Gamepad2 className="mr-2 h-6 w-6" />
                {isFirstTimeMatch ? 'START MATCHING' : `MATCH ${systemsNeedingMatch.length === 1 ? 'SYSTEM' : 'SYSTEMS'}`}
              </Button>
            </>
          )}
        </div>
      </Card>
    );
  }

  // Show loading overlay while matching
  if (matchingState === 'matching') {
    return (
      <Card className="p-8 neon-card">
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-t-2 border-primary" style={{
              borderColor: 'var(--neon-pink)',
              boxShadow: '0 0 20px var(--neon-pink)'
            }}></div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2 stat-glow-cyan">MATCHING ROMs...</h3>
            <p className="text-muted-foreground mb-4">
              Processing {matchProgress.system}
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm mb-2">
                <span className="stat-glow-pink">{matchProgress.current.toLocaleString()} / {matchProgress.total.toLocaleString()} games</span>
                <span className="stat-glow-green">{matchProgress.total > 0 ? Math.round((matchProgress.current / matchProgress.total) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-background/50 rounded-full h-3 overflow-hidden border border-primary/30">
                <div 
                  className="h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${matchProgress.total > 0 ? (matchProgress.current / matchProgress.total) * 100 : 0}%`,
                    background: 'linear-gradient(90deg, var(--neon-pink), var(--neon-cyan), var(--neon-purple))',
                    boxShadow: '0 0 10px var(--neon-cyan)',
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 neon-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Games</p>
          <p className="text-2xl font-bold stat-glow-cyan">{stats.total}</p>
        </Card>
        <Card className="p-3 neon-card" style={{
          borderColor: 'var(--neon-green)',
          boxShadow: '0 0 10px var(--neon-green)'
        }}>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Have</p>
          <p className="text-2xl font-bold stat-glow-green">{stats.have}</p>
        </Card>
        <Card className="p-3 neon-card" style={{
          borderColor: '#ff0055',
          boxShadow: '0 0 10px #ff0055'
        }}>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Missing</p>
          <p className="text-2xl font-bold stat-glow-red">{stats.missing}</p>
        </Card>
        <Card className="p-3 neon-card" style={{
          borderColor: 'var(--neon-pink)',
          boxShadow: '0 0 10px var(--neon-pink)'
        }}>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Collection</p>
          <p className="text-2xl font-bold stat-glow-pink">{stats.percentage}%</p>
        </Card>
      </div>

      {/* Re-Match Button */}
      <div className="flex justify-end gap-2">
        <Select
          value="select"
          onValueChange={(value) => {
            if (value === 'all') {
              triggerManualRematch();
            } else {
              triggerSystemRematch(value);
            }
          }}
        >
          <SelectTrigger className="h-7 w-[180px] text-xs" style={{
            borderColor: 'var(--neon-orange)',
            color: 'var(--neon-orange)'
          }}>
            <Gamepad2 className="size-3 mr-1" />
            <SelectValue placeholder="Re-Match..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Re-Match All Systems</SelectItem>
            {systems.length > 0 && <div className="h-px bg-border my-1" />}
            {systems.map(system => (
              <SelectItem key={system} value={system}>Re-Match {system}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filters */}
      <Card className="p-3">
        {/* Toggle Button */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium uppercase tracking-wide stat-glow-cyan flex items-center gap-2">
            <Filter className="size-3" />
            Filters
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 h-7 text-xs"
          >
            {showFilters ? (
              <>
                <ChevronUp className="size-3" />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className="size-3" />
                Show
              </>
            )}
          </Button>
        </div>

        {showFilters && (
          <>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                <Input
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 h-8 text-sm"
                />
              </div>
              
              <Select value={selectedSystem} onValueChange={setSelectedSystem}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="All Systems" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Systems</SelectItem>
                  {systems.map(system => (
                    <SelectItem key={system} value={system}>{system}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-all h-8 px-2 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground">
                  <Filter className="size-3" />
                  {selectedRegions.size > 0 ? `Regions (${selectedRegions.size})` : 'All Regions'}
                </PopoverTrigger>
                <PopoverContent className="p-3 space-y-1 max-h-60 overflow-y-auto">
                  <Button 
                    onClick={() => {
                      // Export region data for debugging
                      const rawRegions = new Map<string, Set<string>>();
                      comparison.forEach(match => {
                        if (selectedSystem === 'all' || match.systemName === selectedSystem) {
                          if (match.game.region) {
                            const sanitized = sanitizeRegion(match.game.region);
                            if (!rawRegions.has(match.game.region)) {
                              rawRegions.set(match.game.region, new Set());
                            }
                            if (sanitized) {
                              rawRegions.get(match.game.region)!.add(sanitized);
                            }
                          }
                        }
                      });
                      
                      const exportData = {
                        totalUniqueRegions: regions.length,
                        regions: regions,
                        rawToSanitized: Object.fromEntries(
                          Array.from(rawRegions.entries()).map(([raw, sanitized]) => [
                            raw,
                            Array.from(sanitized)
                          ])
                        )
                      };
                      
                      console.log('=== REGION DEBUG EXPORT ===');
                      console.log(JSON.stringify(exportData, null, 2));
                      console.log('=== END DEBUG ===');
                      
                      // Also copy to clipboard
                      navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
                      alert('Region data exported to console and copied to clipboard!');
                    }}
                    className="w-full mb-2 text-xs"
                    variant="outline"
                  >
                    🐛 Export Region Debug Data
                  </Button>
                  {regions.map(region => (
                    <div key={region} className="flex items-center">
                      <Checkbox
                        id={region}
                        checked={selectedRegions.has(region)}
                        onCheckedChange={(checked) => {
                          const newRegions = new Set(selectedRegions);
                          if (checked) {
                            newRegions.add(region);
                          } else {
                            newRegions.delete(region);
                          }
                          setSelectedRegions(newRegions);
                        }}
                      />
                      <Label className="ml-2 text-xs" htmlFor={region}>{region}</Label>
                    </div>
                  ))}
                </PopoverContent>
              </Popover>

              {categories.length > 0 && (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid gap-2 md:grid-cols-2 mt-2">
              <Select value={releaseTypeFilter} onValueChange={(v) => setReleaseTypeFilter(v as any)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="All Releases" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Releases</SelectItem>
                  <SelectItem value="official">Official Releases Only</SelectItem>
                  <SelectItem value="unofficial">Proto/Demo/Pirate Only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={revisionFilter} onValueChange={(v) => setRevisionFilter(v as any)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="All Versions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Versions</SelectItem>
                  <SelectItem value="base">Base Versions Only</SelectItem>
                  <SelectItem value="revisions">Revisions Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div className={`flex items-center justify-between ${showFilters ? 'mt-3 pt-3 border-t' : ''}`}>
          <p className="text-xs text-muted-foreground">
            Showing {filteredResults.length} of {comparison.length} games
          </p>
          <div className="flex gap-2">
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="rounded-r-none h-7 px-2"
              >
                <LayoutGrid className="size-3" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-l-none h-7 px-2"
              >
                <Table className="size-3" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportMissingList}
              className="flex items-center gap-1 h-7 px-2 text-xs"
            >
              <Download className="size-3" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Results */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="text-xs">All Games</TabsTrigger>
          <TabsTrigger value="have" className="text-xs">Have ({stats.have})</TabsTrigger>
          <TabsTrigger value="missing" className="text-xs">Missing ({stats.missing})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-1 mt-3">
          <GameList games={filteredResults} viewMode={viewMode} regions={regions} onAddToWantList={onAddToWantList} wantedGameIds={wantedGameIds} />
        </TabsContent>

        <TabsContent value="have" className="space-y-1 mt-3">
          <GameList games={filteredResults.filter(m => m.hasRom)} viewMode={viewMode} regions={regions} onAddToWantList={onAddToWantList} wantedGameIds={wantedGameIds} />
        </TabsContent>

        <TabsContent value="missing" className="space-y-1 mt-3">
          <GameList games={filteredResults.filter(m => !m.hasRom)} viewMode={viewMode} regions={regions} onAddToWantList={onAddToWantList} wantedGameIds={wantedGameIds} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GameList({ games, viewMode, regions, onAddToWantList, wantedGameIds }: {
  games: GameMatch[];
  viewMode: 'cards' | 'table';
  regions: string[];
  onAddToWantList?: (game: {
    id: string;
    name: string;
    systemName: string;
    region?: string;
    category?: string;
    romName?: string;
  }) => void;
  wantedGameIds?: Set<string>;
}) {
  if (games.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No games match your filters</p>
      </Card>
    );
  }

  if (viewMode === 'table') {
    return <GameTable games={games} regions={regions} />;
  }

  // Card view (default) - Limit to 200 items for performance
  const renderLimit = 200;
  const visibleGames = games.slice(0, renderLimit);
  const hasMore = games.length > renderLimit;
  
  return (
    <>
      <div className="space-y-1 max-h-[600px] overflow-y-auto">
        {visibleGames.map((match, index) => (
          <Card key={`${match.systemName}-${match.game.name}-${index}`} className={`p-2 ${match.hasRom ? 'neon-card' : ''}`} style={
            match.hasRom ? {
              borderColor: 'var(--neon-green)',
              boxShadow: '0 0 8px var(--neon-green)'
            } : undefined
          }>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                {match.hasRom ? (
                  <CheckCircle2 className="size-4 shrink-0 stat-glow-green" />
                ) : (
                  <XCircle className="size-4 shrink-0 stat-glow-red" />
                )}
                <h3 className="text-sm font-medium truncate">{match.game.description || match.game.name}</h3>
              </div>
              
              <div className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground">
                <Badge variant="secondary" className="neon-badge text-xs py-0 h-5">{match.systemName}</Badge>
                {match.game.region && (
                  <Badge variant="outline" className="neon-badge text-xs py-0 h-5">{match.game.region}</Badge>
                )}
                {match.game.category && (
                  <Badge variant="secondary" className="neon-badge text-xs py-0 h-5">{match.game.category}</Badge>
                )}
                {match.hasRom && match.matchedRom && (
                  <span className="text-xs stat-glow-cyan">
                    ✓ {match.matchedRom.name}
                  </span>
                )}
              </div>

              {match.game.rom && !match.hasRom && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Looking for: {match.game.rom.name}
                </p>
              )}

              {/* Show alternate regions if game is missing */}
              {!match.hasRom && match.alternateRegions && match.alternateRegions.length > 0 && (
                <div className="mt-1.5 pt-1.5 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Alternate Regions:</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {match.alternateRegions.map((alt, i) => (
                      <Badge 
                        key={i} 
                        variant={alt.hasRom ? "default" : "outline"}
                        className="neon-badge text-xs py-0 h-5"
                        style={alt.hasRom ? {
                          backgroundColor: 'var(--neon-blue)',
                          borderColor: 'var(--neon-blue)',
                          boxShadow: '0 0 8px var(--neon-blue)'
                        } : undefined}
                      >
                        {alt.region} {alt.hasRom ? '✓' : '✗'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {match.hasRom && (
              <Badge className="shrink-0 stat-glow-green text-xs py-0 h-5" style={{
                backgroundColor: 'var(--neon-green)',
                borderColor: 'var(--neon-green)',
                boxShadow: '0 0 10px var(--neon-green)'
              }}>
                HAVE
              </Badge>
            )}
            
            {!match.hasRom && onAddToWantList && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const gameId = `${match.systemName}-${match.game.name || match.game.description}`;
                  if (wantedGameIds?.has(gameId)) return; // Already in want list
                  
                  onAddToWantList({
                    id: gameId,
                    name: match.game.description || match.game.name,
                    systemName: match.systemName,
                    region: match.game.region,
                    category: match.game.category,
                    romName: match.game.rom?.name,
                  });
                }}
                disabled={wantedGameIds?.has(`${match.systemName}-${match.game.name || match.game.description}`)}
                className="shrink-0 h-7 px-2 text-xs"
                style={{
                  borderColor: 'var(--neon-orange)',
                  color: wantedGameIds?.has(`${match.systemName}-${match.game.name || match.game.description}`) ? 'var(--muted-foreground)' : 'var(--neon-orange)'
                }}
              >
                <Star className="size-3 mr-1" />
                {wantedGameIds?.has(`${match.systemName}-${match.game.name || match.game.description}`) ? 'In Want List' : 'Add to Want List'}
              </Button>
            )}
          </div>
        </Card>
      ))}
      </div>
      {hasMore && (
        <Card className="p-3 text-center bg-yellow-500/10 border-yellow-500 mt-2">
          <p className="text-xs text-yellow-400">📊 Showing first {renderLimit} of {games.length} games for performance. Use filters to narrow results.</p>
        </Card>
      )}
    </>
  );
}

function GameTable({ games, regions }: { games: GameMatch[]; regions: string[] }) {
  // Group games by base name to show all regional variants together
  const groupedGames = useMemo(() => {
    const groups = new Map<string, GameMatch[]>();
    
    games.forEach(match => {
      const baseName = match.game.description?.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s*\[[^\]]*\]\s*/g, ' ').trim() || match.game.name;
      
      if (!groups.has(baseName)) {
        groups.set(baseName, []);
      }
      groups.get(baseName)!.push(match);
    });
    
    return Array.from(groups.entries()).map(([baseName, variants]) => ({
      baseName,
      variants,
    }));
  }, [games]);

  return (
    <div className="max-h-[600px] overflow-auto">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 bg-background border-b">
          <tr>
            <th className="text-left p-2 border-r font-medium">Game</th>
            {regions.map(region => (
              <th key={region} className="text-center p-2 border-r font-medium min-w-[60px]">
                {region}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groupedGames.map((group, groupIndex) => {
            // Find which regions this game has and which we own
            const regionStatus = new Map<string, { hasRom: boolean; match?: GameMatch }>();
            
            group.variants.forEach(variant => {
              if (variant.game.region) {
                regionStatus.set(variant.game.region, {
                  hasRom: variant.hasRom,
                  match: variant,
                });
              }
            });
            
            // Add alternate region info
            group.variants.forEach(variant => {
              variant.alternateRegions?.forEach(alt => {
                if (!regionStatus.has(alt.region)) {
                  regionStatus.set(alt.region, {
                    hasRom: alt.hasRom,
                  });
                }
              });
            });

            return (
              <tr key={groupIndex} className="border-b hover:bg-muted/50">
                <td className="p-2 border-r">
                  <div className="font-medium">{group.baseName}</div>
                  {group.variants[0].game.category && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      {group.variants[0].game.category}
                    </Badge>
                  )}
                </td>
                {regions.map(region => {
                  const status = regionStatus.get(region);
                  return (
                    <td key={region} className="p-2 border-r text-center">
                      {status ? (
                        status.hasRom ? (
                          <CheckCircle2 className="size-5 text-green-600 inline-block" />
                        ) : (
                          <XCircle className="size-5 text-red-600 inline-block" />
                        )
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
import { useMemo, useState, useEffect } from 'react';
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

const hasRevisionTag = (name: string): boolean => {
  const lowerName = name.toLowerCase();
  // Check if the name contains revision tags
  return /\(rev\s*\d*[a-z]?\)/i.test(lowerName) || 
         /\(v\d+(\.\d+)*\)/i.test(lowerName) ||
         /\(version\s*\d+\)/i.test(lowerName);
};

export function GameComparison({ datFiles, romLists, onAddToWantList, wantedGameIds }: GameComparisonProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<'all' | 'have' | 'missing' | 'missing-alt' | 'missing-all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [releaseTypeFilter, setReleaseTypeFilter] = useState<'all' | 'official' | 'unofficial'>('all');
  const [revisionFilter, setRevisionFilter] = useState<'all' | 'base' | 'revisions'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  // Show/hide filters with localStorage persistence
  const [showFilters, setShowFilters] = useState<boolean>(() => {
    const saved = localStorage.getItem('showFilters');
    return saved ? JSON.parse(saved) : true; // Default to visible
  });

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

  // Reset matching state when DAT files or ROM lists change
  useEffect(() => {
    // Create a hash of the current data to detect changes
    const currentHash = JSON.stringify({
      datCount: datFiles.length,
      romCount: romLists.length,
      systems: [...datFiles.map(d => d.system), ...romLists.map(r => r.systemName)].sort().join(',')
    });
    
    const savedHash = localStorage.getItem('dataHash');
    
    if (savedHash !== currentHash) {
      // Data has changed, reset matching
      setMatchingState('idle');
      setComparisonResults([]);
      localStorage.setItem('dataHash', currentHash);
      localStorage.removeItem('comparisonResults');
    }
  }, [datFiles, romLists]);

  // Start matching process
  const startMatching = async () => {
    setMatchingState('matching');
    
    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      const results: GameMatch[] = [];
      let totalGames = 0;
      let processedGames = 0;

      // Calculate total games for progress
      datFiles.forEach(datFile => {
        totalGames += datFile.games.length;
      });

      setMatchProgress({ current: 0, total: totalGames, system: '' });

      // Process each system
      datFiles.forEach(datFile => {
        // Find the ROM list for this system
        const romList = romLists.find(list => list.systemName === datFile.system);
        const romFiles = romList ? romList.roms : [];

        setMatchProgress({ current: processedGames, total: totalGames, system: datFile.system });

        datFile.games.forEach(game => {
          let hasRom = false;
          let matchedRom: RomFile | undefined;
          let matchMethod: 'filename' | 'exact' | undefined;

          // Try to match by filename (only against ROMs for this system)
          if (game.rom?.name) {
            const exactMatch = romFiles.find(rom => rom.name === game.rom!.name);
            if (exactMatch) {
              hasRom = true;
              matchedRom = exactMatch;
              matchMethod = 'exact';
            } else {
              // Try improved fuzzy matching with the new algorithm
              const fuzzyMatch = romFiles.find(rom => matchRomToGame(rom.name, game.rom!.name));
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

          results.push({
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
          
          // Update progress periodically (every 100 games to avoid too many updates)
          if (processedGames % 100 === 0) {
            setMatchProgress({ current: processedGames, total: totalGames, system: datFile.system });
          }
        });
      });

      // Set final results
      setComparisonResults(results);
      setMatchProgress({ current: totalGames, total: totalGames, system: 'Complete' });
      setMatchingState('complete');
    }, 100);
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
      if (match.game.region) {
        regionSet.add(match.game.region);
      }
    });
    return Array.from(regionSet).sort();
  }, [comparison]);

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
        if (!selectedRegions.has(match.game.region || '')) return false;
      }

      // Status filter
      if (statusFilter === 'have' && !match.hasRom) return false;
      if (statusFilter === 'missing' && match.hasRom) return false;
      if (statusFilter === 'missing-alt' && match.hasRom) return false;
      if (statusFilter === 'missing-alt' && match.alternateRegions?.every(ar => ar.hasRom)) return false;
      if (statusFilter === 'missing-all' && match.hasRom) return false;
      if (statusFilter === 'missing-all' && match.alternateRegions?.some(ar => ar.hasRom)) return false;

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
        const hasRev = hasRevisionTag(match.game.name || match.game.description || '');
        if (revisionFilter === 'base' && hasRev) return false; // Exclude revisions
        if (revisionFilter === 'revisions' && !hasRev) return false; // Only show revisions
      }

      return true;
    });
  }, [comparison, selectedSystem, searchQuery, selectedRegions, statusFilter, categoryFilter, releaseTypeFilter, revisionFilter]);

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
    const totalDatGames = datFiles.reduce((sum, dat) => sum + dat.games.length, 0);
    const totalRomCount = romLists.reduce((sum, list) => sum + list.roms.length, 0);
    
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
          
          <h2 className="text-3xl font-bold uppercase stat-glow-pink">READY TO MATCH</h2>
          
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <Card className="p-4 neon-card">
              <p className="text-sm text-muted-foreground uppercase">DAT Files</p>
              <p className="text-2xl font-bold stat-glow-cyan">{datFiles.length}</p>
              <p className="text-xs text-muted-foreground mt-1">{totalDatGames.toLocaleString()} games</p>
            </Card>
            <Card className="p-4 neon-card">
              <p className="text-sm text-muted-foreground uppercase">ROM Lists</p>
              <p className="text-2xl font-bold stat-glow-pink">{romLists.length}</p>
              <p className="text-xs text-muted-foreground mt-1">{totalRomCount.toLocaleString()} ROMs</p>
            </Card>
          </div>

          {romLists.length === 0 ? (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500 rounded-md">
              <p className="text-sm text-yellow-400">⚠️ Upload ROM lists in the Setup tab before matching</p>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground">
                Click below to start matching your ROMs against the DAT database.
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
                START MATCHING
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

              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="have">Have ROM</SelectItem>
                  <SelectItem value="missing">Missing ROM</SelectItem>
                  <SelectItem value="missing-alt">Missing (have in alt region)</SelectItem>
                  <SelectItem value="missing-all">Missing (all regions)</SelectItem>
                </SelectContent>
              </Select>
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

            <div className="grid gap-2 md:grid-cols-1 mt-2">
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
        <TabsList className="grid w-full grid-cols-3 h-9">
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

  // Card view (default)
  return (
    <div className="space-y-1 max-h-[600px] overflow-y-auto">
      {games.map((match, index) => (
        <Card key={index} className={`p-2 ${match.hasRom ? 'neon-card' : ''}`} style={
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
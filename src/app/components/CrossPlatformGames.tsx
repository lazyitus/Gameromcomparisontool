import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Gamepad2, Check, X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import type { DatFile } from './DatFileUploader';
import type { RomList } from './RomListUploader';

interface CrossPlatformGamesProps {
  datFiles: DatFile[];
  romLists: RomList[];
  comparisonResults: any[];
}

interface GamePlatform {
  system: string;
  fullName: string;
  owned: boolean;
  region?: string;
  category?: string;
}

interface CrossPlatformGame {
  baseName: string;
  platforms: GamePlatform[];
  totalPlatforms: number;
  ownedPlatforms: number;
}

// Parse game name to extract base title (removing region codes, versions, etc)
function parseGameName(name: string): string {
  // Remove common suffixes in parentheses and brackets
  let baseName = name
    // Remove (USA), (Japan), (Europe), etc
    .replace(/\s*\([^)]*\)/g, '')
    // Remove [!], [b], [a], [h], etc
    .replace(/\s*\[[^\]]*\]/g, '')
    // Remove version numbers like "v1.0", "Rev 1", etc
    .replace(/\s*v?\d+\.\d+/gi, '')
    .replace(/\s*Rev\s*\d+/gi, '')
    // Remove "The" at the beginning for better grouping
    .replace(/^The\s+/i, '')
    .trim();
  
  return baseName;
}

// Get system icon
function getSystemIcon(systemName: string): string {
  const lower = systemName.toLowerCase();
  if (lower.includes('nintendo') || lower.includes('nes') || lower.includes('snes') || lower.includes('n64') || lower.includes('gamecube') || lower.includes('wii')) return '🎮';
  if (lower.includes('playstation') || lower.includes('ps1') || lower.includes('ps2') || lower.includes('psx')) return '🕹️';
  if (lower.includes('sega') || lower.includes('genesis') || lower.includes('dreamcast') || lower.includes('saturn')) return '🎯';
  if (lower.includes('xbox')) return '🎲';
  if (lower.includes('arcade') || lower.includes('mame')) return '👾';
  if (lower.includes('gameboy') || lower.includes('gba') || lower.includes('gbc')) return '🎴';
  if (lower.includes('atari')) return '🕹️';
  return '🎮';
}

export function CrossPlatformGames({ datFiles, romLists, comparisonResults }: CrossPlatformGamesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);
  const [minPlatforms, setMinPlatforms] = useState(2);
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set());

  // Build cross-platform game database
  const crossPlatformGames = useMemo(() => {
    console.log('🔍 Building cross-platform database...');
    
    const gameMap = new Map<string, GamePlatform[]>();

    // Process each comparison result
    comparisonResults.forEach(result => {
      if (!result) return;

      const systemName = result.systemName || 'Unknown System';
      
      // Process games we have
      result.haveGames?.forEach((game: any) => {
        const baseName = parseGameName(game.name);
        if (!baseName) return;

        if (!gameMap.has(baseName)) {
          gameMap.set(baseName, []);
        }

        gameMap.get(baseName)!.push({
          system: systemName,
          fullName: game.name,
          owned: true,
          region: game.region,
          category: game.category,
        });
      });

      // Process games we don't have
      result.dontHaveGames?.forEach((game: any) => {
        const baseName = parseGameName(game.name);
        if (!baseName) return;

        if (!gameMap.has(baseName)) {
          gameMap.set(baseName, []);
        }

        gameMap.get(baseName)!.push({
          system: systemName,
          fullName: game.name,
          owned: false,
          region: game.region,
          category: game.category,
        });
      });
    });

    // Convert to array and calculate stats
    const games: CrossPlatformGame[] = [];
    
    gameMap.forEach((platforms, baseName) => {
      // Group by system (a game might have multiple versions per system)
      const systemMap = new Map<string, GamePlatform[]>();
      
      platforms.forEach(platform => {
        if (!systemMap.has(platform.system)) {
          systemMap.set(platform.system, []);
        }
        systemMap.get(platform.system)!.push(platform);
      });

      // Only include if game exists on multiple systems
      if (systemMap.size >= minPlatforms) {
        const uniquePlatforms: GamePlatform[] = [];
        
        systemMap.forEach((versions, system) => {
          // Prefer owned versions, or just take the first one
          const ownedVersion = versions.find(v => v.owned);
          uniquePlatforms.push(ownedVersion || versions[0]);
        });

        const ownedCount = uniquePlatforms.filter(p => p.owned).length;

        games.push({
          baseName,
          platforms: uniquePlatforms,
          totalPlatforms: uniquePlatforms.length,
          ownedPlatforms: ownedCount,
        });
      }
    });

    // Sort by number of platforms (descending), then by name
    games.sort((a, b) => {
      if (b.totalPlatforms !== a.totalPlatforms) {
        return b.totalPlatforms - a.totalPlatforms;
      }
      return a.baseName.localeCompare(b.baseName);
    });

    console.log(`✅ Found ${games.length} cross-platform games`);
    return games;
  }, [comparisonResults, minPlatforms]);

  // Filter games
  const filteredGames = useMemo(() => {
    return crossPlatformGames.filter(game => {
      // Search filter
      if (searchQuery && !game.baseName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Owned filter
      if (showOwnedOnly && game.ownedPlatforms === 0) {
        return false;
      }

      return true;
    });
  }, [crossPlatformGames, searchQuery, showOwnedOnly]);

  const toggleExpanded = (baseName: string) => {
    const newExpanded = new Set(expandedGames);
    if (newExpanded.has(baseName)) {
      newExpanded.delete(baseName);
    } else {
      newExpanded.add(baseName);
    }
    setExpandedGames(newExpanded);
  };

  // Calculate stats
  const totalGames = crossPlatformGames.length;
  const fullyOwned = crossPlatformGames.filter(g => g.ownedPlatforms === g.totalPlatforms).length;
  const partiallyOwned = crossPlatformGames.filter(g => g.ownedPlatforms > 0 && g.ownedPlatforms < g.totalPlatforms).length;

  if (comparisonResults.length === 0) {
    return (
      <Card className="p-12 text-center neon-card wantlist-empty">
        <Gamepad2 className="wantlist-empty-icon size-16 mx-auto mb-4 opacity-50" style={{
          filter: 'drop-shadow(0 0 10px var(--neon-cyan))',
          color: 'var(--neon-cyan)'
        }} />
        <h3 className="wantlist-empty-title text-xl font-bold mb-2 stat-glow-cyan">NO COMPARISON DATA</h3>
        <p className="wantlist-empty-text text-muted-foreground">
          Upload DAT files and ROM lists, then run matching to see cross-platform games!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 wantlist-container-spacing">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 grid-gap-compact">
        <Card className="wantlist-stats-card p-3 neon-card" style={{
          borderColor: 'var(--neon-cyan)',
          boxShadow: '0 0 10px var(--neon-cyan)'
        }}>
          <p className="wantlist-stats-label text-xs text-muted-foreground uppercase tracking-wide">Total Games</p>
          <p className="wantlist-stats-value text-2xl font-bold stat-glow-cyan">{totalGames}</p>
        </Card>
        
        <Card className="wantlist-stats-card p-3 neon-card" style={{
          borderColor: 'var(--neon-pink)',
          boxShadow: '0 0 10px var(--neon-pink)'
        }}>
          <p className="wantlist-stats-label text-xs text-muted-foreground uppercase tracking-wide">Complete</p>
          <p className="wantlist-stats-value text-2xl font-bold stat-glow-pink">{fullyOwned}</p>
        </Card>
        
        <Card className="wantlist-stats-card p-3 neon-card" style={{
          borderColor: 'var(--neon-orange)',
          boxShadow: '0 0 10px var(--neon-orange)'
        }}>
          <p className="wantlist-stats-label text-xs text-muted-foreground uppercase tracking-wide">Partial</p>
          <p className="wantlist-stats-value text-2xl font-bold stat-glow-orange">{partiallyOwned}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-compact card-mb p-4 neon-card">
        <div className="space-y-3 space-y-compact">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search game titles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              style={{
                borderColor: 'var(--neon-cyan)',
                boxShadow: '0 0 8px var(--neon-cyan)'
              }}
            />
          </div>

          {/* Filter buttons */}
          <div className="flex gap-3 flex-wrap">
            <Button
              variant={showOwnedOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOwnedOnly(!showOwnedOnly)}
              className="button-compact"
            >
              <Check className="button-icon size-3 mr-1" />
              <span className="max-[512px]:text-[10px]">Owned Only</span>
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground max-[512px]:text-[10px]">Min Platforms:</span>
              <div className="flex gap-1">
                {[2, 3, 4, 5].map(num => (
                  <Button
                    key={num}
                    variant={minPlatforms === num ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMinPlatforms(num)}
                    className="h-8 w-8 p-0"
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Games List */}
      <div className="space-y-2 wantlist-list-spacing">
        {filteredGames.length === 0 ? (
          <Card className="p-8 text-center neon-card">
            <p className="text-muted-foreground">No games found matching your filters</p>
          </Card>
        ) : (
          filteredGames.map(game => {
            const isExpanded = expandedGames.has(game.baseName);
            const completionPercent = Math.round((game.ownedPlatforms / game.totalPlatforms) * 100);
            
            return (
              <Card 
                key={game.baseName}
                className="neon-card hover:bg-accent/10 transition-all"
                style={{
                  borderColor: game.ownedPlatforms === game.totalPlatforms 
                    ? 'var(--neon-pink)' 
                    : game.ownedPlatforms > 0 
                      ? 'var(--neon-orange)'
                      : 'var(--neon-purple)',
                  boxShadow: `0 0 8px ${
                    game.ownedPlatforms === game.totalPlatforms 
                      ? 'var(--neon-pink)' 
                      : game.ownedPlatforms > 0 
                        ? 'var(--neon-orange)'
                        : 'var(--neon-purple)'
                  }`
                }}
              >
                {/* Header - Always visible */}
                <div 
                  className="p-3 cursor-pointer flex items-center justify-between gap-3"
                  onClick={() => toggleExpanded(game.baseName)}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base mb-1 wantlist-game-title">{game.baseName}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="wantlist-badge neon-badge" style={{
                        backgroundColor: game.ownedPlatforms === game.totalPlatforms 
                          ? 'var(--neon-pink)' 
                          : game.ownedPlatforms > 0 
                            ? 'var(--neon-orange)'
                            : 'var(--neon-purple)',
                      }}>
                        {game.ownedPlatforms}/{game.totalPlatforms} Platforms ({completionPercent}%)
                      </Badge>
                      
                      <span className="text-xs text-muted-foreground">
                        {game.platforms.map(p => getSystemIcon(p.system)).join(' ')}
                      </span>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="shrink-0 h-8 w-8 p-0">
                    {isExpanded ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </Button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-border/50 pt-3">
                    <div className="space-y-2">
                      {game.platforms.map((platform, idx) => (
                        <div 
                          key={`${platform.system}-${idx}`}
                          className="flex items-center gap-3 p-2 rounded"
                          style={{
                            backgroundColor: platform.owned 
                              ? 'rgba(0, 255, 135, 0.1)' 
                              : 'rgba(255, 0, 85, 0.1)'
                          }}
                        >
                          <div className="shrink-0">
                            {platform.owned ? (
                              <Check className="size-5" style={{ color: 'var(--neon-pink)' }} />
                            ) : (
                              <X className="size-5" style={{ color: 'var(--neon-purple)' }} />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{getSystemIcon(platform.system)}</span>
                              <span className="font-medium text-sm">{platform.system}</span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {platform.fullName}
                            </p>
                          </div>

                          {platform.region && (
                            <Badge variant="outline" className="wantlist-game-badge text-xs shrink-0">
                              {platform.region}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      {filteredGames.length > 0 && (
        <p className="text-xs text-center text-muted-foreground help-text">
          💡 Click on a game to see all platforms and versions
        </p>
      )}
    </div>
  );
}

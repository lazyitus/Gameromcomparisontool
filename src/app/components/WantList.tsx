import { useMemo, useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Trash2, Package, ChevronLeft } from 'lucide-react';
import { getSystemIcon } from './SystemIcons';

export interface WantedGame {
  id: string;
  name: string;
  systemName: string;
  region?: string;
  category?: string;
  romName?: string;
}

interface WantListProps {
  wantedGames: WantedGame[];
  onRemoveGame: (id: string) => void;
}

export function WantList({ wantedGames, onRemoveGame }: WantListProps) {
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);

  // Group games by system
  const gamesBySystem = useMemo(() => {
    const grouped: Record<string, WantedGame[]> = {};
    
    wantedGames.forEach(game => {
      if (!grouped[game.systemName]) {
        grouped[game.systemName] = [];
      }
      grouped[game.systemName].push(game);
    });
    
    return grouped;
  }, [wantedGames]);

  const systemNames = Object.keys(gamesBySystem).sort();

  if (wantedGames.length === 0) {
    return (
      <Card className="wantlist-empty p-12 text-center neon-card">
        <Package className="wantlist-empty-icon size-16 mx-auto mb-4 opacity-50" style={{
          filter: 'drop-shadow(0 0 10px var(--neon-purple))',
          color: 'var(--neon-purple)'
        }} />
        <h3 className="wantlist-empty-title text-xl font-bold mb-2 stat-glow-purple">NO GAMES ON WANT LIST</h3>
        <p className="wantlist-empty-text text-muted-foreground">
          Add games from the ROM Collection tab to track what you need!
        </p>
      </Card>
    );
  }

  // If a system is selected, show games for that system
  if (selectedSystem) {
    const games = gamesBySystem[selectedSystem] || [];
    
    return (
      <div className="wantlist-container-spacing space-y-4">
        {/* Back button and header */}
        <div className="wantlist-header flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedSystem(null)}
            className="wantlist-back-button shrink-0"
          >
            <ChevronLeft className="wantlist-back-icon size-4 mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="wantlist-system-icon stat-glow-cyan">
              {getSystemIcon(selectedSystem)}
            </div>
            <h3 className="wantlist-system-title text-xl font-bold stat-glow-cyan uppercase">
              {selectedSystem}
            </h3>
            <Badge className="wantlist-badge neon-badge" style={{
              backgroundColor: 'var(--neon-purple)',
              boxShadow: '0 0 8px var(--neon-purple)'
            }}>
              {games.length}
            </Badge>
          </div>
        </div>

        {/* Compact game list */}
        <div className="wantlist-list-spacing space-y-1.5">
          {games.map(game => (
            <Card key={game.id} className="wantlist-game-card p-2.5 neon-card hover:bg-accent/10 transition-colors" style={{
              borderColor: 'var(--neon-orange)',
              boxShadow: '0 0 6px var(--neon-orange)'
            }}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="wantlist-game-title font-medium text-sm">{game.name}</h4>
                    {game.region && (
                      <Badge variant="outline" className="wantlist-game-badge neon-badge text-xs py-0 h-5">
                        {game.region}
                      </Badge>
                    )}
                    {game.category && (
                      <Badge variant="secondary" className="wantlist-game-badge neon-badge text-xs py-0 h-5">
                        {game.category}
                      </Badge>
                    )}
                  </div>
                  {game.romName && (
                    <p className="wantlist-game-rom text-xs text-muted-foreground mt-1">
                      ROM: {game.romName}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveGame(game.id)}
                  className="wantlist-delete-button shrink-0 h-7 w-7 p-0"
                  style={{
                    color: '#ff0055'
                  }}
                >
                  <Trash2 className="wantlist-delete-icon size-3.5" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Default view: Show systems grid
  return (
    <div className="wantlist-container-spacing space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 grid-gap-compact">
        <Card className="wantlist-stats-card p-3 neon-card" style={{
          borderColor: 'var(--neon-pink)',
          boxShadow: '0 0 10px var(--neon-pink)'
        }}>
          <p className="wantlist-stats-label text-xs text-muted-foreground uppercase tracking-wide">Total</p>
          <p className="wantlist-stats-value text-2xl font-bold stat-glow-pink">{wantedGames.length}</p>
        </Card>
        <Card className="wantlist-stats-card p-3 neon-card" style={{
          borderColor: 'var(--neon-cyan)',
          boxShadow: '0 0 10px var(--neon-cyan)'
        }}>
          <p className="wantlist-stats-label text-xs text-muted-foreground uppercase tracking-wide">Systems</p>
          <p className="wantlist-stats-value text-2xl font-bold stat-glow-cyan">{systemNames.length}</p>
        </Card>
      </div>

      {/* Compact systems grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 grid-gap-compact">
        {systemNames.map(systemName => (
          <Card 
            key={systemName}
            className="wantlist-system-card p-3 neon-card cursor-pointer hover:bg-accent/20 transition-all hover:scale-[1.02]"
            style={{
              borderColor: 'var(--neon-cyan)',
              boxShadow: '0 0 8px var(--neon-cyan)'
            }}
            onClick={() => setSelectedSystem(systemName)}
          >
            <div className="flex items-center gap-3">
              <div className="wantlist-system-icon stat-glow-cyan shrink-0">
                {getSystemIcon(systemName)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="wantlist-system-name text-sm font-bold stat-glow-cyan uppercase truncate">
                  {systemName}
                </h3>
                <p className="wantlist-system-count text-xs text-muted-foreground">
                  {gamesBySystem[systemName].length} game{gamesBySystem[systemName].length !== 1 ? 's' : ''}
                </p>
              </div>
              <Badge className="wantlist-badge neon-badge shrink-0" style={{
                backgroundColor: 'var(--neon-purple)',
                boxShadow: '0 0 6px var(--neon-purple)'
              }}>
                {gamesBySystem[systemName].length}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
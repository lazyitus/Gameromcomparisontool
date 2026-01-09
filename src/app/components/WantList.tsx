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
      <Card className="p-12 text-center neon-card max-[512px]:p-6">
        <Package className="size-16 mx-auto mb-4 opacity-50 max-[512px]:size-10 max-[512px]:mb-2" style={{
          filter: 'drop-shadow(0 0 10px var(--neon-purple))',
          color: 'var(--neon-purple)'
        }} />
        <h3 className="text-xl font-bold mb-2 stat-glow-purple max-[512px]:text-sm max-[512px]:mb-1">NO GAMES ON WANT LIST</h3>
        <p className="text-muted-foreground max-[512px]:text-xs">
          Add games from the ROM Collection tab to track what you need!
        </p>
      </Card>
    );
  }

  // If a system is selected, show games for that system
  if (selectedSystem) {
    const games = gamesBySystem[selectedSystem] || [];
    
    return (
      <div className="space-y-4 max-[512px]:space-y-2">
        {/* Back button and header */}
        <div className="flex items-center gap-3 max-[512px]:gap-2 max-[512px]:flex-col max-[512px]:items-start">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedSystem(null)}
            className="shrink-0 max-[512px]:text-xs max-[512px]:h-7"
          >
            <ChevronLeft className="size-4 mr-1 max-[512px]:size-3" />
            <span className="max-[512px]:text-[10px]">Back</span>
          </Button>
          <div className="flex items-center gap-3 max-[512px]:gap-2">
            <div className="stat-glow-cyan max-[512px]:text-xs">
              {getSystemIcon(selectedSystem)}
            </div>
            <h3 className="text-xl font-bold stat-glow-cyan uppercase max-[512px]:text-sm">
              {selectedSystem}
            </h3>
            <Badge className="neon-badge max-[512px]:text-[9px] max-[512px]:h-4 max-[512px]:px-1" style={{
              backgroundColor: 'var(--neon-purple)',
              boxShadow: '0 0 8px var(--neon-purple)'
            }}>
              {games.length}
            </Badge>
          </div>
        </div>

        {/* Compact game list */}
        <div className="space-y-1.5 max-[512px]:space-y-1">
          {games.map(game => (
            <Card key={game.id} className="p-2.5 neon-card hover:bg-accent/10 transition-colors max-[512px]:p-1.5" style={{
              borderColor: 'var(--neon-orange)',
              boxShadow: '0 0 6px var(--neon-orange)'
            }}>
              <div className="flex items-center justify-between gap-3 max-[512px]:gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap max-[512px]:gap-1">
                    <h4 className="font-medium text-sm max-[512px]:text-[10px]">{game.name}</h4>
                    {game.region && (
                      <Badge variant="outline" className="neon-badge text-xs py-0 h-5 max-[512px]:text-[8px] max-[512px]:h-3 max-[512px]:px-1">
                        {game.region}
                      </Badge>
                    )}
                    {game.category && (
                      <Badge variant="secondary" className="neon-badge text-xs py-0 h-5 max-[512px]:text-[8px] max-[512px]:h-3 max-[512px]:px-1">
                        {game.category}
                      </Badge>
                    )}
                  </div>
                  {game.romName && (
                    <p className="text-xs text-muted-foreground mt-1 max-[512px]:text-[9px] max-[512px]:mt-0.5 max-[512px]:hidden">
                      ROM: {game.romName}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveGame(game.id)}
                  className="shrink-0 h-7 w-7 p-0 max-[512px]:h-5 max-[512px]:w-5"
                  style={{
                    color: '#ff0055'
                  }}
                >
                  <Trash2 className="size-3.5 max-[512px]:size-2.5" />
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
    <div className="space-y-4 max-[512px]:space-y-2">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 max-[512px]:gap-1.5">
        <Card className="p-3 neon-card max-[512px]:p-2" style={{
          borderColor: 'var(--neon-pink)',
          boxShadow: '0 0 10px var(--neon-pink)'
        }}>
          <p className="text-xs text-muted-foreground uppercase tracking-wide max-[512px]:text-[9px]">Total</p>
          <p className="text-2xl font-bold stat-glow-pink max-[512px]:text-lg">{wantedGames.length}</p>
        </Card>
        <Card className="p-3 neon-card max-[512px]:p-2" style={{
          borderColor: 'var(--neon-cyan)',
          boxShadow: '0 0 10px var(--neon-cyan)'
        }}>
          <p className="text-xs text-muted-foreground uppercase tracking-wide max-[512px]:text-[9px]">Systems</p>
          <p className="text-2xl font-bold stat-glow-cyan max-[512px]:text-lg">{systemNames.length}</p>
        </Card>
      </div>

      {/* Compact systems grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-[512px]:gap-1.5">
        {systemNames.map(systemName => (
          <Card 
            key={systemName}
            className="p-3 neon-card cursor-pointer hover:bg-accent/20 transition-all hover:scale-[1.02] max-[512px]:p-2"
            style={{
              borderColor: 'var(--neon-cyan)',
              boxShadow: '0 0 8px var(--neon-cyan)'
            }}
            onClick={() => setSelectedSystem(systemName)}
          >
            <div className="flex items-center gap-3 max-[512px]:gap-2">
              <div className="stat-glow-cyan shrink-0 max-[512px]:text-xs">
                {getSystemIcon(systemName)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold stat-glow-cyan uppercase truncate max-[512px]:text-[10px]">
                  {systemName}
                </h3>
                <p className="text-xs text-muted-foreground max-[512px]:text-[9px] max-[512px]:hidden">
                  {gamesBySystem[systemName].length} game{gamesBySystem[systemName].length !== 1 ? 's' : ''}
                </p>
              </div>
              <Badge className="neon-badge shrink-0 max-[512px]:text-[9px] max-[512px]:h-4 max-[512px]:px-1" style={{
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
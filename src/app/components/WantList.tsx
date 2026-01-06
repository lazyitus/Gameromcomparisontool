import { useMemo } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Trash2, Package } from 'lucide-react';
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
      <Card className="p-12 text-center neon-card">
        <Package className="size-16 mx-auto mb-4 opacity-50" style={{
          filter: 'drop-shadow(0 0 10px var(--neon-purple))',
          color: 'var(--neon-purple)'
        }} />
        <h3 className="text-xl font-bold mb-2 stat-glow-purple">NO GAMES ON WANT LIST</h3>
        <p className="text-muted-foreground">
          Add games from the ROM Collection tab to track what you need!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-4 neon-card" style={{
          borderColor: 'var(--neon-pink)',
          boxShadow: '0 0 10px var(--neon-pink)'
        }}>
          <p className="text-sm text-muted-foreground uppercase tracking-wide">Total Wanted</p>
          <p className="text-3xl font-bold stat-glow-pink">{wantedGames.length}</p>
        </Card>
        <Card className="p-4 neon-card" style={{
          borderColor: 'var(--neon-cyan)',
          boxShadow: '0 0 10px var(--neon-cyan)'
        }}>
          <p className="text-sm text-muted-foreground uppercase tracking-wide">Systems</p>
          <p className="text-3xl font-bold stat-glow-cyan">{systemNames.length}</p>
        </Card>
      </div>

      {/* Games grouped by system */}
      <div className="space-y-6">
        {systemNames.map(systemName => (
          <div key={systemName}>
            <div className="flex items-center gap-3 mb-4">
              <div className="stat-glow-cyan">
                {getSystemIcon(systemName)}
              </div>
              <h3 className="text-xl font-bold stat-glow-cyan uppercase">
                {systemName}
              </h3>
              <Badge className="neon-badge" style={{
                backgroundColor: 'var(--neon-purple)',
                boxShadow: '0 0 8px var(--neon-purple)'
              }}>
                {gamesBySystem[systemName].length} games
              </Badge>
            </div>

            <div className="space-y-2">
              {gamesBySystem[systemName].map(game => (
                <Card key={game.id} className="p-4 neon-card" style={{
                  borderColor: 'var(--neon-orange)',
                  boxShadow: '0 0 8px var(--neon-orange)'
                }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium mb-2">{game.name}</h4>
                      
                      <div className="flex items-center gap-2 flex-wrap text-sm">
                        {game.region && (
                          <Badge variant="outline" className="neon-badge">
                            {game.region}
                          </Badge>
                        )}
                        {game.category && (
                          <Badge variant="secondary" className="neon-badge">
                            {game.category}
                          </Badge>
                        )}
                        {game.romName && (
                          <span className="text-xs text-muted-foreground">
                            Looking for: {game.romName}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveGame(game.id)}
                      className="shrink-0"
                      style={{
                        color: '#ff0055'
                      }}
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

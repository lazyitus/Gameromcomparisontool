import { useMemo } from 'react';
import { DollarSign, TrendingUp, Trophy, Coins } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { formatPrice } from '../utils/priceCharting';
import type { Game } from './DatFileUploader';

interface CollectionValueStatsProps {
  games: Array<{ game: Game; hasRom: boolean; systemName: string }>;
}

interface SystemValue {
  systemName: string;
  gameCount: number;
  looseTotal: number;
  cibTotal: number;
  newTotal: number;
}

export function CollectionValueStats({ games }: CollectionValueStatsProps) {
  const stats = useMemo(() => {
    // Only count games we actually own
    const ownedGames = games.filter(g => g.hasRom);
    
    let totalLoose = 0;
    let totalCib = 0;
    let totalNew = 0;
    let gamesWithPrices = 0;
    
    const topValuedGames: Array<{ name: string; system: string; price: number }> = [];
    const systemValues = new Map<string, SystemValue>();
    
    ownedGames.forEach(({ game, systemName }) => {
      const hasAnyPrice = game.priceLoose || game.priceCib || game.priceNew;
      
      if (hasAnyPrice) {
        gamesWithPrices++;
        
        const loose = game.priceLoose || 0;
        const cib = game.priceCib || 0;
        const newPrice = game.priceNew || 0;
        
        totalLoose += loose;
        totalCib += cib;
        totalNew += newPrice;
        
        // Track most valuable (use highest price available)
        const maxPrice = Math.max(loose, cib, newPrice);
        if (maxPrice > 0) {
          topValuedGames.push({
            name: game.description || game.name,
            system: systemName,
            price: maxPrice,
          });
        }
        
        // Track by system
        if (!systemValues.has(systemName)) {
          systemValues.set(systemName, {
            systemName,
            gameCount: 0,
            looseTotal: 0,
            cibTotal: 0,
            newTotal: 0,
          });
        }
        const sysVal = systemValues.get(systemName)!;
        sysVal.gameCount++;
        sysVal.looseTotal += loose;
        sysVal.cibTotal += cib;
        sysVal.newTotal += newPrice;
      }
    });
    
    // Sort and get top 10 most valuable
    topValuedGames.sort((a, b) => b.price - a.price);
    const top10 = topValuedGames.slice(0, 10);
    
    // Sort systems by total value (CIB)
    const systemsByValue = Array.from(systemValues.values())
      .sort((a, b) => b.cibTotal - a.cibTotal)
      .slice(0, 10);
    
    // Calculate average value
    const avgLoose = gamesWithPrices > 0 ? totalLoose / gamesWithPrices : 0;
    const avgCib = gamesWithPrices > 0 ? totalCib / gamesWithPrices : 0;
    const avgNew = gamesWithPrices > 0 ? totalNew / gamesWithPrices : 0;
    
    return {
      totalLoose,
      totalCib,
      totalNew,
      gamesWithPrices,
      totalGames: ownedGames.length,
      avgLoose,
      avgCib,
      avgNew,
      top10,
      systemsByValue,
    };
  }, [games]);
  
  if (stats.gamesWithPrices === 0) {
    return (
      <Card className="p-6 neon-card max-[512px]:p-3">
        <div className="text-center py-8">
          <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">
            No price data available. Fetch prices using the button below.
          </p>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4 max-[512px]:space-y-2">
      {/* Total Value Cards */}
      <div className="grid grid-cols-3 gap-3 max-[512px]:gap-2">
        <Card className="p-4 neon-card max-[512px]:p-2" style={{
          borderColor: 'var(--neon-green)',
          boxShadow: '0 0 10px var(--neon-green)'
        }}>
          <p className="text-xs text-muted-foreground uppercase mb-1 max-[512px]:text-[9px]">Loose Value</p>
          <p className="text-xl font-bold stat-glow-green max-[512px]:text-sm">{formatPrice(stats.totalLoose)}</p>
          <p className="text-xs opacity-70 mt-1 max-[512px]:text-[8px]">Avg: {formatPrice(stats.avgLoose)}</p>
        </Card>
        
        <Card className="p-4 neon-card max-[512px]:p-2" style={{
          borderColor: 'var(--neon-cyan)',
          boxShadow: '0 0 10px var(--neon-cyan)'
        }}>
          <p className="text-xs text-muted-foreground uppercase mb-1 max-[512px]:text-[9px]">CIB Value</p>
          <p className="text-xl font-bold stat-glow-cyan max-[512px]:text-sm">{formatPrice(stats.totalCib)}</p>
          <p className="text-xs opacity-70 mt-1 max-[512px]:text-[8px]">Avg: {formatPrice(stats.avgCib)}</p>
        </Card>
        
        <Card className="p-4 neon-card max-[512px]:p-2" style={{
          borderColor: 'var(--neon-pink)',
          boxShadow: '0 0 10px var(--neon-pink)'
        }}>
          <p className="text-xs text-muted-foreground uppercase mb-1 max-[512px]:text-[9px]">New Value</p>
          <p className="text-xl font-bold stat-glow-pink max-[512px]:text-sm">{formatPrice(stats.totalNew)}</p>
          <p className="text-xs opacity-70 mt-1 max-[512px]:text-[8px]">Avg: {formatPrice(stats.avgNew)}</p>
        </Card>
      </div>
      
      {/* Info Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground max-[512px]:text-[10px]">
        <Coins className="h-4 w-4" />
        <span>{stats.gamesWithPrices} of {stats.totalGames} owned games have price data</span>
      </div>
      
      {/* Top 10 Most Valuable Games */}
      {stats.top10.length > 0 && (
        <Card className="p-4 neon-card max-[512px]:p-3">
          <div className="flex items-center gap-2 mb-3 max-[512px]:mb-2">
            <Trophy className="h-5 w-5 stat-glow-pink max-[512px]:h-4 max-[512px]:w-4" />
            <h3 className="font-semibold uppercase max-[512px]:text-sm">Top 10 Most Valuable</h3>
          </div>
          
          <div className="space-y-2 max-[512px]:space-y-1">
            {stats.top10.map((game, index) => (
              <div 
                key={`${game.name}-${index}`}
                className="flex items-center justify-between gap-2 p-2 rounded max-[512px]:p-1"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderLeft: `3px solid ${index === 0 ? 'var(--neon-pink)' : index === 1 ? 'var(--neon-cyan)' : index === 2 ? 'var(--neon-purple)' : 'var(--neon-green)'}`,
                }}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Badge variant="outline" className="shrink-0 text-xs max-[512px]:text-[9px]">
                    #{index + 1}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate max-[512px]:text-xs">{game.name}</p>
                    <p className="text-xs text-muted-foreground max-[512px]:text-[9px]">{game.system}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold stat-glow-green max-[512px]:text-xs">{formatPrice(game.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* Value by System - Horizontal Bar Chart */}
      {stats.systemsByValue.length > 0 && (
        <Card className="p-4 neon-card max-[512px]:p-3">
          <div className="flex items-center gap-2 mb-3 max-[512px]:mb-2">
            <TrendingUp className="h-5 w-5 stat-glow-cyan max-[512px]:h-4 max-[512px]:w-4" />
            <h3 className="font-semibold uppercase max-[512px]:text-sm">Value by System (CIB)</h3>
          </div>
          
          <div className="space-y-3 max-[512px]:space-y-2">
            {stats.systemsByValue.map((sys, index) => {
              const maxValue = stats.systemsByValue[0].cibTotal;
              const percentage = (sys.cibTotal / maxValue) * 100;
              
              return (
                <div key={sys.systemName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs max-[512px]:text-[10px]">
                    <span className="font-medium">{sys.systemName}</span>
                    <span className="stat-glow-cyan">{formatPrice(sys.cibTotal)}</span>
                  </div>
                  <div className="relative h-6 rounded overflow-hidden max-[512px]:h-4" style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                  }}>
                    <div 
                      className="h-full transition-all duration-500 flex items-center justify-end px-2"
                      style={{
                        width: `${percentage}%`,
                        background: `linear-gradient(90deg, 
                          ${index === 0 ? 'var(--neon-pink)' : 
                            index === 1 ? 'var(--neon-cyan)' : 
                            index === 2 ? 'var(--neon-purple)' : 
                            'var(--neon-green)'} 0%, 
                          rgba(255, 255, 255, 0.2) 100%)`,
                        boxShadow: `0 0 10px ${index === 0 ? 'var(--neon-pink)' : 
                          index === 1 ? 'var(--neon-cyan)' : 
                          index === 2 ? 'var(--neon-purple)' : 
                          'var(--neon-green)'}`,
                      }}
                    >
                      <span className="text-xs font-semibold text-white max-[512px]:text-[9px]">
                        {sys.gameCount} {sys.gameCount === 1 ? 'game' : 'games'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

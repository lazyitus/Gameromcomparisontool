import { useState } from 'react';
import { DollarSign, Download, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { fetchPriceData, mapSystemToPriceChartingConsole } from '../utils/priceCharting';
import type { Game } from './DatFileUploader';

interface PriceFetcherProps {
  games: Array<{ game: Game; hasRom: boolean; systemName: string }>;
  onPricesUpdated: (updates: Map<string, { loose?: number; cib?: number; new?: number }>) => void;
}

export function PriceFetcher({ games, onPricesUpdated }: PriceFetcherProps) {
  const [isFetching, setIsFetching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchPrices = async () => {
    const apiKey = localStorage.getItem('priceChartingApiKey');
    
    if (!apiKey) {
      setErrorMessage('Please add your PriceCharting API key in the Setup tab first.');
      return;
    }

    setIsFetching(true);
    setErrorMessage('');
    setSuccessCount(0);
    
    // Only fetch for owned games that don't have prices or have old prices
    const gamesToFetch = games.filter(({ game, hasRom }) => {
      if (!hasRom) return false;
      
      // Check if price is older than 30 days
      if (game.priceLastUpdated) {
        const lastUpdate = new Date(game.priceLastUpdated);
        const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceUpdate < 30) return false; // Skip if updated recently
      }
      
      return true;
    });

    if (gamesToFetch.length === 0) {
      setErrorMessage('All owned games already have recent price data!');
      setIsFetching(false);
      return;
    }

    setTotal(gamesToFetch.length);
    const updates = new Map<string, { loose?: number; cib?: number; new?: number }>();
    let fetched = 0;
    let succeeded = 0;

    // Fetch prices with rate limiting (delay between requests)
    for (const { game, systemName } of gamesToFetch) {
      try {
        // Map system name to PriceCharting console name
        const consoleName = mapSystemToPriceChartingConsole(systemName);
        const gameName = game.description || game.name;
        
        // Fetch price data
        const priceData = await fetchPriceData(gameName, consoleName, apiKey);
        
        if (priceData) {
          const gameKey = `${systemName}|${game.name}`;
          updates.set(gameKey, {
            loose: priceData.loosePrice,
            cib: priceData.cibPrice,
            new: priceData.newPrice,
          });
          succeeded++;
        }
        
        // Add delay to respect API rate limits (avoid 429 errors)
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms between requests
        
      } catch (error) {
        console.error(`Error fetching price for ${game.name}:`, error);
      }
      
      fetched++;
      setProgress(fetched);
      setSuccessCount(succeeded);
    }

    // Update games with fetched prices
    onPricesUpdated(updates);
    
    setIsFetching(false);
  };

  const apiKey = localStorage.getItem('priceChartingApiKey');
  const hasApiKey = apiKey && apiKey.length === 40;

  // Count games that need price updates
  const ownedGames = games.filter(g => g.hasRom);
  const gamesWithPrices = ownedGames.filter(g => g.game.priceLoose || g.game.priceCib || g.game.priceNew);
  const gamesNeedingUpdate = ownedGames.filter(({ game }) => {
    if (!game.priceLastUpdated) return true;
    const lastUpdate = new Date(game.priceLastUpdated);
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate >= 30;
  });

  return (
    <Card className="p-4 neon-card max-[512px]:p-3">
      <div className="space-y-3 max-[512px]:space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 stat-glow-green max-[512px]:h-4 max-[512px]:w-4" />
            <h3 className="font-semibold uppercase max-[512px]:text-sm">Bulk Fetch Prices</h3>
          </div>
          {!hasApiKey && (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
        </div>

        {!hasApiKey ? (
          <p className="text-sm text-yellow-500 max-[512px]:text-xs">
            ⚠️ Add your PriceCharting API key in Setup tab to fetch prices.
          </p>
        ) : (
          <>
            <div className="text-sm space-y-1 max-[512px]:text-xs">
              <p className="text-muted-foreground">
                {gamesWithPrices.length} of {ownedGames.length} owned games have prices.
                {gamesNeedingUpdate.length > 0 && (
                  <span className="text-yellow-500">
                    {' '}({gamesNeedingUpdate.length} need update)
                  </span>
                )}
              </p>
            </div>

            {isFetching && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm max-[512px]:text-xs">
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin stat-glow-cyan" />
                    Fetching prices...
                  </span>
                  <span className="stat-glow-cyan">
                    {progress} / {total}
                  </span>
                </div>
                <Progress value={(progress / total) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  ✓ {successCount} successful
                </p>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-start gap-2 p-3 rounded bg-yellow-500/10 border border-yellow-500/20">
                <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-500 max-[512px]:text-xs">{errorMessage}</p>
              </div>
            )}

            {!isFetching && progress > 0 && (
              <div className="flex items-start gap-2 p-3 rounded bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-4 w-4 stat-glow-green shrink-0 mt-0.5" />
                <p className="text-sm stat-glow-green max-[512px]:text-xs">
                  Fetched {successCount} prices successfully!
                </p>
              </div>
            )}

            <Button
              onClick={fetchPrices}
              disabled={isFetching || gamesNeedingUpdate.length === 0}
              className="w-full neon-button max-[512px]:text-xs"
              size="sm"
            >
              {isFetching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Fetch Prices for {gamesNeedingUpdate.length} Games
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground opacity-70 max-[512px]:text-[10px]">
              💡 Prices are cached for 30 days. This fetches only games that need updates.
            </p>
          </>
        )}
      </div>
    </Card>
  );
}

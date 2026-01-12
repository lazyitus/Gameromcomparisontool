import { DollarSign } from 'lucide-react';
import { formatPrice } from '../utils/priceCharting';
import type { Game } from './DatFileUploader';

interface GamePriceDisplayProps {
  game: Game;
  compact?: boolean; // Ultra-compact mode for small screens
}

/**
 * Display price information for a game
 * Shows in a very compact format suitable for CRT displays
 */
export function GamePriceDisplay({ game, compact = false }: GamePriceDisplayProps) {
  const hasAnyPrice = game.priceLoose || game.priceCib || game.priceNew;
  
  if (!hasAnyPrice) {
    return null;
  }

  if (compact) {
    // Ultra-compact: Show only the highest available price with icon
    const maxPrice = Math.max(
      game.priceLoose || 0,
      game.priceCib || 0,
      game.priceNew || 0
    );
    
    return (
      <div className="flex items-center gap-1 text-xs stat-glow-green">
        <DollarSign className="size-3" />
        <span>{formatPrice(maxPrice)}</span>
      </div>
    );
  }

  // Standard: Show all available prices
  return (
    <div className="flex items-center gap-2 text-xs mt-1">
      <DollarSign className="size-3 stat-glow-green" />
      <div className="flex gap-1.5 flex-wrap">
        {game.priceLoose && game.priceLoose > 0 && (
          <span className="stat-glow-green">
            L: {formatPrice(game.priceLoose)}
          </span>
        )}
        {game.priceCib && game.priceCib > 0 && (
          <span className="stat-glow-cyan">
            CIB: {formatPrice(game.priceCib)}
          </span>
        )}
        {game.priceNew && game.priceNew > 0 && (
          <span className="stat-glow-pink">
            New: {formatPrice(game.priceNew)}
          </span>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { DollarSign, Save, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import type { Game } from './DatFileUploader';

interface ManualPriceEditorProps {
  game: Game;
  systemName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (prices: { loose?: number; cib?: number; new?: number }) => void;
}

export function ManualPriceEditor({ game, systemName, isOpen, onClose, onSave }: ManualPriceEditorProps) {
  const [loosePrice, setLoosePrice] = useState(
    game.priceLoose ? (game.priceLoose / 100).toFixed(2) : ''
  );
  const [cibPrice, setCibPrice] = useState(
    game.priceCib ? (game.priceCib / 100).toFixed(2) : ''
  );
  const [newPrice, setNewPrice] = useState(
    game.priceNew ? (game.priceNew / 100).toFixed(2) : ''
  );

  const handleSave = () => {
    const prices: { loose?: number; cib?: number; new?: number } = {};
    
    if (loosePrice && parseFloat(loosePrice) > 0) {
      prices.loose = Math.round(parseFloat(loosePrice) * 100);
    }
    if (cibPrice && parseFloat(cibPrice) > 0) {
      prices.cib = Math.round(parseFloat(cibPrice) * 100);
    }
    if (newPrice && parseFloat(newPrice) > 0) {
      prices.new = Math.round(parseFloat(newPrice) * 100);
    }
    
    onSave(prices);
    onClose();
  };

  const handleClear = () => {
    setLoosePrice('');
    setCibPrice('');
    setNewPrice('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="neon-card max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 uppercase">
            <DollarSign className="h-5 w-5 stat-glow-green" />
            Edit Price
          </DialogTitle>
          <DialogDescription>
            <div className="mt-2 space-y-1">
              <p className="font-semibold text-foreground">{game.description || game.name}</p>
              <p className="text-xs">{systemName}</p>
              <p className="text-xs opacity-70 italic mt-2">
                Enter prices in USD. Leave blank to remove a price.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="loose-price" className="text-sm">
              Loose Price (Game Only)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="loose-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={loosePrice}
                onChange={(e) => setLoosePrice(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cib-price" className="text-sm">
              CIB Price (Complete in Box)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="cib-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={cibPrice}
                onChange={(e) => setCibPrice(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-price" className="text-sm">
              New Price (Sealed)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="new-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClear}
            size="sm"
          >
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            size="sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="neon-button"
            size="sm"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Prices
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

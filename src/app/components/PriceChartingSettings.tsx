import { useState, useEffect } from 'react';
import { DollarSign, Eye, EyeOff, ExternalLink, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { isValidApiKey } from '../utils/priceCharting';

export function PriceChartingSettings() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('priceChartingApiKey');
    if (savedKey) {
      setApiKey(savedKey);
      setIsSaved(true);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('priceChartingApiKey', apiKey.trim());
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleClear = () => {
    setApiKey('');
    localStorage.removeItem('priceChartingApiKey');
    setIsSaved(false);
  };

  const isValid = apiKey.length === 0 || isValidApiKey(apiKey);
  const hasKey = apiKey.length > 0;

  return (
    <Card className="p-6 neon-card max-[512px]:p-3">
      <div className="space-y-4 max-[512px]:space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 stat-glow-green max-[512px]:h-4 max-[512px]:w-4" />
          <h3 className="font-medium text-lg max-[512px]:text-sm">💰 PriceCharting Integration (Optional)</h3>
        </div>

        <p className="text-sm text-muted-foreground max-[512px]:text-xs">
          Add your PriceCharting API key to automatically fetch market values for your collection.
          <br />
          <span className="opacity-70 italic">Note: Prices reflect physical game values, not digital ROM values.</span>
        </p>

        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showKey ? 'text' : 'password'}
                placeholder="Enter 40-character API key..."
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setIsSaved(false);
                }}
                className={`pr-10 font-mono text-sm ${!isValid ? 'border-red-500' : ''} max-[512px]:text-xs`}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {!isValid && (
            <div className="flex items-center gap-2 text-sm text-red-400">
              <X className="h-4 w-4" />
              <span>API key should be 40 hexadecimal characters</span>
            </div>
          )}

          {isSaved && (
            <div className="flex items-center gap-2 text-sm stat-glow-green">
              <Check className="h-4 w-4" />
              <span>API key saved successfully!</span>
            </div>
          )}

          <div className="flex gap-2 max-[512px]:flex-col">
            <Button
              onClick={handleSave}
              disabled={!isValid || apiKey.length === 0}
              className="neon-button flex-1 max-[512px]:text-xs"
              size="sm"
            >
              <DollarSign className="mr-2 h-4 w-4 max-[512px]:mr-1 max-[512px]:h-3 max-[512px]:w-3" />
              Save API Key
            </Button>

            {hasKey && (
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
                className="max-[512px]:text-xs"
              >
                Clear
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://www.pricecharting.com/api-documentation', '_blank')}
              className="max-[512px]:text-xs"
            >
              <ExternalLink className="mr-2 h-4 w-4 max-[512px]:mr-1 max-[512px]:h-3 max-[512px]:w-3" />
              <span className="max-[512px]:text-[10px]">Get API Key</span>
            </Button>
          </div>

          <div className="text-xs opacity-70 space-y-1 max-[512px]:text-[10px]">
            <p>📖 <strong>How to get your API key:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Visit <a href="https://www.pricecharting.com" target="_blank" rel="noopener noreferrer" className="underline">PriceCharting.com</a></li>
              <li>Subscribe to a paid plan ($7-15/month)</li>
              <li>Go to Account → Subscription → "API/Download" button</li>
              <li>Copy your 40-character token and paste it above</li>
            </ol>
          </div>
        </div>
      </div>
    </Card>
  );
}

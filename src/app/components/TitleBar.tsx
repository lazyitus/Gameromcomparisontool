import { Minus, Square, X, Gamepad2, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';

interface TitleBarProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export function TitleBar({ theme, onThemeToggle }: TitleBarProps) {
  const handleMinimize = () => {
    if (window.electronAPI?.minimizeWindow) {
      window.electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI?.maximizeWindow) {
      window.electronAPI.maximizeWindow();
    }
  };

  const handleClose = () => {
    if (window.electronAPI?.closeWindow) {
      window.electronAPI.closeWindow();
    }
  };

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-8 flex items-center justify-between px-3 z-50 select-none border-b"
      style={{
        backgroundColor: theme === 'dark' ? 'var(--arcade-dark)' : 'var(--arcade-light-purple)',
        borderColor: 'var(--neon-purple)',
        WebkitAppRegion: 'drag',
        boxShadow: '0 0 15px rgba(157, 0, 255, 0.3)',
      }}
    >
      {/* App Title */}
      <div className="flex items-center gap-2">
        <Gamepad2 className="size-3.5" style={{
          color: 'var(--neon-pink)',
          filter: 'drop-shadow(0 0 5px var(--neon-pink))'
        }} />
        <span className="text-xs font-medium uppercase tracking-wide" style={{
          color: 'var(--neon-cyan)',
          textShadow: '0 0 5px var(--neon-cyan)'
        }}>
          ROM ARCADE
        </span>
      </div>

      {/* Theme Toggle & Window Controls */}
      <div 
        className="flex items-center gap-1" 
        style={{ WebkitAppRegion: 'no-drag' }}
      >
        {/* Theme Toggle Button */}
        <button
          onClick={onThemeToggle}
          className="h-6 w-8 flex items-center justify-center hover:bg-white/10 transition-colors rounded-sm group"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? (
            <Sun className="size-3.5 group-hover:text-neon-yellow" style={{
              color: 'var(--neon-cyan)',
              filter: 'drop-shadow(0 0 3px var(--neon-cyan))'
            }} />
          ) : (
            <Moon className="size-3.5 group-hover:text-neon-purple" style={{
              color: 'var(--neon-purple)',
              filter: 'drop-shadow(0 0 3px var(--neon-purple))'
            }} />
          )}
        </button>

        {/* Separator */}
        <div className="h-4 w-px mx-0.5" style={{
          backgroundColor: 'var(--neon-purple)',
          opacity: 0.3
        }} />

        {/* Window Controls */}
        <button
          onClick={handleMinimize}
          className="h-6 w-8 flex items-center justify-center hover:bg-white/10 transition-colors rounded-sm group"
          aria-label="Minimize"
        >
          <Minus className="size-3 group-hover:text-neon-cyan" style={{
            color: 'var(--neon-purple)'
          }} />
        </button>
        
        <button
          onClick={handleMaximize}
          className="h-6 w-8 flex items-center justify-center hover:bg-white/10 transition-colors rounded-sm group"
          aria-label="Maximize"
        >
          <Square className="size-3 group-hover:text-neon-cyan" style={{
            color: 'var(--neon-purple)'
          }} />
        </button>
        
        <button
          onClick={handleClose}
          className="h-6 w-8 flex items-center justify-center hover:bg-red-500/80 transition-colors rounded-sm group"
          aria-label="Close"
        >
          <X className="size-3.5 group-hover:text-white" style={{
            color: 'var(--neon-purple)'
          }} />
        </button>
      </div>
    </div>
  );
}
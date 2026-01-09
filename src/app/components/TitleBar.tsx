import { Minus, Square, X, Gamepad2 } from 'lucide-react';
import { Button } from './ui/button';

export function TitleBar() {
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
      className="fixed top-0 left-0 right-0 h-8 flex items-center justify-between px-3 z-50 select-none border-b max-[512px]:h-6 max-[512px]:px-2"
      style={{
        backgroundColor: 'var(--arcade-dark)',
        borderColor: 'var(--neon-purple)',
        WebkitAppRegion: 'drag',
        boxShadow: '0 0 15px rgba(157, 0, 255, 0.3)',
      }}
    >
      {/* App Title */}
      <div className="flex items-center gap-2 max-[512px]:gap-1">
        <Gamepad2 className="size-3.5 max-[512px]:size-2.5" style={{
          color: 'var(--neon-pink)',
          filter: 'drop-shadow(0 0 5px var(--neon-pink))'
        }} />
        <span className="text-xs font-medium uppercase tracking-wide max-[512px]:text-[9px]" style={{
          color: 'var(--neon-cyan)',
          textShadow: '0 0 5px var(--neon-cyan)'
        }}>
          ROM ARCADE
        </span>
      </div>

      {/* Window Controls */}
      <div 
        className="flex items-center gap-0.5" 
        style={{ WebkitAppRegion: 'no-drag' }}
      >
        <button
          onClick={handleMinimize}
          className="h-6 w-8 flex items-center justify-center hover:bg-white/10 transition-colors rounded-sm group max-[512px]:h-5 max-[512px]:w-6"
          aria-label="Minimize"
        >
          <Minus className="size-3 group-hover:text-neon-cyan max-[512px]:size-2" style={{
            color: 'var(--neon-purple)'
          }} />
        </button>
        
        <button
          onClick={handleMaximize}
          className="h-6 w-8 flex items-center justify-center hover:bg-white/10 transition-colors rounded-sm group max-[512px]:h-5 max-[512px]:w-6"
          aria-label="Maximize"
        >
          <Square className="size-3 group-hover:text-neon-cyan max-[512px]:size-2" style={{
            color: 'var(--neon-purple)'
          }} />
        </button>
        
        <button
          onClick={handleClose}
          className="h-6 w-8 flex items-center justify-center hover:bg-red-500/80 transition-colors rounded-sm group max-[512px]:h-5 max-[512px]:w-6"
          aria-label="Close"
        >
          <X className="size-3.5 group-hover:text-white max-[512px]:size-2.5" style={{
            color: 'var(--neon-purple)'
          }} />
        </button>
      </div>
    </div>
  );
}
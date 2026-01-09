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
      className="title-bar fixed top-0 left-0 right-0 h-8 flex items-center justify-between px-3 z-50 select-none border-b"
      style={{
        backgroundColor: 'var(--arcade-dark)',
        borderColor: 'var(--neon-purple)',
        WebkitAppRegion: 'drag',
        boxShadow: '0 0 15px rgba(157, 0, 255, 0.3)',
      }}
    >
      {/* App Title */}
      <div className="flex items-center gap-2">
        <Gamepad2 className="title-bar-icon size-3.5" style={{
          color: 'var(--neon-pink)',
          filter: 'drop-shadow(0 0 5px var(--neon-pink))'
        }} />
        <span className="title-bar-text text-xs font-medium uppercase tracking-wide" style={{
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
          className="title-bar-button h-6 w-8 flex items-center justify-center hover:bg-white/10 transition-colors rounded-sm group"
          aria-label="Minimize"
        >
          <Minus className="title-bar-button-icon size-3 group-hover:text-neon-cyan" style={{
            color: 'var(--neon-purple)'
          }} />
        </button>
        
        <button
          onClick={handleMaximize}
          className="title-bar-button h-6 w-8 flex items-center justify-center hover:bg-white/10 transition-colors rounded-sm group"
          aria-label="Maximize"
        >
          <Square className="title-bar-button-icon size-3 group-hover:text-neon-cyan" style={{
            color: 'var(--neon-purple)'
          }} />
        </button>
        
        <button
          onClick={handleClose}
          className="title-bar-button h-6 w-8 flex items-center justify-center hover:bg-red-500/80 transition-colors rounded-sm group"
          aria-label="Close"
        >
          <X className="title-bar-button-icon size-3.5 group-hover:text-white" style={{
            color: 'var(--neon-purple)'
          }} />
        </button>
      </div>
    </div>
  );
}
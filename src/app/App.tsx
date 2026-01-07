import { useState, useEffect } from 'react';
import { Gamepad2, ListChecks, Settings } from 'lucide-react';
import { DatFileUploader, type DatFile } from './components/DatFileUploader';
import { RomListUploader, type RomList } from './components/RomListUploader';
import { GameComparison } from './components/GameComparison';
import { WantList, type WantedGame } from './components/WantList';
import { TitleBar } from './components/TitleBar';
import { Card } from './components/ui/card';
import { Separator } from './components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

export default function App() {
  // Debug: Check if Electron API is available
  useEffect(() => {
    console.log('🔍 Checking for Electron API...');
    console.log('window.electronAPI:', window.electronAPI);
    console.log('Available methods:', window.electronAPI ? Object.keys(window.electronAPI) : 'NOT AVAILABLE');
  }, []);

  // Theme state with localStorage persistence
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // DAT files with localStorage persistence
  const [datFiles, setDatFiles] = useState<DatFile[]>(() => {
    const saved = localStorage.getItem('datFiles');
    return saved ? JSON.parse(saved) : [];
  });

  // ROM lists with localStorage persistence
  const [romLists, setRomLists] = useState<RomList[]>(() => {
    const saved = localStorage.getItem('romLists');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState('collection');
  
  // Want list state with localStorage persistence
  const [wantedGames, setWantedGames] = useState<WantedGame[]>(() => {
    const saved = localStorage.getItem('wantedGames');
    return saved ? JSON.parse(saved) : [];
  });

  // Save DAT files to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('datFiles', JSON.stringify(datFiles));
  }, [datFiles]);

  // Save ROM lists to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('romLists', JSON.stringify(romLists));
  }, [romLists]);

  // Save want list to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wantedGames', JSON.stringify(wantedGames));
  }, [wantedGames]);

  // Auto-remove wanted games when they appear in the collection
  useEffect(() => {
    if (romLists.length === 0) return;

    const updatedWantedGames = wantedGames.filter(wantedGame => {
      // Find the ROM list for this system
      const romList = romLists.find(list => list.systemName === wantedGame.systemName);
      if (!romList) return true; // Keep it if we don't have this system

      // Check if the ROM is in the list
      const hasRom = romList.roms.some(rom => 
        rom.name === wantedGame.romName || 
        rom.name.toLowerCase().includes(wantedGame.name.toLowerCase())
      );

      return !hasRom; // Keep only if we DON'T have the ROM
    });

    if (updatedWantedGames.length !== wantedGames.length) {
      setWantedGames(updatedWantedGames);
    }
  }, [romLists, wantedGames]);

  const addToWantList = (game: WantedGame) => {
    if (!wantedGames.some(g => g.id === game.id)) {
      setWantedGames([...wantedGames, game]);
    }
  };

  const removeFromWantList = (id: string) => {
    setWantedGames(wantedGames.filter(g => g.id !== id));
  };

  const wantedGameIds = new Set(wantedGames.map(g => g.id));

  const tabs = [
    {
      id: 'collection',
      label: 'ROM Collection',
      icon: <Gamepad2 className="size-4" />,
    },
    {
      id: 'wantlist',
      label: 'Want List',
      icon: <ListChecks className="size-4" />,
    },
    {
      id: 'setup',
      label: 'Setup',
      icon: <Settings className="size-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Custom Title Bar */}
      <TitleBar theme={theme} onThemeToggle={toggleTheme} />
      
      {/* Main Content - Add top padding for title bar */}
      <div className="container mx-auto py-8 px-4 max-w-7xl" style={{ paddingTop: 'calc(2rem + 32px)' }}>
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Gamepad2 className="size-10 text-primary animate-pulse" style={{
              filter: 'drop-shadow(0 0 10px var(--neon-pink)) drop-shadow(0 0 20px var(--neon-pink))'
            }} />
            <h1 className="text-4xl font-bold uppercase tracking-wider">
              ROM ARCADE
            </h1>
            <Gamepad2 className="size-10 text-primary animate-pulse" style={{
              filter: 'drop-shadow(0 0 10px var(--neon-pink)) drop-shadow(0 0 20px var(--neon-pink))'
            }} />
          </div>
          <p className="text-lg" style={{
            textShadow: '0 0 5px var(--neon-cyan)',
            color: 'var(--neon-cyan)'
          }}>
            ⚡ RETRO COLLECTION MANAGER ⚡
          </p>
          <p className="text-sm mt-2 opacity-80">
            Upload DAT files and ROM lists to track your ultimate collection
          </p>
        </div>

        {/* Tab Navigation */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            {tabs.map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-2"
              >
                {tab.icon}
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="collection">
            <GameComparison 
              datFiles={datFiles} 
              romLists={romLists}
              onAddToWantList={addToWantList}
              wantedGameIds={wantedGameIds}
            />
          </TabsContent>

          {/* Want List Tab */}
          <TabsContent value="wantlist">
            <WantList 
              wantedGames={wantedGames}
              onRemoveGame={removeFromWantList}
            />
          </TabsContent>

          <TabsContent value="setup">
            <Card className="p-6 mb-8 neon-card">
              <h2 className="text-2xl font-semibold mb-4 uppercase">⚙️ SETUP</h2>
              
              <div className="space-y-6">
                {/* DAT File Upload */}
                <div>
                  <h3 className="font-medium mb-3 text-lg">▶ 1. UPLOAD DAT FILES</h3>
                  <DatFileUploader 
                    onDatFilesLoaded={setDatFiles}
                    datFiles={datFiles}
                  />
                </div>

                <Separator style={{ 
                  backgroundColor: 'var(--neon-purple)',
                  boxShadow: '0 0 5px var(--neon-purple)'
                }} />

                {/* ROM List Upload */}
                <div>
                  <h3 className="font-medium mb-3 text-lg">▶ 2. UPLOAD ROM LISTS</h3>
                  <RomListUploader
                    onRomsLoaded={setRomLists}
                    romLists={romLists}
                    datFiles={datFiles}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
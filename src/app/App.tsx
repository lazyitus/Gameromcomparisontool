import { useState, useEffect } from 'react';
import { Gamepad2, ListChecks, Settings, Trash2, Globe } from 'lucide-react';
import { DatFileUploader, type DatFile } from './components/DatFileUploader';
import { RomListUploader, type RomList } from './components/RomListUploader';
import { GameComparison } from './components/GameComparison';
import { WantList, type WantedGame } from './components/WantList';
import { CrossPlatformGames } from './components/CrossPlatformGames';
import { TitleBar } from './components/TitleBar';
import { Card } from './components/ui/card';
import { Separator } from './components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import '../styles/arcade-compact.css';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './components/ui/alert-dialog';

export default function App() {
  // Debug: Check if Electron API is available
  useEffect(() => {
    console.log('🔍 Checking for Electron API...');
    console.log('window.electronAPI:', window.electronAPI);
    console.log('Available methods:', window.electronAPI ? Object.keys(window.electronAPI) : 'NOT AVAILABLE');
  }, []);

  // DAT files - no localStorage persistence (too large)
  const [datFiles, setDatFiles] = useState<DatFile[]>([]);

  // ROM lists - no localStorage persistence (too large)
  const [romLists, setRomLists] = useState<RomList[]>([]);

  const [activeTab, setActiveTab] = useState('collection');
  
  // Trigger matching flag - set to 'new', 'all', or null
  const [triggerMatching, setTriggerMatching] = useState<'new' | 'all' | null>(null);
  
  // Want list state with localStorage persistence
  const [wantedGames, setWantedGames] = useState<WantedGame[]>(() => {
    const saved = localStorage.getItem('wantedGames');
    return saved ? JSON.parse(saved) : [];
  });

  // Comparison results state with localStorage persistence
  const [comparisonResults, setComparisonResults] = useState<any[]>(() => {
    const saved = localStorage.getItem('comparisonResults');
    return saved ? JSON.parse(saved) : [];
  });

  // Save want list to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wantedGames', JSON.stringify(wantedGames));
  }, [wantedGames]);

  // Save comparison results to localStorage whenever they change
  useEffect(() => {
    if (comparisonResults.length > 0) {
      localStorage.setItem('comparisonResults', JSON.stringify(comparisonResults));
    }
  }, [comparisonResults]);

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

  const clearAllData = () => {
    // Clear all state
    setDatFiles([]);
    setRomLists([]);
    setWantedGames([]);
    setTriggerMatching(null);
    
    // Clear all localStorage
    localStorage.clear();
    
    console.log('🗑️ ALL DATA CLEARED - App reset to first use state');
  };

  const wantedGameIds = new Set(wantedGames.map(g => g.id));

  const tabs = [
    {
      id: 'collection',
      label: 'ROM Collection',
      icon: <Gamepad2 className="size-4" />,
    },
    {
      id: 'crossplatform',
      label: 'Cross-Platform',
      icon: <Globe className="size-4" />,
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
      <TitleBar />
      
      {/* Main Content - Add top padding for title bar */}
      <div className="container mx-auto py-8 px-4 max-w-7xl max-[512px]:py-2 max-[512px]:px-2" style={{ paddingTop: 'calc(2rem + 32px)' }}>
        {/* Header */}
        <div className="mb-8 text-center max-[512px]:mb-3">
          <div className="flex items-center justify-center gap-3 mb-2 max-[512px]:gap-2 max-[512px]:mb-1">
            <Gamepad2 className="size-10 text-primary animate-pulse max-[512px]:size-6" style={{
              filter: 'drop-shadow(0 0 10px var(--neon-pink)) drop-shadow(0 0 20px var(--neon-pink))'
            }} />
            <h1 className="text-4xl font-bold uppercase tracking-wider max-[512px]:text-lg">
              ROM ARCADE
            </h1>
            <Gamepad2 className="size-10 text-primary animate-pulse max-[512px]:size-6" style={{
              filter: 'drop-shadow(0 0 10px var(--neon-pink)) drop-shadow(0 0 20px var(--neon-pink))'
            }} />
          </div>
          <p className="text-lg max-[512px]:text-xs max-[512px]:hidden" style={{
            textShadow: '0 0 5px var(--neon-cyan)',
            color: 'var(--neon-cyan)'
          }}>
            ⚡ RETRO COLLECTION MANAGER ⚡
          </p>
          <p className="text-sm mt-2 opacity-80 max-[512px]:hidden">
            Upload DAT files and ROM lists to track your ultimate collection
          </p>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6 max-[512px]:mb-2 max-[512px]:h-8">
            {tabs.map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-2 max-[512px]:gap-1 max-[512px]:text-xs max-[512px]:px-1"
              >
                <span className="max-[512px]:hidden">{tab.icon}</span>
                <span className="max-[512px]:text-[10px]">{tab.label}</span>
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
              triggerMatching={triggerMatching}
              setTriggerMatching={setTriggerMatching}
              comparisonResults={comparisonResults}
              setComparisonResults={setComparisonResults}
            />
          </TabsContent>

          {/* Cross-Platform Tab */}
          <TabsContent value="crossplatform">
            <CrossPlatformGames 
              datFiles={datFiles}
              romLists={romLists}
              comparisonResults={comparisonResults}
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
            <Card className="p-6 mb-8 neon-card max-[512px]:p-3 max-[512px]:mb-4">
              <h2 className="text-2xl font-semibold mb-4 uppercase max-[512px]:text-lg max-[512px]:mb-2">⚙️ SETUP</h2>
              
              <div className="space-y-6 max-[512px]:space-y-3">
                {/* DAT File Upload */}
                <div>
                  <h3 className="font-medium mb-3 text-lg max-[512px]:text-sm max-[512px]:mb-2">▶ 1. UPLOAD DAT FILES</h3>
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
                  <h3 className="font-medium mb-3 text-lg max-[512px]:text-sm max-[512px]:mb-2">▶ 2. UPLOAD ROM LISTS</h3>
                  <RomListUploader
                    onRomsLoaded={setRomLists}
                    romLists={romLists}
                    datFiles={datFiles}
                  />
                </div>

                {/* Matching Buttons */}
                {datFiles.length > 0 && romLists.length > 0 && (
                  <>
                    <Separator style={{ 
                      backgroundColor: 'var(--neon-purple)',
                      boxShadow: '0 0 5px var(--neon-purple)'
                    }} />
                    
                    <div>
                      <h3 className="font-medium mb-3 text-lg max-[512px]:text-sm max-[512px]:mb-2">▶ 3. START MATCHING</h3>
                      <p className="text-sm text-muted-foreground mb-4 max-[512px]:text-xs max-[512px]:mb-2 max-[512px]:hidden">
                        Match your ROM files against the DAT database to see what you have and what's missing.
                      </p>
                      
                      <div className="flex gap-3 max-[512px]:flex-col max-[512px]:gap-2">
                        <Button
                          onClick={() => {
                            console.log('🚀 MATCH NEW BUTTON CLICKED');
                            console.log('📊 Current systemsToMatch:', localStorage.getItem('systemsToMatch'));
                            console.log('📊 Current processedDats:', localStorage.getItem('processedDats'));
                            console.log('📊 Current processedRomLists:', localStorage.getItem('processedRomLists'));
                            setTriggerMatching('new');
                            setActiveTab('collection');
                          }}
                          className="neon-button flex-1 max-[512px]:text-xs"
                          size="lg"
                          style={{
                            boxShadow: '0 0 15px var(--neon-cyan)',
                          }}
                        >
                          <Gamepad2 className="mr-2 h-5 w-5 max-[512px]:h-3 max-[512px]:w-3 max-[512px]:mr-1" />
                          <span className="max-[512px]:text-[10px]">MATCH NEW</span>
                        </Button>
                        
                        <Button
                          onClick={() => {
                            console.log('🔥 RE-MATCH ALL BUTTON CLICKED');
                            setTriggerMatching('all');
                            setActiveTab('collection');
                          }}
                          variant="outline"
                          className="flex-1 max-[512px]:text-xs"
                          size="lg"
                          style={{
                            borderColor: 'var(--neon-pink)',
                            boxShadow: '0 0 10px var(--neon-pink)',
                          }}
                        >
                          <Gamepad2 className="mr-2 h-5 w-5 max-[512px]:h-3 max-[512px]:w-3 max-[512px]:mr-1" />
                          <span className="max-[512px]:text-[10px]">RE-MATCH ALL</span>
                        </Button>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-2 max-[512px]:text-[9px] max-[512px]:mt-1 max-[512px]:hidden">
                        💡 <strong>Match New:</strong> Only matches systems you just added
                        <br />
                        💡 <strong>Re-Match All:</strong> Re-processes everything from scratch
                      </p>
                    </div>
                  </>
                )}
                
                {/* Clear All Data Button - Always visible */}
                <Separator style={{ 
                  backgroundColor: 'var(--neon-purple)',
                  boxShadow: '0 0 5px var(--neon-purple)'
                }} />
                
                <div>
                  <h3 className="font-medium mb-3 text-lg text-red-400">⚠️ DANGER ZONE</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Reset the app to its initial state. This will permanently delete all uploaded DAT files, ROM lists, comparison results, and your want list.
                  </p>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="lg"
                        className="w-full"
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.2)',
                          borderColor: 'rgb(239, 68, 68)',
                          boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
                        }}
                      >
                        <Trash2 className="mr-2 h-5 w-5" />
                        CLEAR ALL DATA
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="neon-card">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl uppercase flex items-center gap-2">
                          <Trash2 className="h-6 w-6 text-red-500" />
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                          This action <strong className="text-red-400">cannot be undone</strong>. This will permanently delete:
                          <ul className="list-disc list-inside mt-3 space-y-1">
                            <li>All uploaded DAT files ({datFiles.length} {datFiles.length === 1 ? 'file' : 'files'})</li>
                            <li>All uploaded ROM lists ({romLists.length} {romLists.length === 1 ? 'list' : 'lists'})</li>
                            <li>All comparison results and matching history</li>
                            <li>Your entire want list ({wantedGames.length} {wantedGames.length === 1 ? 'game' : 'games'})</li>
                            <li>All filter preferences and settings</li>
                          </ul>
                          <p className="mt-3 text-yellow-400">
                            💡 The app will be reset to first-use state.
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={clearAllData}
                          className="bg-red-600 hover:bg-red-700"
                          style={{
                            boxShadow: '0 0 15px rgba(239, 68, 68, 0.5)',
                          }}
                        >
                          Yes, Delete Everything
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
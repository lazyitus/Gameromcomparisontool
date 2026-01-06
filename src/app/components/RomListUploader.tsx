import { FolderOpen, FileText, ChevronDown, ChevronUp, X, List } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useState } from 'react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import type { DatFile } from './DatFileUploader';

interface RomList {
  name: string;
  systemName: string;
  roms: { name: string }[];
}

interface RomListUploaderProps {
  onRomsLoaded: (lists: RomList[]) => void;
  romLists: RomList[];
  datFiles: DatFile[];
}

export type { RomList };

// Comprehensive system name mapping based on RetroBat wiki
const SYSTEM_ALIASES: Record<string, string[]> = {
  // 3DO
  '3do': ['3do interactive multiplayer', 'panasonic 3do'],
  
  // Nintendo 3DS
  '3ds': ['nintendo 3ds', 'n3ds'],
  
  // Actionmax
  'actionmax': ['action max'],
  
  // Coleco Adam
  'adam': ['coleco adam'],
  
  // Adventure Vision
  'advision': ['adventure vision'],
  
  // Amiga variants
  'amiga': ['commodore amiga', 'amiga500', 'amiga 500', 'amiga ocs', 'amiga ecs'],
  'amiga1200': ['amiga 1200', 'amiga aga'],
  'amiga4000': ['amiga 4000'],
  'amigacd32': ['amiga cd32', 'cd32'],
  'amigacdtv': ['amiga cdtv', 'cdtv'],
  
  // Amstrad
  'amstradcpc': ['amstrad cpc', 'cpc'],
  'gx4000': ['amstrad gx4000'],
  
  // APF
  'apfm1000': ['apf m-1000', 'apf m1000', 'apf imagination machine'],
  
  // Apple
  'apple2': ['apple ii', 'apple ][', 'apple 2'],
  'apple2gs': ['apple iigs', 'apple 2gs', 'apple gs'],
  
  // Aquarius
  'aquarius': ['mattel aquarius'],
  
  // Arcadia
  'arcadia': ['arcadia 2001', 'emerson arcadia'],
  
  // Archimedes
  'archimedes': ['acorn archimedes'],
  
  // Arduboy
  'arduboy': ['arduboy'],
  
  // Astrocade
  'astrocade': ['bally astrocade', 'bally professional arcade'],
  
  // Atari
  'atari800': ['atari 800', 'atari 400'],
  'atari2600': ['atari 2600', '2600', 'atari vcs'],
  'atari5200': ['atari 5200', '5200'],
  'atari7800': ['atari 7800', '7800', 'atari 7800 prosystem'],
  'atarist': ['atari st', 'st', 'atari ste'],
  'atarijaguar': ['jaguar', 'atari jaguar'],
  'jaguarcd': ['jaguar cd', 'atari jaguar cd'],
  'atarilynx': ['lynx', 'atari lynx'],
  'xegs': ['atari xe', 'atari xegs', 'xe game system'],
  
  // Atom
  'atom': ['acorn atom'],
  
  // Atomiswave
  'atomiswave': ['sega atomiswave', 'sammy atomiswave'],
  
  // BBC Micro
  'bbcmicro': ['bbc micro', 'bbc model b'],
  
  // VIC-20
  'c20': ['vic-20', 'vic20', 'commodore vic-20'],
  
  // Commodore
  'c64': ['commodore 64', 'c-64', 'c 64'],
  'c128': ['commodore 128', 'c-128'],
  'cplus4': ['commodore plus/4', 'commodore plus 4', 'plus/4', 'plus4'],
  'pet': ['commodore pet', 'pet'],
  
  // Camputers Lynx (not Atari Lynx)
  'camplynx': ['camputers lynx'],
  
  // Casio Loopy
  'casloopy': ['casio loopy', 'loopy'],
  
  // Philips CD-i
  'cdi': ['cd-i', 'philips cd-i', 'philips cdi', 'cdi'],
  
  // Channel F
  'channelf': ['fairchild channel f', 'channel f', 'fairchild f'],
  
  // Chihiro
  'chihiro': ['sega chihiro'],
  
  // TRS-80
  'coco': ['trs-80', 'trs-80 color computer', 'tandy color computer'],
  
  // ColecoVision
  'colecovision': ['colecovision', 'coleco vision'],
  
  // Capcom Play System
  'cps1': ['cps-1', 'capcom play system', 'cp system', 'cps'],
  'cps2': ['cps-2', 'capcom play system 2', 'cp system ii', 'cp system 2'],
  'cps3': ['cps-3', 'capcom play system 3', 'cp system iii', 'cp system 3'],
  
  // CreatiVision
  'crvision': ['creativision', 'vtech creativision'],
  
  // Dragon
  'dragon32': ['dragon 32', 'dragon 64', 'dragon data'],
  
  // DOS
  'dos': ['dos', 'pc', 'ibm pc', 'msdos', 'ms-dos', 'pc dos'],
  
  // Dreamcast
  'dreamcast': ['dc', 'sega dreamcast'],
  
  // Acorn Electron
  'electron': ['acorn electron'],
  
  // Nintendo FDS
  'fds': ['famicom disk system', 'fds', 'famicom disk'],
  
  // FM-7 & FM Towns
  'fm7': ['fm-7', 'fujitsu fm-7'],
  'fmtowns': ['fm towns', 'fujitsu fm towns'],
  
  // Gamate
  'gamate': ['bit corp gamate'],
  
  // Game and Watch
  'gameandwatch': ['game and watch', 'game & watch', 'g&w'],
  
  // Game.com
  'gamecom': ['game.com', 'gamecom', 'tiger game.com'],
  
  // GameCube
  'gamecube': ['gamecube', 'gc', 'ngc', 'nintendo gamecube'],
  
  // Game Gear
  'gamegear': ['game gear', 'gg', 'sega game gear', 'gamegear'],
  
  // Game Pocket Computer
  'gamepock': ['game pocket computer', 'epoch game pocket'],
  
  // Game Boy family
  'gb': ['game boy', 'gameboy', 'nintendo game boy'],
  'gbc': ['game boy color', 'gameboy color', 'game boy colour', 'gbc'],
  'gba': ['game boy advance', 'gameboy advance', 'gba'],
  'sgb': ['super game boy', 'super gameboy'],
  
  // Game Master
  'gmaster': ['game master', 'hartung game master'],
  
  // Game Park 32
  'gp32': ['game park 32', 'gamepark 32'],
  
  // Intellivision
  'intellivision': ['mattel intellivision', 'intellivision'],
  
  // Atari Lynx (already covered above but worth mentioning)
  'lynx': ['atari lynx', 'lynx'],
  
  // MAME
  'mame': ['arcade', 'mame', 'multiple arcade machine emulator'],
  
  // Sega Master System
  'mastersystem': ['master system', 'sms', 'sega master system', 'mark iii', 'mark 3'],
  
  // Sega Mega CD / Sega CD
  'megacd': ['mega cd', 'sega cd', 'megacd', 'sega mega cd', 'segacd'],
  
  // Sega Mega Drive / Genesis
  'megadrive': ['mega drive', 'genesis', 'sega genesis', 'sega mega drive', 'md', 'gen'],
  
  // Mega Duck
  'megaduck': ['mega duck', 'cougar boy'],
  
  // Sega Model 2 & 3
  'model2': ['sega model 2', 'model 2'],
  'model3': ['sega model 3', 'model 3'],
  
  // MSX family
  'msx': ['msx', 'msx1'],
  'msx2': ['msx2', 'msx 2'],
  'msx2+': ['msx2+', 'msx2plus', 'msx 2+'],
  'msxturbor': ['msx turbo r', 'msx turbor', 'turbo r'],
  
  // Othello Multivision
  'multivision': ['othello multivision'],
  
  // Nintendo 64
  'n64': ['nintendo 64', 'nintendo64', 'n 64'],
  'n64dd': ['nintendo 64dd', 'n64dd', '64dd', 'nintendo 64 disk drive'],
  
  // Namco Systems
  'namco2x6': ['namco system 246', 'namco system 256', 'system 246', 'system 256'],
  'namco3xx': ['namco system 357', 'namco system 369', 'system 357', 'system 369'],
  
  // Naomi
  'naomi': ['sega naomi', 'naomi'],
  'naomi2': ['sega naomi 2', 'naomi 2', 'naomi ii'],
  
  // Nintendo DS
  'nds': ['nintendo ds', 'ds', 'nds'],
  
  // Neo Geo family
  'neogeo': ['neo geo', 'neo-geo', 'neogeo', 'aes', 'neo geo aes', 'neo geo mvs', 'snk neo geo'],
  'neogeo64': ['hyper neo geo 64', 'neo geo 64', 'hyper neogeo 64'],
  'neogeocd': ['neo geo cd', 'neo-geo cd', 'neocd', 'neogeo cd'],
  'neogeopocket': ['ngp', 'neo geo pocket', 'neo-geo pocket'],
  'neogeopocketcolor': ['ngpc', 'neo geo pocket color', 'neo-geo pocket color'],
  
  // NES / Famicom
  'nes': ['nintendo entertainment system', 'famicom', 'fc', 'nes', 'nintendo famicom'],
  
  // Nokia N-Gage
  'ngage': ['n-gage', 'ngage', 'nokia n-gage'],
  
  // Odyssey 2 / Videopac
  'o2em': ['odyssey 2', 'odyssey2', 'videopac', 'magnavox odyssey 2', 'philips videopac'],
  
  // Oric
  'oricatmos': ['oric', 'oric atmos', 'oric 1'],
  
  // Philips P2000
  'p2000t': ['philips p2000', 'p2000', 'p2000t'],
  
  // PC-88 & PC-98
  'pc88': ['pc-8800', 'pc88', 'nec pc-88'],
  'pc98': ['pc-9800', 'pc98', 'nec pc-98'],
  
  // PC Engine / TurboGrafx
  'pcengine': ['pc engine', 'tg16', 'turbografx', 'turbografx-16', 'turbografx 16', 'tg-16'],
  'pcenginecd': ['pc engine cd', 'tg-cd', 'turbografx cd', 'turbo cd'],
  'supergrafx': ['supergrafx', 'super grafx', 'pc engine supergrafx'],
  
  // PC-FX
  'pcfx': ['pc-fx', 'pcfx', 'nec pc-fx'],
  
  // Aamber Pegasus
  'pegasus': ['aamber pegasus', 'pegasus'],
  
  // Pokemon Mini
  'pokemini': ['pokemon mini', 'pokémon mini', 'pokemon-mini'],
  
  // PlayStation family
  'psx': ['playstation', 'ps1', 'playstation 1', 'sony playstation', 'psx', 'ps-x'],
  'ps2': ['playstation 2', 'ps2', 'sony playstation 2'],
  'ps3': ['playstation 3', 'ps3', 'sony playstation 3'],
  'ps4': ['playstation 4', 'ps4', 'sony playstation 4'],
  'psp': ['playstation portable', 'psp', 'sony psp'],
  'psvita': ['ps vita', 'vita', 'playstation vita', 'psvita', 'sony vita'],
  
  // PV-1000
  'pv1000': ['pv-1000', 'casio pv-1000'],
  
  // Sam Coupé
  'samcoupe': ['sam coupe', 'sam coupé', 'samcoupe'],
  
  // Satellaview
  'satellaview': ['satellaview', 'bs-x'],
  
  // Saturn
  'saturn': ['sega saturn', 'saturn', 'ss'],
  
  // Super Cassette Vision
  'scv': ['super cassette vision', 'scv', 'epoch super cassette vision'],
  
  // Sega 32X
  'sega32x': ['32x', 'sega 32x', 'genesis 32x', 'mega drive 32x', 'mega 32x'],
  
  // Sega ST-V
  'segastv': ['sega st-v', 'st-v', 'titan'],
  
  // SG-1000
  'sg1000': ['sg-1000', 'sg1000', 'sega sg-1000'],
  
  // SNES / Super Famicom
  'snes': ['super nintendo', 'super famicom', 'sfc', 'super nes', 'snes', 'super nintendo entertainment system'],
  
  // Sufami Turbo
  'sufami': ['sufami turbo', 'sufamiturbo'],
  
  // Supervision
  'supervision': ['watara supervision', 'supervision'],
  
  // Super A'Can
  'supracan': ['super acan', 'super a\'can', 'supracan'],
  
  // Nintendo Switch
  'switch': ['nintendo switch', 'switch', 'nswitch'],
  
  // Thomson
  'thomson': ['thomson', 'thomson mo', 'thomson to'],
  
  // TI-99
  'ti99': ['ti-99', 'ti99', 'ti-99/4a', 'texas instruments 99'],
  
  // Triforce
  'triforce': ['nintendo triforce', 'triforce'],
  
  // Uzebox
  'uzebox': ['uzebox'],
  
  // VC4000
  'vc4000': ['vc4000', 'interton vc 4000'],
  
  // Vectrex
  'vectrex': ['vectrex', 'gce vectrex'],
  
  // VG5000
  'vg5000': ['philips vg5000', 'vg5000'],
  
  // Virtual Boy
  'virtualboy': ['virtual boy', 'vb', 'nintendo virtual boy'],
  
  // V.Smile
  'vsmile': ['v.smile', 'vsmile', 'v-smile', 'vtech v.smile'],
  
  // Wii
  'wii': ['nintendo wii', 'wii'],
  'wiiu': ['wii u', 'nintendo wii u', 'wiiu'],
  
  // WonderSwan
  'wswan': ['wonderswan', 'ws', 'bandai wonderswan'],
  'wswanc': ['wonderswan color', 'wsc', 'wonderswancolor'],
  
  // Sharp X1 & X68000
  'x1': ['sharp x1', 'x1'],
  'x68000': ['sharp x68000', 'x68000'],
  
  // Xbox family
  'xbox': ['microsoft xbox', 'xbox'],
  'xbox360': ['xbox 360', 'x360', 'microsoft xbox 360'],
  
  // Zinc
  'zinc': ['zinc', 'sony zn-1', 'sony zn-2'],
  
  // ZX Spectrum & ZX81
  'zx81': ['zx 81', 'zx81', 'sinclair zx81'],
  'zxspectrum': ['zx spectrum', 'spectrum', 'sinclair zx spectrum', 'sinclair spectrum'],
  
  // Spectravideo
  'spectravideo': ['spectravideo', 'spectravideo sv-318'],
};

// Normalize a system name to match against aliases
const normalizeSystemName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove special characters
    .replace(/\s+/g, '');
};

// Find matching system using comprehensive alias matching
const findMatchingSystem = (filename: string, datFiles: DatFile[]): string | null => {
  const filenameLower = filename.toLowerCase().replace('.txt', '');
  const filenameNormalized = normalizeSystemName(filename);
  
  for (const datFile of datFiles) {
    const systemLower = datFile.system.toLowerCase();
    const systemNormalized = normalizeSystemName(datFile.system);
    
    // Direct match (case-insensitive)
    if (filenameLower.includes(systemLower) || systemLower.includes(filenameLower)) {
      return datFile.system;
    }
    
    // Normalized match
    if (filenameNormalized.includes(systemNormalized) || systemNormalized.includes(filenameNormalized)) {
      return datFile.system;
    }
    
    // Check aliases
    for (const [canonical, aliases] of Object.entries(SYSTEM_ALIASES)) {
      const canonicalNormalized = normalizeSystemName(canonical);
      
      // Check if DAT system matches canonical name or any alias
      const datMatchesCanonical = 
        systemNormalized.includes(canonicalNormalized) ||
        canonicalNormalized.includes(systemNormalized) ||
        aliases.some(alias => {
          const aliasNormalized = normalizeSystemName(alias);
          return systemNormalized.includes(aliasNormalized) || aliasNormalized.includes(systemNormalized);
        });
      
      if (datMatchesCanonical) {
        // Check if filename matches canonical name or any alias
        const filenameMatchesCanonical =
          filenameNormalized.includes(canonicalNormalized) ||
          canonicalNormalized.includes(filenameNormalized) ||
          aliases.some(alias => {
            const aliasNormalized = normalizeSystemName(alias);
            return filenameNormalized.includes(aliasNormalized) || aliasNormalized.includes(filenameNormalized);
          });
        
        if (filenameMatchesCanonical) {
          return datFile.system;
        }
      }
    }
  }
  
  return null;
};

export function RomListUploader({ onRomsLoaded, romLists, datFiles }: RomListUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, fileName: '' });
  const [pendingAssignments, setPendingAssignments] = useState<Array<{
    filename: string;
    content: string;
    systemName: string | null;
  }>>([]);

  const parseRomList = (content: string, filename: string, systemName: string): RomList => {
    const lines = content.split('\n').filter(line => line.trim());
    const roms = lines.map(line => ({ name: line.trim() }));
    
    return {
      name: filename,
      systemName,
      roms,
    };
  };

  const handleDirectorySelect = async () => {
    if (!window.electronAPI) {
      setError('Electron API not available. Please run as desktop app.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const fileData = await window.electronAPI.selectRomListDirectory();
      
      if (!fileData || fileData.length === 0) {
        setIsLoading(false);
        return; // User canceled
      }

      // If we have DAT files, try to auto-match based on filename
      if (datFiles.length > 0) {
        const assignments = fileData.map(({ name, content }) => {
          const matchedSystem = findMatchingSystem(name, datFiles);
          
          return {
            filename: name,
            content,
            systemName: matchedSystem,
          };
        });

        setPendingAssignments(assignments);
      } else {
        setError('Please load DAT files first to assign ROM lists to systems');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ROM list files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilesSelect = async () => {
    if (!window.electronAPI) {
      setError('Electron API not available. Please run as desktop app.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const fileData = await window.electronAPI.selectRomListFiles();
      
      if (!fileData || fileData.length === 0) {
        setIsLoading(false);
        return; // User canceled
      }

      // If we have DAT files, try to auto-match based on filename
      if (datFiles.length > 0) {
        const assignments = fileData.map(({ name, content }) => {
          const matchedSystem = findMatchingSystem(name, datFiles);
          
          return {
            filename: name,
            content,
            systemName: matchedSystem,
          };
        });

        setPendingAssignments(assignments);
      } else {
        setError('Please load DAT files first to assign ROM lists to systems');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ROM list files');
    } finally {
      setIsLoading(false);
    }
  };

  const updateAssignment = (index: number, systemName: string) => {
    const updated = [...pendingAssignments];
    updated[index].systemName = systemName;
    setPendingAssignments(updated);
  };

  const confirmAssignments = () => {
    const newLists: RomList[] = [];
    
    for (const assignment of pendingAssignments) {
      if (assignment.systemName) {
        const parsed = parseRomList(assignment.content, assignment.filename, assignment.systemName);
        newLists.push(parsed);
      }
    }

    if (newLists.length > 0) {
      onRomsLoaded([...romLists, ...newLists]);
      setPendingAssignments([]);
    }
  };

  const cancelAssignments = () => {
    setPendingAssignments([]);
  };

  const removePendingAssignment = (index: number) => {
    const updated = pendingAssignments.filter((_, i) => i !== index);
    setPendingAssignments(updated);
  };

  const removeRomList = (index: number) => {
    const updated = romLists.filter((_, i) => i !== index);
    onRomsLoaded(updated);
  };

  const totalRoms = romLists.reduce((sum, list) => sum + list.roms.length, 0);

  return (
    <Card className="p-6 neon-card">
      <div className="space-y-4">
        <div className="flex gap-3">
          <Button
            onClick={handleDirectorySelect}
            disabled={isLoading || datFiles.length === 0}
            className="flex-1 neon-button"
            size="lg"
          >
            <FolderOpen className="mr-2 h-5 w-5" />
            {isLoading ? 'Loading...' : 'Select ROM Lists Directory'}
          </Button>

          <Button
            onClick={handleFilesSelect}
            disabled={isLoading || datFiles.length === 0}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            <FileText className="mr-2 h-5 w-5" />
            Select Individual Files
          </Button>
        </div>

        {datFiles.length === 0 && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500 rounded-md">
            <p className="text-sm text-yellow-400">⚠️ Load DAT files first to assign ROM lists to systems</p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500 rounded-md">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* System Assignment UI */}
        {pendingAssignments.length > 0 && (
          <Card className="p-4 border-2 border-primary">
            <h3 className="font-semibold mb-4 stat-glow-cyan">Assign ROM Lists to Systems</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
              {pendingAssignments.map((assignment, index) => {
                const lineCount = assignment.content.split('\n').filter(l => l.trim()).length;
                
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-background rounded-md">
                    <div className="flex-1">
                      <div className="font-medium">{assignment.filename}</div>
                      <div className="text-sm opacity-70">{lineCount} ROMs</div>
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs mb-1 block">System</Label>
                      <Select
                        value={assignment.systemName || ''}
                        onValueChange={(value) => updateAssignment(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select system..." />
                        </SelectTrigger>
                        <SelectContent>
                          {datFiles.map((datFile, i) => (
                            <SelectItem key={i} value={datFile.system}>
                              {datFile.system}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePendingAssignment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={confirmAssignments}
                className="flex-1 neon-button"
                disabled={pendingAssignments.filter(a => a.systemName).length === 0}
              >
                Confirm {pendingAssignments.filter(a => a.systemName).length} Assignment(s)
              </Button>
              <Button
                onClick={cancelAssignments}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {romLists.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <List className="h-4 w-4 stat-glow-green" />
                <span className="font-semibold stat-glow-green">
                  {romLists.length} ROM list{romLists.length !== 1 ? 's' : ''} loaded
                </span>
                <Badge variant="outline" className="neon-badge" style={{ color: 'var(--neon-cyan)' }}>
                  {totalRoms.toLocaleString()} total ROMs
                </Badge>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>

            {isExpanded && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {romLists.map((list, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-background/50 rounded-md border border-primary/20"
                  >
                    <div className="flex-1">
                      <div className="font-medium stat-glow-pink">{list.systemName}</div>
                      <div className="text-sm opacity-70">{list.name}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">
                        {list.roms.length.toLocaleString()} ROMs
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRomList(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
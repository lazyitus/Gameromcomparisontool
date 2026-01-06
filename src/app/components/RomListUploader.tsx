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
  // Nintendo Systems
  'nes': ['nintendo entertainment system', 'famicom', 'fc', 'famicon'],
  'snes': ['super nintendo', 'super famicom', 'sfc', 'super nes'],
  'n64': ['nintendo 64', 'nintendo64'],
  'gamecube': ['gc', 'ngc', 'nintendo gamecube'],
  'wii': ['nintendo wii'],
  'wiiu': ['wii u', 'nintendo wii u'],
  'switch': ['nintendo switch', 'nswitch'],
  'gb': ['game boy', 'gameboy'],
  'gbc': ['game boy color', 'gameboy color', 'game boy colour'],
  'gba': ['game boy advance', 'gameboy advance'],
  'nds': ['nintendo ds', 'ds'],
  '3ds': ['nintendo 3ds', 'n3ds'],
  'virtualboy': ['virtual boy', 'vb'],
  'pokemon mini': ['pokemini'],
  
  // Sega Systems
  'mastersystem': ['master system', 'sms', 'sega master system'],
  'megadrive': ['genesis', 'sega genesis', 'sega mega drive', 'md', 'gen'],
  'segacd': ['mega cd', 'sega cd', 'megacd'],
  'sega32x': ['32x', 'genesis 32x', 'mega drive 32x'],
  'saturn': ['sega saturn', 'ss'],
  'dreamcast': ['dc', 'sega dreamcast'],
  'gamegear': ['game gear', 'gg', 'sega game gear'],
  'sg-1000': ['sg1000', 'sega sg-1000'],
  
  // Sony Systems
  'psx': ['playstation', 'ps1', 'playstation 1', 'sony playstation'],
  'ps2': ['playstation 2', 'sony playstation 2'],
  'ps3': ['playstation 3', 'sony playstation 3'],
  'psp': ['playstation portable', 'sony psp'],
  'psvita': ['ps vita', 'vita', 'playstation vita'],
  
  // Microsoft Systems
  'xbox': ['microsoft xbox'],
  'xbox360': ['xbox 360', 'x360'],
  
  // Atari Systems
  'atari2600': ['2600', 'atari 2600', 'atari2600'],
  'atari5200': ['5200', 'atari 5200'],
  'atari7800': ['7800', 'atari 7800'],
  'atarijaguar': ['jaguar', 'atari jaguar'],
  'atarilynx': ['lynx', 'atari lynx'],
  'atarist': ['atari st', 'st'],
  
  // Neo Geo
  'neogeo': ['neo geo', 'neo-geo', 'aes', 'neo geo aes'],
  'neogeocd': ['neo geo cd', 'neo-geo cd', 'neocd'],
  'neogeopocket': ['ngp', 'neo geo pocket'],
  'neogeopocketcolor': ['ngpc', 'neo geo pocket color'],
  
  // PC Engine / TurboGrafx
  'pcengine': ['pc engine', 'tg16', 'turbografx', 'turbografx-16', 'turbografx 16'],
  'pcenginecd': ['pc engine cd', 'tg-cd', 'turbografx cd'],
  'supergrafx': ['super grafx', 'sgfx'],
  
  // 3DO
  '3do': ['3do interactive multiplayer', 'panasonic 3do'],
  
  // MSX
  'msx': ['msx1'],
  'msx2': ['msx 2'],
  
  // Computers
  'amiga': ['commodore amiga'],
  'amigacd32': ['amiga cd32', 'cd32'],
  'c64': ['commodore 64', 'c-64'],
  'dos': ['pc', 'ibm pc', 'msdos', 'ms-dos'],
  'amstradcpc': ['amstrad cpc', 'cpc'],
  'zxspectrum': ['zx spectrum', 'spectrum'],
  
  // Arcade
  'mame': ['arcade', 'mame2003', 'mame2010', 'fbneo', 'fba'],
  'cps1': ['capcom play system', 'cp system'],
  'cps2': ['capcom play system 2', 'cp system ii'],
  'cps3': ['capcom play system 3', 'cp system iii'],
  'naomi': ['sega naomi'],
  
  // Other Systems
  'wonderswan': ['ws', 'bandai wonderswan'],
  'wonderswancolor': ['wsc', 'wonderswan color'],
  'vectrex': ['gce vectrex'],
  'intellivision': ['mattel intellivision'],
  'colecovision': ['coleco vision'],
  'odyssey2': ['odyssey 2', 'videopac', 'magnavox odyssey 2'],
  'channelf': ['fairchild channel f', 'channel f'],
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
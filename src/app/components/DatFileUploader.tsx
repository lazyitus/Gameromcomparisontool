import { FolderOpen, FileText, ChevronDown, ChevronUp, X, HardDrive } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useState } from 'react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface DatFile {
  name: string;
  system: string;
  games: Game[];
}

interface Game {
  name: string;
  description?: string;
  region?: string;
  rom?: {
    name: string;
    size?: string;
    crc?: string;
    md5?: string;
    sha1?: string;
  };
  category?: string;
  cloneof?: string; // For arcade clones/revisions
  isParent?: boolean; // Parent game in a clone family
}

interface DatFileUploaderProps {
  onDatFilesLoaded: (files: DatFile[]) => void;
  datFiles: DatFile[];
}

export type { DatFile, Game };

export function DatFileUploader({ onDatFilesLoaded, datFiles }: DatFileUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, fileName: '' });

  const parseDatFile = (content: string, filename: string): DatFile | null => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, 'text/xml');
      
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Invalid XML format');
      }

      const datafile = xmlDoc.querySelector('datafile');
      const header = datafile?.querySelector('header');
      const systemName = header?.querySelector('name')?.textContent || 
                        filename.replace(/\.(dat|xml)$/i, '');

      const gameElements = Array.from(xmlDoc.querySelectorAll('game, machine'));
      
      const games: Game[] = gameElements.map(gameEl => {
        const name = gameEl.getAttribute('name') || '';
        const description = gameEl.querySelector('description')?.textContent || name;
        
        // Extract region from name or description
        const regionMatch = description.match(/\\(([^)]*(?:USA|Europe|Japan|World|Asia|Korea|Brazil|Spain|France|Germany|Italy|UK|China)[^)]*)\\)/i);
        const region = regionMatch ? regionMatch[1] : undefined;
        
        // Check for bootleg/clone attributes
        const cloneofAttr = gameEl.getAttribute('cloneof');
        const commentEl = gameEl.querySelector('comment');
        const commentText = commentEl?.textContent?.toLowerCase() || '';
        
        // Determine category based on various markers
        let category = 'Commercial';
        const lowerDesc = description.toLowerCase();
        const lowerName = name.toLowerCase();
        
        // Check for bootleg in comment or description
        if (commentText.includes('bootleg') || lowerDesc.includes('bootleg')) {
          category = 'Pirate/Hack';
        } else if (lowerDesc.includes('(proto') || lowerName.includes('proto')) {
          category = 'Prototype';
        } else if (lowerDesc.includes('(beta') || lowerName.includes('beta')) {
          category = 'Beta';
        } else if (lowerDesc.includes('(demo') || lowerName.includes('demo')) {
          category = 'Demo';
        } else if (lowerDesc.includes('(sample') || lowerName.includes('sample')) {
          category = 'Sample';
        } else if (lowerDesc.includes('(pirate') || lowerName.includes('pirate') || 
                   lowerDesc.includes('(hack') || lowerName.includes('hack') ||
                   lowerDesc.includes('(unl)') || lowerName.includes('(unl)')) {
          category = 'Pirate/Hack';
        } else if (lowerDesc.includes('(homebrew)') || lowerName.includes('homebrew')) {
          category = 'Homebrew';
        }

        const romEl = gameEl.querySelector('rom');
        const rom = romEl ? {
          name: romEl.getAttribute('name') || name,
          size: romEl.getAttribute('size') || undefined,
          crc: romEl.getAttribute('crc') || undefined,
          md5: romEl.getAttribute('md5') || undefined,
          sha1: romEl.getAttribute('sha1') || undefined,
        } : { name };

        // Check for cloneof attribute (arcade DATs use this for revisions/regional variants)
        const cloneof = cloneofAttr ? cloneofAttr : undefined;
        const isParent = !cloneofAttr; // If no cloneof, it's a parent game

        return {
          name,
          description,
          region,
          rom,
          category,
          cloneof,
          isParent,
        };
      });

      return {
        name: filename,
        system: systemName,
        games,
      };
    } catch (err) {
      console.error(`Error parsing ${filename}:`, err);
      return null;
    }
  };

  const handleDirectorySelect = async () => {
    if (!window.electronAPI) {
      setError('Electron API not available. Please run as desktop app.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const fileData = await window.electronAPI.selectDatDirectory();
      
      if (!fileData || fileData.length === 0) {
        setIsLoading(false);
        return; // User canceled
      }

      const parsedFiles: DatFile[] = [];
      const totalFiles = fileData.length;

      for (let i = 0; i < fileData.length; i++) {
        const { name, content } = fileData[i];
        setUploadProgress({ current: i + 1, total: totalFiles, fileName: name });
        
        const parsed = parseDatFile(content, name);
        if (parsed && parsed.games.length > 0) {
          parsedFiles.push(parsed);
        }
      }

      if (parsedFiles.length === 0) {
        setError('No valid DAT files found in directory');
      } else {
        // Append to existing DAT files instead of replacing
        const existingNames = new Set(datFiles.map(f => f.name));
        const newFiles = parsedFiles.filter(f => !existingNames.has(f.name));
        onDatFilesLoaded([...datFiles, ...newFiles]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load DAT files');
    } finally {
      setIsLoading(false);
      setUploadProgress({ current: 0, total: 0, fileName: '' });
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
      const fileData = await window.electronAPI.selectDatFiles();
      
      if (!fileData || fileData.length === 0) {
        setIsLoading(false);
        return; // User canceled
      }

      const parsedFiles: DatFile[] = [];
      const totalFiles = fileData.length;

      for (let i = 0; i < fileData.length; i++) {
        const { name, content } = fileData[i];
        setUploadProgress({ current: i + 1, total: totalFiles, fileName: name });
        
        const parsed = parseDatFile(content, name);
        if (parsed && parsed.games.length > 0) {
          parsedFiles.push(parsed);
        }
      }

      if (parsedFiles.length === 0) {
        setError('No valid DAT files could be parsed');
      } else {
        // Append to existing DAT files instead of replacing
        const existingNames = new Set(datFiles.map(f => f.name));
        const newFiles = parsedFiles.filter(f => !existingNames.has(f.name));
        onDatFilesLoaded([...datFiles, ...newFiles]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load DAT files');
    } finally {
      setIsLoading(false);
      setUploadProgress({ current: 0, total: 0, fileName: '' });
    }
  };

  const removeDatFile = (index: number) => {
    const updated = datFiles.filter((_, i) => i !== index);
    onDatFilesLoaded(updated);
  };

  const totalGames = datFiles.reduce((sum, file) => sum + file.games.length, 0);

  return (
    <Card className="p-6 neon-card">
      <div className="space-y-4">
        <div className="flex gap-3">
          <Button
            onClick={handleDirectorySelect}
            disabled={isLoading}
            className="flex-1 neon-button"
            size="lg"
          >
            <FolderOpen className="mr-2 h-5 w-5" />
            {isLoading ? 'Loading...' : 'Select DAT Directory'}
          </Button>

          <Button
            onClick={handleFilesSelect}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            <FileText className="mr-2 h-5 w-5" />
            Select Individual Files
          </Button>
        </div>

        {isLoading && uploadProgress.total > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="stat-glow-cyan">Processing: {uploadProgress.fileName}</span>
              <span className="stat-glow-pink">{uploadProgress.current} / {uploadProgress.total}</span>
            </div>
            <Progress value={(uploadProgress.current / uploadProgress.total) * 100} />
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500 rounded-md">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {datFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 stat-glow-green" />
                <span className="font-semibold stat-glow-green">
                  {datFiles.length} DAT file{datFiles.length !== 1 ? 's' : ''} loaded
                </span>
                <Badge variant="outline" className="neon-badge" style={{ color: 'var(--neon-cyan)' }}>
                  {totalGames.toLocaleString()} total games
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
                {datFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-background/50 rounded-md border border-primary/20"
                  >
                    <div className="flex-1">
                      <div className="font-medium stat-glow-pink">{file.system}</div>
                      <div className="text-sm opacity-70">{file.name}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">
                        {file.games.length.toLocaleString()} games
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDatFile(index)}
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
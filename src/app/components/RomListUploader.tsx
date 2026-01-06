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
          // Try to find matching system from DAT files
          let matchedSystem = null;
          
          for (const datFile of datFiles) {
            const systemLower = datFile.system.toLowerCase();
            const nameLower = name.toLowerCase();
            
            if (nameLower.includes(systemLower) || systemLower.includes(nameLower.replace('.txt', ''))) {
              matchedSystem = datFile.system;
              break;
            }
          }
          
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
          // Try to find matching system from DAT files
          let matchedSystem = null;
          
          for (const datFile of datFiles) {
            const systemLower = datFile.system.toLowerCase();
            const nameLower = name.toLowerCase();
            
            if (nameLower.includes(systemLower) || systemLower.includes(nameLower.replace('.txt', ''))) {
              matchedSystem = datFile.system;
              break;
            }
          }
          
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
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={confirmAssignments}
                className="flex-1"
                disabled={!pendingAssignments.every(a => a.systemName)}
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

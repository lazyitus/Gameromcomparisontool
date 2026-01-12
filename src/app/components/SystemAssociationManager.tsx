import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Link2, AlertTriangle, Check, X, RefreshCw } from 'lucide-react';
import type { DatFile } from './DatFileUploader';
import type { RomList } from './RomListUploader';

interface SystemAssociationManagerProps {
  datFiles: DatFile[];
  romLists: RomList[];
  onUpdateAssociation: (datSystemName: string, romListSystemName: string) => void;
}

export function SystemAssociationManager({ datFiles, romLists, onUpdateAssociation }: SystemAssociationManagerProps) {
  const [editingSystem, setEditingSystem] = useState<string | null>(null);

  // Find which DAT files have matching ROM lists
  const getAssociationStatus = () => {
    const associations: {
      datFile: DatFile;
      matchedRomList: RomList | null;
      isAutoMatched: boolean;
    }[] = [];

    datFiles.forEach(datFile => {
      // Try to find a matching ROM list
      const matchedRomList = romLists.find(
        romList => romList.systemName.toLowerCase() === datFile.system.toLowerCase()
      );

      associations.push({
        datFile,
        matchedRomList: matchedRomList || null,
        isAutoMatched: !!matchedRomList,
      });
    });

    return associations;
  };

  const associations = getAssociationStatus();
  const unassociatedCount = associations.filter(a => !a.matchedRomList).length;

  if (datFiles.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 neon-card card-compact" style={{
      borderColor: unassociatedCount > 0 ? 'var(--neon-orange)' : 'var(--neon-cyan)',
      boxShadow: `0 0 10px ${unassociatedCount > 0 ? 'var(--neon-orange)' : 'var(--neon-cyan)'}`,
    }}>
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="size-5" style={{ color: 'var(--neon-cyan)' }} />
        <h3 className="font-medium text-lg max-[512px]:text-sm uppercase">
          DAT ↔ ROM Associations
        </h3>
        {unassociatedCount > 0 && (
          <Badge className="neon-badge ml-auto" style={{
            backgroundColor: 'var(--neon-orange)',
            boxShadow: '0 0 8px var(--neon-orange)'
          }}>
            {unassociatedCount} Unmatched
          </Badge>
        )}
      </div>

      {unassociatedCount > 0 && (
        <Alert className="mb-3" style={{
          backgroundColor: 'rgba(255, 136, 0, 0.1)',
          borderColor: 'var(--neon-orange)',
        }}>
          <AlertTriangle className="h-4 w-4" style={{ color: 'var(--neon-orange)' }} />
          <AlertDescription className="text-sm">
            <strong>{unassociatedCount}</strong> DAT {unassociatedCount === 1 ? 'file has' : 'files have'} no ROM list.
            Upload matching ROM lists or manually associate them below.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2 wantlist-list-spacing">
        {associations.map(({ datFile, matchedRomList, isAutoMatched }) => {
          const isEditing = editingSystem === datFile.system;

          return (
            <div
              key={datFile.system}
              className="p-3 rounded border"
              style={{
                backgroundColor: matchedRomList 
                  ? 'rgba(0, 255, 135, 0.05)' 
                  : 'rgba(255, 136, 0, 0.05)',
                borderColor: matchedRomList 
                  ? 'var(--neon-pink)' 
                  : 'var(--neon-orange)',
              }}
            >
              <div className="flex items-start gap-3">
                {/* Status Icon */}
                <div className="shrink-0 mt-1">
                  {matchedRomList ? (
                    <Check className="size-5" style={{ color: 'var(--neon-pink)' }} />
                  ) : (
                    <AlertTriangle className="size-5" style={{ color: 'var(--neon-orange)' }} />
                  )}
                </div>

                {/* DAT File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{datFile.system}</h4>
                    <Badge variant="outline" className="text-xs wantlist-game-badge">
                      DAT: {datFile.games.length} games
                    </Badge>
                  </div>

                  {/* Association Status or Editor */}
                  {isEditing ? (
                    <div className="space-y-2 mt-2">
                      <Select
                        value={matchedRomList?.systemName || ''}
                        onValueChange={(value) => {
                          if (value) {
                            onUpdateAssociation(datFile.system, value);
                            setEditingSystem(null);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a ROM list..." />
                        </SelectTrigger>
                        <SelectContent>
                          {romLists.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                              No ROM lists uploaded yet
                            </div>
                          ) : (
                            romLists.map(romList => (
                              <SelectItem key={romList.systemName} value={romList.systemName}>
                                {romList.systemName} ({romList.roms.length} ROMs)
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingSystem(null)}
                          className="text-xs"
                        >
                          <X className="size-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {matchedRomList ? (
                        <>
                          <span className="text-xs text-muted-foreground">
                            → <strong className="stat-glow-cyan">{matchedRomList.systemName}</strong> ({matchedRomList.roms.length} ROMs)
                          </span>
                          {isAutoMatched && (
                            <Badge variant="secondary" className="text-xs wantlist-game-badge">
                              Auto-matched
                            </Badge>
                          )}
                        </>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--neon-orange)' }}>
                          ⚠️ No ROM list associated
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Edit Button */}
                <div className="shrink-0">
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingSystem(datFile.system)}
                      className="h-8 px-2"
                    >
                      <RefreshCw className="size-3.5" />
                      <span className="ml-1 text-xs max-[512px]:hidden">
                        {matchedRomList ? 'Change' : 'Connect'}
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {associations.length > 0 && (
        <p className="text-xs text-muted-foreground mt-3 help-text">
          💡 DAT files need ROM lists to compare your collection. Click "Connect" to manually associate them.
        </p>
      )}
    </Card>
  );
}

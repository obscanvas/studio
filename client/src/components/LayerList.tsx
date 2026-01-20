/**
 * LayerList Component
 * Cyberpunk Control Room - Katman Listesi Paneli
 * 
 * OBS benzeri katman yönetimi: sıralama, görünürlük, seçim
 */

import React, { useCallback } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Layer } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Eye,
  EyeOff,
  Trash2,
  Copy,
  GripVertical,
  Image,
  Film,
  FileImage,
  ChevronUp,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayerListProps {
  onAddLayer?: () => void;
}

export function LayerList({ onAddLayer }: LayerListProps) {
  const {
    config,
    selectedLayerId,
    setSelectedLayerId,
    updateLayerFilters,
    removeLayer,
    duplicateLayer,
    reorderLayers,
  } = useProject();

  // Katmanları zIndex'e göre ters sırala (en üstteki en üstte görünsün)
  const sortedLayers = [...config.layers].sort((a, b) => b.zIndex - a.zIndex);

  const getMediaIcon = (type: Layer['type']) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'gif':
        return <FileImage className="w-4 h-4" />;
      case 'video':
        return <Film className="w-4 h-4" />;
      default:
        return <Image className="w-4 h-4" />;
    }
  };

  const handleVisibilityToggle = useCallback((layerId: string, currentVisible: boolean) => {
    updateLayerFilters(layerId, { visible: !currentVisible });
  }, [updateLayerFilters]);

  const handleMoveUp = useCallback((index: number) => {
    if (index > 0) {
      // Görsel listede yukarı = zIndex artır
      const actualIndex = config.layers.findIndex(l => l.id === sortedLayers[index].id);
      const targetIndex = config.layers.findIndex(l => l.id === sortedLayers[index - 1].id);
      reorderLayers(actualIndex, targetIndex);
    }
  }, [config.layers, sortedLayers, reorderLayers]);

  const handleMoveDown = useCallback((index: number) => {
    if (index < sortedLayers.length - 1) {
      // Görsel listede aşağı = zIndex azalt
      const actualIndex = config.layers.findIndex(l => l.id === sortedLayers[index].id);
      const targetIndex = config.layers.findIndex(l => l.id === sortedLayers[index + 1].id);
      reorderLayers(actualIndex, targetIndex);
    }
  }, [config.layers, sortedLayers, reorderLayers]);

  return (
    <div className="cyber-panel h-full flex flex-col">
      {/* Panel Başlığı */}
      <div className="p-3 border-b border-primary/30 flex items-center justify-between">
        <h2 className="font-display text-sm uppercase tracking-wider text-primary">
          Katmanlar
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddLayer}
          className="h-7 px-2 text-primary hover:bg-primary/20 hover:text-primary"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span className="text-xs">Ekle</span>
        </Button>
      </div>

      {/* Katman Listesi */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sortedLayers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Henüz katman yok</p>
              <p className="text-xs mt-1">Medya eklemek için + butonuna tıklayın</p>
            </div>
          ) : (
            sortedLayers.map((layer, index) => (
              <div
                key={layer.id}
                onClick={() => setSelectedLayerId(layer.id)}
                className={cn(
                  'group relative p-2 rounded cursor-pointer transition-all duration-200',
                  'border border-transparent',
                  'hover:border-primary/50 hover:bg-primary/5',
                  selectedLayerId === layer.id && 'border-primary bg-primary/10',
                  !layer.filters.visible && 'opacity-50'
                )}
              >
                <div className="flex items-center gap-2">
                  {/* Sürükleme Tutacağı */}
                  <div className="text-muted-foreground cursor-grab">
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Medya İkonu */}
                  <div className={cn(
                    'w-8 h-8 rounded flex items-center justify-center',
                    'bg-secondary text-primary'
                  )}>
                    {getMediaIcon(layer.type)}
                  </div>

                  {/* Katman Bilgisi */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{layer.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {layer.type} • z:{layer.zIndex}
                    </p>
                  </div>

                  {/* Aksiyon Butonları */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Yukarı Taşı */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveUp(index);
                      }}
                      disabled={index === 0}
                    >
                      <ChevronUp className="w-3 h-3" />
                    </Button>

                    {/* Aşağı Taşı */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveDown(index);
                      }}
                      disabled={index === sortedLayers.length - 1}
                    >
                      <ChevronDown className="w-3 h-3" />
                    </Button>

                    {/* Görünürlük */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVisibilityToggle(layer.id, layer.filters.visible);
                      }}
                    >
                      {layer.filters.visible ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                    </Button>

                    {/* Kopyala */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateLayer(layer.id);
                      }}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>

                    {/* Sil */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLayer(layer.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Seçili Katman Göstergesi */}
                {selectedLayerId === layer.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r" />
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Alt Bilgi */}
      <div className="p-2 border-t border-primary/30 text-xs text-muted-foreground text-center font-tech">
        {config.layers.length} KATMAN
      </div>
    </div>
  );
}

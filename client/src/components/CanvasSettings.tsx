/**
 * CanvasSettings Component
 * Cyberpunk Control Room - Tuval Ayarları Paneli
 * 
 * Tuval boyutu, arka plan rengi ve preset seçimi
 */

import React, { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { CANVAS_PRESETS, CanvasSize } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Settings, Monitor, Palette } from 'lucide-react';

export function CanvasSettings() {
  const { config, setCanvasSize, setBackgroundColor, setProjectName } = useProject();
  const [customWidth, setCustomWidth] = useState(config.canvasSize.width.toString());
  const [customHeight, setCustomHeight] = useState(config.canvasSize.height.toString());
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetChange = (presetName: string) => {
    const preset = CANVAS_PRESETS.find(p => p.name === presetName);
    if (preset) {
      setCanvasSize(preset.size);
      setCustomWidth(preset.size.width.toString());
      setCustomHeight(preset.size.height.toString());
    }
  };

  const handleCustomSizeApply = () => {
    const width = parseInt(customWidth) || 1920;
    const height = parseInt(customHeight) || 1080;
    setCanvasSize({ width, height });
  };

  const getCurrentPresetName = () => {
    const preset = CANVAS_PRESETS.find(
      p => p.size.width === config.canvasSize.width && p.size.height === config.canvasSize.height
    );
    return preset?.name || 'Özel';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="border-primary/30 hover:border-primary hover:bg-primary/10"
        >
          <Settings className="w-4 h-4 mr-2" />
          Tuval Ayarları
        </Button>
      </DialogTrigger>
      <DialogContent className="cyber-panel bg-card border-primary/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-primary flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Tuval Ayarları
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Tuval boyutunu ve arka plan rengini ayarlayın
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Proje Adı */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Proje Adı
            </Label>
            <Input
              value={config.name}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-secondary border-primary/30 focus:border-primary"
              placeholder="Proje adı girin"
            />
          </div>

          {/* Preset Seçimi */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Boyut Preset
            </Label>
            <Select value={getCurrentPresetName()} onValueChange={handlePresetChange}>
              <SelectTrigger className="bg-secondary border-primary/30 focus:border-primary">
                <SelectValue placeholder="Preset seçin" />
              </SelectTrigger>
              <SelectContent className="bg-card border-primary/30">
                {CANVAS_PRESETS.map((preset) => (
                  <SelectItem 
                    key={preset.name} 
                    value={preset.name}
                    className="focus:bg-primary/20"
                  >
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Özel Boyut */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Özel Boyut (piksel)
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                className="bg-secondary border-primary/30 focus:border-primary font-tech"
                placeholder="Genişlik"
              />
              <span className="text-muted-foreground">×</span>
              <Input
                type="number"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                className="bg-secondary border-primary/30 focus:border-primary font-tech"
                placeholder="Yükseklik"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCustomSizeApply}
                className="border-primary/30 hover:border-primary hover:bg-primary/10"
              >
                Uygula
              </Button>
            </div>
          </div>

          {/* Arka Plan Rengi */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Arka Plan Rengi
            </Label>
            <div className="flex gap-2 items-center">
              <div 
                className="w-10 h-10 rounded border border-primary/30"
                style={{ backgroundColor: config.backgroundColor }}
              />
              <Input
                type="color"
                value={config.backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-20 h-10 p-1 bg-secondary border-primary/30 cursor-pointer"
              />
              <Input
                type="text"
                value={config.backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1 bg-secondary border-primary/30 focus:border-primary font-tech uppercase"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Mevcut Ayarlar Özeti */}
          <div className="p-3 bg-secondary/50 rounded border border-primary/20">
            <p className="text-xs text-muted-foreground mb-2">Mevcut Ayarlar</p>
            <div className="grid grid-cols-2 gap-2 text-sm font-tech">
              <div>
                <span className="text-muted-foreground">Boyut:</span>{' '}
                <span className="text-primary">{config.canvasSize.width}×{config.canvasSize.height}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Arka Plan:</span>{' '}
                <span className="text-primary">{config.backgroundColor}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

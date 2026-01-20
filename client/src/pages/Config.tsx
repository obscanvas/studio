/**
 * Config Page
 * Cyberpunk Control Room - Yapılandırma Sayfası
 * 
 * Katman yönetimi, filtre ayarları, tuval yapılandırması
 * Sol: Katman listesi | Orta: Önizleme | Sağ: Özellikler
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { ProjectProvider, useProject } from '@/contexts/ProjectContext';
import { LayerList } from '@/components/LayerList';
import { FilterPanel } from '@/components/FilterPanel';
import { CanvasPreview } from '@/components/CanvasPreview';
import { CanvasSettings } from '@/components/CanvasSettings';
import { AddMediaDialog } from '@/components/AddMediaDialog';
import { ConfigActions } from '@/components/ConfigActions';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Layers,
  Play,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  Maximize,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

function ConfigContent() {
  const { config } = useProject();
  const [isAddMediaOpen, setIsAddMediaOpen] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.5);
  const [showGrid, setShowGrid] = useState(false);

  // Tuval boyutuna göre otomatik ölçek hesapla
  const calculateAutoScale = useCallback(() => {
    // Önizleme alanı yaklaşık 800x600 varsayalım
    const maxWidth = 800;
    const maxHeight = 500;
    const scaleX = maxWidth / config.canvasSize.width;
    const scaleY = maxHeight / config.canvasSize.height;
    return Math.min(scaleX, scaleY, 1);
  }, [config.canvasSize]);

  useEffect(() => {
    setPreviewScale(calculateAutoScale());
  }, [calculateAutoScale]);

  const handleZoomIn = () => {
    setPreviewScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setPreviewScale(prev => Math.max(prev - 0.1, 0.1));
  };

  const handleFitToScreen = () => {
    setPreviewScale(calculateAutoScale());
  };

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Header */}
      <header className="h-14 border-b border-primary/30 bg-card/80 backdrop-blur-sm flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            <h1 className="font-display text-lg tracking-wider text-primary">
              OBS WEB STUDIO
            </h1>
          </div>
          <span className="text-xs font-tech text-muted-foreground px-2 py-1 bg-secondary rounded">
            CONFIG
          </span>
        </div>

        <div className="flex items-center gap-3">
          <CanvasSettings />
          <ConfigActions />
          <Link href="/docs">
            <Button 
              variant="outline"
              size="sm"
              className="border-primary/30 hover:border-primary hover:bg-primary/10"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Docs
            </Button>
          </Link>
          <Link href="/">
            <Button 
              variant="default"
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Play className="w-4 h-4 mr-2" />
              Ana Sayfayı Aç
              <ExternalLink className="w-3 h-3 ml-2" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Sol Panel - Katman Listesi */}
        <aside className="w-72 border-r border-primary/30 bg-card/50">
          <LayerList onAddLayer={() => setIsAddMediaOpen(true)} />
        </aside>

        {/* Orta Alan - Önizleme */}
        <main className="flex-1 flex flex-col">
          {/* Önizleme Toolbar */}
          <div className="h-12 border-b border-primary/30 bg-card/30 flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-tech text-muted-foreground">
                {config.name}
              </span>
              <span className="text-xs font-tech text-primary">
                {config.canvasSize.width} × {config.canvasSize.height}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Grid Toggle */}
              <div className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-muted-foreground" />
                <Switch
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                
                <div className="w-24">
                  <Slider
                    value={[previewScale]}
                    min={0.1}
                    max={2}
                    step={0.05}
                    onValueChange={([v]) => setPreviewScale(v)}
                    className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                  />
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFitToScreen}
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                >
                  <Maximize className="w-4 h-4" />
                </Button>

                <span className="text-xs font-tech text-muted-foreground w-12 text-right">
                  {Math.round(previewScale * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Önizleme Alanı */}
          <div className="flex-1 overflow-auto bg-background/50 scan-lines">
            <CanvasPreview 
              scale={previewScale} 
              showBorder={true}
              showGrid={showGrid}
            />
          </div>

          {/* Alt Bilgi Bar */}
          <div className="h-8 border-t border-primary/30 bg-card/30 flex items-center justify-between px-4 text-xs font-tech text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Katman: {config.layers.length}</span>
              <span>|</span>
              <span>Son Güncelleme: {new Date(config.lastModified).toLocaleString('tr-TR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Otomatik Kayıt Aktif</span>
            </div>
          </div>
        </main>

        {/* Sağ Panel - Özellikler */}
        <aside className="w-80 border-l border-primary/30 bg-card/50">
          <FilterPanel />
        </aside>
      </div>

      {/* Medya Ekleme Dialog */}
      <AddMediaDialog 
        open={isAddMediaOpen} 
        onOpenChange={setIsAddMediaOpen} 
      />
    </div>
  );
}

export default function Config() {
  return (
    <ProjectProvider>
      <ConfigContent />
    </ProjectProvider>
  );
}

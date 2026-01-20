import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  ProjectConfig,
  Layer,
  LayerFilters,
  CanvasSize,
  DEFAULT_PROJECT_CONFIG,
  DEFAULT_FILTERS,
  createNewLayer,
  MediaType,
} from '@/types';

// Local Storage Key
const STORAGE_KEY = 'obs-web-studio-config';

interface ProjectContextType {
  // Proje durumu
  config: ProjectConfig;
  
  // Katman işlemleri
  addLayer: (name: string, type: MediaType, source: string) => void;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, updates: Partial<Layer>) => void;
  updateLayerFilters: (layerId: string, filters: Partial<LayerFilters>) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  duplicateLayer: (layerId: string) => void;
  
  // Seçili katman
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  selectedLayer: Layer | null;
  
  // Tuval işlemleri
  setCanvasSize: (size: CanvasSize) => void;
  setBackgroundColor: (color: string) => void;
  
  // Proje işlemleri
  setProjectName: (name: string) => void;
  saveConfig: () => void;
  loadConfig: () => void;
  resetConfig: () => void;
  exportConfig: () => string;
  importConfig: (jsonString: string) => boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ProjectConfig>(() => {
    // İlk yüklemede localStorage'dan oku
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return DEFAULT_PROJECT_CONFIG;
        }
      }
    }
    return DEFAULT_PROJECT_CONFIG;
  });
  
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  
  // Seçili katmanı hesapla
  const selectedLayer = config.layers.find(l => l.id === selectedLayerId) || null;
  
  // Config değiştiğinde otomatik kaydet
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);
  
  // Katman ekleme
  const addLayer = useCallback((name: string, type: MediaType, source: string) => {
    const maxZIndex = config.layers.length > 0 
      ? Math.max(...config.layers.map(l => l.zIndex)) 
      : 0;
    
    const newLayer = createNewLayer(name, type, source, maxZIndex + 1);
    
    setConfig(prev => ({
      ...prev,
      layers: [...prev.layers, newLayer],
      lastModified: new Date().toISOString(),
    }));
    
    setSelectedLayerId(newLayer.id);
  }, [config.layers]);
  
  // Katman silme
  const removeLayer = useCallback((layerId: string) => {
    setConfig(prev => ({
      ...prev,
      layers: prev.layers.filter(l => l.id !== layerId),
      lastModified: new Date().toISOString(),
    }));
    
    if (selectedLayerId === layerId) {
      setSelectedLayerId(null);
    }
  }, [selectedLayerId]);
  
  // Katman güncelleme
  const updateLayer = useCallback((layerId: string, updates: Partial<Layer>) => {
    setConfig(prev => ({
      ...prev,
      layers: prev.layers.map(l => 
        l.id === layerId 
          ? { ...l, ...updates, updatedAt: new Date().toISOString() }
          : l
      ),
      lastModified: new Date().toISOString(),
    }));
  }, []);
  
  // Katman filtrelerini güncelleme
  const updateLayerFilters = useCallback((layerId: string, filters: Partial<LayerFilters>) => {
    setConfig(prev => ({
      ...prev,
      layers: prev.layers.map(l => 
        l.id === layerId 
          ? { 
              ...l, 
              filters: { ...l.filters, ...filters },
              updatedAt: new Date().toISOString() 
            }
          : l
      ),
      lastModified: new Date().toISOString(),
    }));
  }, []);
  
  // Katman sıralama
  const reorderLayers = useCallback((fromIndex: number, toIndex: number) => {
    setConfig(prev => {
      const newLayers = [...prev.layers];
      const [removed] = newLayers.splice(fromIndex, 1);
      newLayers.splice(toIndex, 0, removed);
      
      // zIndex'leri yeniden ata
      const reindexed = newLayers.map((layer, index) => ({
        ...layer,
        zIndex: index + 1,
      }));
      
      return {
        ...prev,
        layers: reindexed,
        lastModified: new Date().toISOString(),
      };
    });
  }, []);
  
  // Katman kopyalama
  const duplicateLayer = useCallback((layerId: string) => {
    const layer = config.layers.find(l => l.id === layerId);
    if (!layer) return;
    
    const maxZIndex = Math.max(...config.layers.map(l => l.zIndex));
    const newLayer = createNewLayer(
      `${layer.name} (Kopya)`,
      layer.type,
      layer.source,
      maxZIndex + 1
    );
    newLayer.filters = { ...layer.filters };
    
    setConfig(prev => ({
      ...prev,
      layers: [...prev.layers, newLayer],
      lastModified: new Date().toISOString(),
    }));
    
    setSelectedLayerId(newLayer.id);
  }, [config.layers]);
  
  // Tuval boyutu ayarlama
  const setCanvasSize = useCallback((size: CanvasSize) => {
    setConfig(prev => ({
      ...prev,
      canvasSize: size,
      lastModified: new Date().toISOString(),
    }));
  }, []);
  
  // Arka plan rengi ayarlama
  const setBackgroundColor = useCallback((color: string) => {
    setConfig(prev => ({
      ...prev,
      backgroundColor: color,
      lastModified: new Date().toISOString(),
    }));
  }, []);
  
  // Proje adı ayarlama
  const setProjectName = useCallback((name: string) => {
    setConfig(prev => ({
      ...prev,
      name,
      lastModified: new Date().toISOString(),
    }));
  }, []);
  
  // Yapılandırmayı kaydet
  const saveConfig = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);
  
  // Yapılandırmayı yükle
  const loadConfig = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch {
        console.error('Yapılandırma yüklenemedi');
      }
    }
  }, []);
  
  // Yapılandırmayı sıfırla
  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_PROJECT_CONFIG);
    setSelectedLayerId(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);
  
  // JSON olarak dışa aktar
  const exportConfig = useCallback(() => {
    return JSON.stringify(config, null, 2);
  }, [config]);
  
  // JSON'dan içe aktar
  const importConfig = useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      // Temel doğrulama
      if (parsed.canvasSize && parsed.layers && Array.isArray(parsed.layers)) {
        setConfig({
          ...DEFAULT_PROJECT_CONFIG,
          ...parsed,
          lastModified: new Date().toISOString(),
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);
  
  const value: ProjectContextType = {
    config,
    addLayer,
    removeLayer,
    updateLayer,
    updateLayerFilters,
    reorderLayers,
    duplicateLayer,
    selectedLayerId,
    setSelectedLayerId,
    selectedLayer,
    setCanvasSize,
    setBackgroundColor,
    setProjectName,
    saveConfig,
    loadConfig,
    resetConfig,
    exportConfig,
    importConfig,
  };
  
  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}

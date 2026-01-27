/**
 * FilterPanel Component
 * Cyberpunk Control Room - Katman Filtre/Özellik Paneli
 * 
 * OBS benzeri filtre kontrolleri: opacity, offset, scale, rotation, vb.
 */

import React from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { DEFAULT_FILTERS } from '@/types';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  RotateCcw,
  Move,
  Maximize2,
  RotateCw,
  Sun,
  Contrast,
  Droplets,
  CircleDot,
  FlipHorizontal,
  FlipVertical,
  Palette,
  Eye,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// Sayısal giriş bileşeni - Yazarken state güncellemelerinin araya girmesini engeller
function NumberInput({
  value,
  onChange,
  className,
  ...props
}: {
  value: number;
  onChange: (val: number) => void;
  className?: string;
  step?: string;
  placeholder?: string;
}) {
  const [localValue, setLocalValue] = React.useState(value.toString());

  // Dışarıdan gelen değer değişirse local state'i güncelle (farklıysa)
  React.useEffect(() => {
    if (parseFloat(localValue) !== value) {
      setLocalValue(value.toString());
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setLocalValue(newVal);

    // Sadece geçerli bir sayı ise ve sonu nokta ile bitmiyorsa güncellemeyi gönder
    if (newVal === '' || newVal === '-') return;

    const num = parseFloat(newVal);
    if (!isNaN(num) && !newVal.endsWith('.')) {
      onChange(num);
    }
  };

  const handleBlur = () => {
    if (localValue === '' || localValue === '-' || isNaN(parseFloat(localValue))) {
      onChange(0);
      setLocalValue('0');
    } else {
      const parsed = parseFloat(localValue);
      onChange(parsed);
      setLocalValue(parsed.toString());
    }
  };

  return (
    <Input
      type="text"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      {...props}
    />
  );
}

// Filtre Slider bileşeni - Performans için dışarıda tanımlandı
interface FilterSliderProps {
  icon: React.ElementType;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}

const FilterSlider = React.memo(({
  icon: Icon,
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  disabled = false,
  onChange,
}: FilterSliderProps) => (
  <div className={`space-y-2 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        <Icon className="w-4 h-4 text-primary" />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <NumberInput
          value={value}
          onChange={onChange}
          className="w-16 h-7 text-right font-tech text-xs bg-secondary/50 border-primary/20"
        />
        <span className="text-[10px] font-tech text-muted-foreground w-4">
          {unit}
        </span>
      </div>
    </div>
    <Slider
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={([v]) => onChange(v)}
      className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_.relative]:bg-secondary [&_[data-orientation=horizontal]>[data-orientation=horizontal]]:bg-primary"
    />
  </div>
));

// Unity-like Filtre Section Bileşeni
interface FilterSectionProps {
  id: string;
  label: string;
  icon: React.ElementType;
  isPermanent?: boolean;
  isEnabled: boolean;
  onToggle?: (enabled: boolean) => void;
  onRemove?: () => void;
  children: React.ReactNode;
}

const FilterSection = ({
  id,
  label,
  icon: Icon,
  isPermanent = false,
  isEnabled,
  onToggle,
  onRemove,
  children,
}: FilterSectionProps) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border border-primary/20 bg-card/20 rounded shadow-sm overflow-hidden"
    >
      <div className={`flex items-center gap-2 px-3 py-2 bg-secondary/30 ${!isEnabled ? 'opacity-60' : ''}`}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="h-5 w-5 p-0 hover:bg-primary/20">
            {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        </CollapsibleTrigger>

        <Icon className={`w-4 h-4 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
        <span className="flex-1 text-xs font-display uppercase tracking-wider truncate">
          {label}
        </span>

        <div className="flex items-center gap-2">
          {!isPermanent && (
            <Switch
              size="sm"
              checked={isEnabled}
              onCheckedChange={onToggle}
              className="scale-75 h-4"
            />
          )}
          {!isPermanent && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <CollapsibleContent>
        <div className={`p-4 space-y-4 border-t border-primary/10 ${!isEnabled ? 'bg-black/20 italic' : ''}`}>
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export function FilterPanel() {
  const { selectedLayer, updateLayerFilters, updateLayer } = useProject();

  if (!selectedLayer) {
    return (
      <div className="cyber-panel h-full flex flex-col">
        <div className="p-3 border-b border-primary/30">
          <h2 className="font-display text-sm uppercase tracking-wider text-primary">
            Özellikler
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Palette className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Katman seçilmedi</p>
            <p className="text-xs mt-1">Düzenlemek için bir katman seçin</p>
          </div>
        </div>
      </div>
    );
  }

  const filters = selectedLayer.filters;
  const activeFilters = filters.activeFilters || [];
  const disabledFilters = filters.disabledFilters || [];

  const handleFilterChange = (key: string, value: any) => {
    updateLayerFilters(selectedLayer.id, { [key]: value });
  };

  const toggleFilter = (filterId: string, enabled: boolean) => {
    let newDisabled = [...disabledFilters];
    if (enabled) {
      newDisabled = newDisabled.filter(id => id !== filterId);
    } else {
      if (!newDisabled.includes(filterId)) newDisabled.push(filterId);
    }
    updateLayerFilters(selectedLayer.id, { disabledFilters: newDisabled });
  };

  const addFilter = (filterId: string) => {
    if (!activeFilters.includes(filterId)) {
      updateLayerFilters(selectedLayer.id, {
        activeFilters: [...activeFilters, filterId]
      });
    }
  };

  const removeFilter = (filterId: string) => {
    updateLayerFilters(selectedLayer.id, {
      activeFilters: activeFilters.filter(id => id !== filterId),
      disabledFilters: disabledFilters.filter(id => id !== filterId)
    });
  };

  const AVAILABLE_OPTIONS = [
    { id: 'hueRotate', label: 'Renk Tonu', icon: Palette },
    { id: 'colorAdjust', label: 'Renk Ayarı', icon: Sun },
    { id: 'blur', label: 'Bulanıklık', icon: CircleDot },
    { id: 'uvScroll', label: 'UV Kaydırma', icon: Move },
  ];

  return (
    <div className="cyber-panel h-full flex flex-col overflow-hidden max-h-[calc(100vh-3.5rem)]">
      {/* Panel Başlığı */}
      <div className="p-3 border-b border-primary/30 flex items-center justify-between shrink-0">
        <h2 className="font-display text-sm uppercase tracking-wider text-primary">
          Özellikler
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 border-primary/30 text-primary hover:bg-primary/20"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span className="text-xs">Filtre Ekle</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card/95 border-primary/30 backdrop-blur-sm">
            {AVAILABLE_OPTIONS.map(opt => (
              <DropdownMenuItem
                key={opt.id}
                onClick={() => addFilter(opt.id)}
                disabled={activeFilters.includes(opt.id)}
                className="flex items-center gap-2 cursor-pointer hover:bg-primary/20"
              >
                <opt.icon className="w-4 h-4 text-primary" />
                <span className="text-xs">{opt.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Katman Temel Ayarları */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Katman İsmi
              </Label>
              <Input
                value={selectedLayer.name}
                onChange={(e) => updateLayer(selectedLayer.id, { name: e.target.value })}
                className="bg-secondary/50 border-primary/20 focus:border-primary h-8 text-xs font-tech"
              />
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <span className="text-xs font-display">GÖRÜNÜR</span>
              </div>
              <Switch
                checked={filters.visible}
                onCheckedChange={(v) => handleFilterChange('visible', v)}
              />
            </div>
          </div>

          <Separator className="bg-primary/20" />

          {/* Transform Section - Permanent */}
          <FilterSection
            id="transform"
            label="Dönüşüm (Transform)"
            icon={Maximize2}
            isPermanent={true}
            isEnabled={true}
          >
            <FilterSlider
              icon={Eye}
              label="Opaklık"
              value={filters.opacity}
              min={0}
              max={100}
              unit="%"
              onChange={(v) => handleFilterChange('opacity', v)}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">X KONUM</Label>
                <NumberInput
                  value={filters.offsetX}
                  onChange={(v) => handleFilterChange('offsetX', v)}
                  className="bg-secondary/50 border-primary/20 h-7 text-xs font-tech text-right"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Y KONUM</Label>
                <NumberInput
                  value={filters.offsetY}
                  onChange={(v) => handleFilterChange('offsetY', v)}
                  className="bg-secondary/50 border-primary/20 h-7 text-xs font-tech text-right"
                />
              </div>
            </div>

            <FilterSlider
              icon={Maximize2}
              label="Ölçek"
              value={filters.scale}
              min={0.1}
              max={3}
              step={0.1}
              unit="x"
              onChange={(v) => handleFilterChange('scale', v)}
            />

            <FilterSlider
              icon={RotateCw}
              label="Döndürme"
              value={filters.rotation}
              min={0}
              max={360}
              unit="°"
              onChange={(v) => handleFilterChange('rotation', v)}
            />

            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-2">
                <FlipHorizontal className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px]">YATAY</span>
                <Switch
                  checked={filters.flipX}
                  onCheckedChange={(v) => handleFilterChange('flipX', v)}
                  className="scale-75"
                />
              </div>
              <div className="flex items-center gap-2">
                <FlipVertical className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px]">DİKEY</span>
                <Switch
                  checked={filters.flipY}
                  onCheckedChange={(v) => handleFilterChange('flipY', v)}
                  className="scale-75"
                />
              </div>
            </div>
          </FilterSection>

          {/* DYNAMIC FILTERS */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-display text-muted-foreground tracking-widest uppercase px-1">
              Eklenmiş Filtreler
            </h3>

            {activeFilters.length === 0 && (
              <div className="text-center py-6 border border-dashed border-primary/10 rounded bg-card/10">
                <p className="text-[10px] text-muted-foreground italic">Henüz filtre eklenmedi</p>
                <p className="text-[9px] text-primary/40">Yukarıdaki "+" butonunu kullanın</p>
              </div>
            )}

            {activeFilters.includes('hueRotate') && (
              <FilterSection
                id="hueRotate"
                label="Renk Tonu Kaydırma"
                icon={Palette}
                isEnabled={!disabledFilters.includes('hueRotate')}
                onToggle={(v) => toggleFilter('hueRotate', v)}
                onRemove={() => removeFilter('hueRotate')}
              >
                <FilterSlider
                  icon={Palette}
                  label="Ton"
                  value={filters.hueRotate}
                  min={0}
                  max={360}
                  unit="°"
                  disabled={disabledFilters.includes('hueRotate')}
                  onChange={(v) => handleFilterChange('hueRotate', v)}
                />
              </FilterSection>
            )}

            {activeFilters.includes('colorAdjust') && (
              <FilterSection
                id="colorAdjust"
                label="Renk Ayarları"
                icon={Sun}
                isEnabled={!disabledFilters.includes('colorAdjust')}
                onToggle={(v) => toggleFilter('colorAdjust', v)}
                onRemove={() => removeFilter('colorAdjust')}
              >
                <FilterSlider
                  icon={Sun}
                  label="Parlaklık"
                  value={filters.brightness}
                  min={0}
                  max={200}
                  unit="%"
                  disabled={disabledFilters.includes('colorAdjust')}
                  onChange={(v) => handleFilterChange('brightness', v)}
                />
                <FilterSlider
                  icon={Contrast}
                  label="Kontrast"
                  value={filters.contrast}
                  min={0}
                  max={200}
                  unit="%"
                  disabled={disabledFilters.includes('colorAdjust')}
                  onChange={(v) => handleFilterChange('contrast', v)}
                />
                <FilterSlider
                  icon={Droplets}
                  label="Doygunluk"
                  value={filters.saturate}
                  min={0}
                  max={200}
                  unit="%"
                  disabled={disabledFilters.includes('colorAdjust')}
                  onChange={(v) => handleFilterChange('saturate', v)}
                />
              </FilterSection>
            )}

            {activeFilters.includes('blur') && (
              <FilterSection
                id="blur"
                label="Bulanıklık"
                icon={CircleDot}
                isEnabled={!disabledFilters.includes('blur')}
                onToggle={(v) => toggleFilter('blur', v)}
                onRemove={() => removeFilter('blur')}
              >
                <FilterSlider
                  icon={CircleDot}
                  label="Yarıçap"
                  value={filters.blur}
                  min={0}
                  max={20}
                  unit="px"
                  disabled={disabledFilters.includes('blur')}
                  onChange={(v) => handleFilterChange('blur', v)}
                />
              </FilterSection>
            )}

            {activeFilters.includes('uvScroll') && (
              <FilterSection
                id="uvScroll"
                label="UV Kaydırma (Efect)"
                icon={Move}
                isEnabled={!disabledFilters.includes('uvScroll')}
                onToggle={(v) => toggleFilter('uvScroll', v)}
                onRemove={() => removeFilter('uvScroll')}
              >
                <FilterSlider
                  icon={Move}
                  label="Yatay Hız"
                  value={filters.uvScrollX}
                  min={-10}
                  max={10}
                  step={0.1}
                  disabled={disabledFilters.includes('uvScroll')}
                  onChange={(v) => handleFilterChange('uvScrollX', v)}
                />
                <FilterSlider
                  icon={Move}
                  label="Dikey Hız"
                  value={filters.uvScrollY}
                  min={-10}
                  max={10}
                  step={0.1}
                  disabled={disabledFilters.includes('uvScroll')}
                  onChange={(v) => handleFilterChange('uvScrollY', v)}
                />
              </FilterSection>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Alt Bilgi */}
      <div className="p-2 border-t border-primary/30 text-[10px] text-muted-foreground text-center font-tech shrink-0 bg-background/50">
        {selectedLayer.type.toUpperCase()} • {selectedLayer.id.slice(-8)}
      </div>
    </div>
  );
}

/**
 * Docs Page - Etkileşimli Dokümantasyon Sayfası
 * Cyberpunk Control Room - Kullanım Kılavuzu ve Özellik Tanıtımı
 * 
 * Verileri daha sezgisel keşfetme, trendleri anlama, kolay kaydetme/paylaşma
 */

import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Layers,
  Settings,
  Play,
  Image,
  Film,
  FileImage,
  Palette,
  Move,
  RotateCw,
  Sun,
  Eye,
  Download,
  Upload,
  Monitor,
  Grid3X3,
  Zap,
  BookOpen,
  Rocket,
  ChevronRight,
  ExternalLink,
  Check,
  Copy,
  Terminal,
} from 'lucide-react';
import { toast } from 'sonner';

// Özellik kartı bileşeni
function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  color = 'primary' 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  color?: 'primary' | 'accent' | 'green';
}) {
  const colorClasses = {
    primary: 'text-primary border-primary/30 hover:border-primary/60',
    accent: 'text-accent border-accent/30 hover:border-accent/60',
    green: 'text-green-400 border-green-400/30 hover:border-green-400/60',
  };

  return (
    <Card className={`cyber-panel bg-card/50 ${colorClasses[color]} transition-all duration-300 hover:scale-[1.02]`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded bg-${color}/10`}>
            <Icon className="w-5 h-5" />
          </div>
          <CardTitle className="text-base font-display">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-muted-foreground text-sm">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

// Adım kartı bileşeni
function StepCard({ 
  number, 
  title, 
  description 
}: { 
  number: number; 
  title: string; 
  description: string;
}) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary flex items-center justify-center font-display text-primary flex-shrink-0">
        {number}
      </div>
      <div>
        <h4 className="font-medium text-foreground mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// Kod bloğu bileşeni
function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Kod panoya kopyalandı');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-secondary/50 border border-primary/20 rounded-lg p-4 overflow-x-auto font-mono text-sm">
        <code className="text-foreground">{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </Button>
    </div>
  );
}

// Filtre tablosu
function FilterTable() {
  const filters = [
    { name: 'Opaklık', range: '0-100%', description: 'Katmanın saydamlığını ayarlar' },
    { name: 'Konum X/Y', range: '±∞ px', description: 'Katmanı yatay/dikey kaydırır' },
    { name: 'Ölçek', range: '0.1x-3x', description: 'Katmanı büyütür veya küçültür' },
    { name: 'Döndürme', range: '0-360°', description: 'Katmanı döndürür' },
    { name: 'Renk Tonu', range: '0-360°', description: 'Renk spektrumunda kaydırır' },
    { name: 'Parlaklık', range: '0-200%', description: 'Aydınlık seviyesini ayarlar' },
    { name: 'Kontrast', range: '0-200%', description: 'Açık/koyu farkını ayarlar' },
    { name: 'Doygunluk', range: '0-200%', description: 'Renk yoğunluğunu ayarlar' },
    { name: 'Bulanıklık', range: '0-20px', description: 'Gaussian blur uygular' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-primary/30">
            <th className="text-left py-3 px-4 font-display text-primary">Filtre</th>
            <th className="text-left py-3 px-4 font-display text-primary">Aralık</th>
            <th className="text-left py-3 px-4 font-display text-primary">Açıklama</th>
          </tr>
        </thead>
        <tbody>
          {filters.map((filter, index) => (
            <tr key={index} className="border-b border-primary/10 hover:bg-primary/5">
              <td className="py-3 px-4 font-medium">{filter.name}</td>
              <td className="py-3 px-4 font-tech text-primary">{filter.range}</td>
              <td className="py-3 px-4 text-muted-foreground">{filter.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Preset boyutlar tablosu
function PresetTable() {
  const presets = [
    { name: 'Full HD', size: '1920×1080', usage: 'Standart yayın, YouTube' },
    { name: '4K UHD', size: '3840×2160', usage: 'Yüksek çözünürlük içerik' },
    { name: 'HD', size: '1280×720', usage: 'Düşük bant genişliği yayın' },
    { name: 'Square', size: '1080×1080', usage: 'Instagram, sosyal medya' },
    { name: 'Portrait', size: '1080×1920', usage: 'TikTok, Instagram Story' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-primary/30">
            <th className="text-left py-3 px-4 font-display text-primary">Preset</th>
            <th className="text-left py-3 px-4 font-display text-primary">Boyut</th>
            <th className="text-left py-3 px-4 font-display text-primary">Kullanım</th>
          </tr>
        </thead>
        <tbody>
          {presets.map((preset, index) => (
            <tr key={index} className="border-b border-primary/10 hover:bg-primary/5">
              <td className="py-3 px-4 font-medium">{preset.name}</td>
              <td className="py-3 px-4 font-tech text-primary">{preset.size}</td>
              <td className="py-3 px-4 text-muted-foreground">{preset.usage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Docs() {
  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Header */}
      <header className="h-16 border-b border-primary/30 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <Layers className="w-7 h-7 text-primary" />
                <span className="font-display text-xl tracking-wider text-primary">
                  OBS WEB STUDIO
                </span>
              </div>
            </Link>
            <span className="text-xs font-tech text-muted-foreground px-2 py-1 bg-secondary rounded">
              DOCS
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/config">
              <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary">
                <Settings className="w-4 h-4 mr-2" />
                Config
              </Button>
            </Link>
            <Link href="/">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Play className="w-4 h-4 mr-2" />
                Başlat
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 border-b border-primary/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-6">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm font-tech text-primary">Etkileşimli Dokümantasyon</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-6">
              OBS Web Studio
              <span className="block text-primary mt-2">Kullanım Kılavuzu</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              Katmanlı medya yönetimi, gerçek zamanlı önizleme ve profesyonel filtre sistemi ile 
              web tabanlı sahne düzenleme deneyimi.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/config">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Rocket className="w-5 h-5 mr-2" />
                  Hemen Başla
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-primary/30 hover:border-primary"
                onClick={() => {
                  const element = document.getElementById('features');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Özellikleri Keşfet
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 border-b border-primary/20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl text-foreground mb-4">Temel Özellikler</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              OBS Web Studio, profesyonel düzeyde medya yönetimi için ihtiyacınız olan tüm araçları sunar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Layers}
              title="Katman Sistemi"
              description="Sınırsız katman ekleme, sıralama ve görünürlük kontrolü ile profesyonel kompozisyon."
              color="primary"
            />
            <FeatureCard
              icon={Image}
              title="Çoklu Medya Desteği"
              description="Resim, GIF ve video formatlarını destekler. URL veya dosya yükleme seçenekleri."
              color="accent"
            />
            <FeatureCard
              icon={Palette}
              title="Gelişmiş Filtreler"
              description="Opaklık, renk, parlaklık, kontrast ve daha fazla filtre ile tam kontrol."
              color="green"
            />
            <FeatureCard
              icon={Monitor}
              title="Esnek Tuval Boyutu"
              description="Full HD'den 4K'ya, kare formatından dikey videoya kadar tüm boyutlar."
              color="primary"
            />
            <FeatureCard
              icon={Grid3X3}
              title="Tile Rendering"
              description="Ana sayfada tuval dışı alanlar otomatik olarak tile edilerek gösterilir."
              color="accent"
            />
            <FeatureCard
              icon={Download}
              title="JSON Import/Export"
              description="Yapılandırmanızı JSON olarak kaydedin ve istediğiniz zaman geri yükleyin."
              color="green"
            />
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-16">
        <div className="container">
          <Tabs defaultValue="quickstart" className="w-full">
            <TabsList className="w-full max-w-2xl mx-auto grid grid-cols-4 bg-secondary mb-8">
              <TabsTrigger value="quickstart" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                Hızlı Başlangıç
              </TabsTrigger>
              <TabsTrigger value="filters" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                Filtreler
              </TabsTrigger>
              <TabsTrigger value="presets" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                Preset'ler
              </TabsTrigger>
              <TabsTrigger value="install" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                Kurulum
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quickstart" className="mt-0">
              <Card className="cyber-panel bg-card/50 border-primary/30">
                <CardHeader>
                  <CardTitle className="font-display text-primary flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    Hızlı Başlangıç Rehberi
                  </CardTitle>
                  <CardDescription>
                    5 adımda ilk sahnenizi oluşturun
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <StepCard
                    number={1}
                    title="Config Sayfasına Gidin"
                    description="Tarayıcınızda /config adresine gidin veya üst menüden 'Config' butonuna tıklayın."
                  />
                  <Separator className="bg-primary/20" />
                  <StepCard
                    number={2}
                    title="Katman Ekleyin"
                    description="Sol paneldeki 'Ekle' butonuna tıklayın. Dosya yükleyin veya URL girin."
                  />
                  <Separator className="bg-primary/20" />
                  <StepCard
                    number={3}
                    title="Filtreleri Ayarlayın"
                    description="Katmanı seçin ve sağ panelden opaklık, konum, ölçek gibi özellikleri düzenleyin."
                  />
                  <Separator className="bg-primary/20" />
                  <StepCard
                    number={4}
                    title="Tuval Boyutunu Belirleyin"
                    description="'Tuval Ayarları' butonundan preset seçin veya özel boyut girin."
                  />
                  <Separator className="bg-primary/20" />
                  <StepCard
                    number={5}
                    title="Ana Sayfada Görüntüleyin"
                    description="'Ana Sayfayı Aç' butonuna tıklayın. Sahneniz tile rendering ile görüntülenecek."
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="filters" className="mt-0">
              <Card className="cyber-panel bg-card/50 border-primary/30">
                <CardHeader>
                  <CardTitle className="font-display text-primary flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Filtre Referansı
                  </CardTitle>
                  <CardDescription>
                    Tüm mevcut filtreler ve değer aralıkları
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FilterTable />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="presets" className="mt-0">
              <Card className="cyber-panel bg-card/50 border-primary/30">
                <CardHeader>
                  <CardTitle className="font-display text-primary flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    Tuval Preset'leri
                  </CardTitle>
                  <CardDescription>
                    Hazır tuval boyutları ve kullanım alanları
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PresetTable />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="install" className="mt-0">
              <Card className="cyber-panel bg-card/50 border-primary/30">
                <CardHeader>
                  <CardTitle className="font-display text-primary flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    Kurulum Talimatları
                  </CardTitle>
                  <CardDescription>
                    Windows'ta yerel kurulum için adımlar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Gereksinimler</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Node.js v18 veya üzeri</li>
                      <li>Windows 10/11</li>
                      <li>Modern web tarayıcısı</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Windows'ta Çalıştırma</h4>
                    <CodeBlock code={`# start.bat dosyasına çift tıklayın
# Administrator izni verin
# Tarayıcıda http://localhost:3000 açılacak`} />
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Manuel Kurulum</h4>
                    <CodeBlock code={`# Bağımlılıkları yükle
pnpm install

# Development sunucusu
pnpm dev

# Production build
pnpm build`} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t border-primary/20">
        <div className="container">
          <div className="cyber-panel bg-gradient-to-r from-primary/10 to-accent/10 p-8 md:p-12 text-center">
            <h2 className="font-display text-3xl text-foreground mb-4">
              Sahnenizi Oluşturmaya Hazır mısınız?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              OBS Web Studio ile profesyonel düzeyde katmanlı medya kompozisyonları oluşturun.
              Hemen başlayın!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/config">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Settings className="w-5 h-5 mr-2" />
                  Config Sayfasına Git
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="lg" className="border-primary/30 hover:border-primary">
                  <Play className="w-5 h-5 mr-2" />
                  Ana Sayfayı Görüntüle
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-primary/20">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <span className="font-display text-sm text-muted-foreground">
                OBS WEB STUDIO
              </span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Cyberpunk Control Room Theme • React + TypeScript + Tailwind CSS
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/config" className="hover:text-primary transition-colors">Config</Link>
              <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

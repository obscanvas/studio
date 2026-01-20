# OBS Web Studio - Tasarım Fikirleri

## Proje Özeti
OBS benzeri katmanlı medya yönetim uygulaması. Config ve Ana sayfa ayrımı, JSON tabanlı veri saklama, Windows localhost için start.bat.

---

<response>
## Fikir 1: Cyberpunk Control Room
<probability>0.08</probability>

### Design Movement
**Cyberpunk / Neon-Industrial** - Karanlık arka planlar üzerinde parlak neon vurgular, teknik grid yapıları ve futuristik kontrol paneli estetiği.

### Core Principles
1. **Karanlık Dominans**: Koyu gri/siyah arka planlar üzerinde neon aksan renkleri
2. **Teknik Hassasiyet**: Grid çizgileri, ölçüm işaretleri, teknik göstergeler
3. **Glitch Estetiği**: Hafif glitch efektleri, scan line'lar, holografik parıltılar
4. **Modüler Panel Yapısı**: Her bölüm bağımsız bir "panel" gibi görünür

### Color Philosophy
- **Ana Arka Plan**: #0a0a0f (Derin uzay siyahı)
- **Panel Arka Plan**: #12121a (Koyu lacivert-gri)
- **Neon Cyan**: #00f0ff (Ana aksan - aktif elementler)
- **Neon Magenta**: #ff00aa (İkincil aksan - uyarılar)
- **Grid Rengi**: #1a1a2e (Hafif görünür grid çizgileri)
- **Metin**: #e0e0e0 (Yüksek kontrast beyaz-gri)

### Layout Paradigm
- **Control Room Layout**: Sol tarafta katman listesi (dikey panel), ortada büyük canvas önizleme, sağda özellik paneli
- **Floating Panels**: Sürüklenebilir, yeniden boyutlandırılabilir paneller
- **Corner Brackets**: Her panelin köşelerinde teknik bracket işaretleri

### Signature Elements
1. **Neon Glow Borders**: Aktif panellerin etrafında hafif neon parıltı
2. **Scan Lines**: Canvas üzerinde hafif yatay tarama çizgileri
3. **Corner Indicators**: Her panelin köşelerinde L-şekilli teknik işaretler

### Interaction Philosophy
- Hover'da neon parıltı yoğunlaşması
- Tıklamada kısa "pulse" animasyonu
- Drag işlemlerinde ghost preview ile neon outline

### Animation
- Panel açılışlarında yukarıdan aşağı "boot-up" animasyonu
- Değer değişikliklerinde sayısal "ticker" efekti
- Hover'da hafif "glitch" micro-animasyonu

### Typography System
- **Başlıklar**: "Orbitron" - Futuristik, geometrik
- **Body**: "JetBrains Mono" - Monospace, teknik his
- **Değerler/Sayılar**: "Share Tech Mono" - Dijital gösterge tarzı
</response>

---

<response>
## Fikir 2: Bauhaus Minimal Studio
<probability>0.06</probability>

### Design Movement
**Bauhaus / Swiss Design** - Geometrik şekiller, güçlü tipografi, fonksiyonel minimalizm ve asimetrik kompozisyon.

### Core Principles
1. **Form Follows Function**: Her element bir amaca hizmet eder
2. **Geometrik Sadelik**: Daire, kare, üçgen temel formları
3. **Tipografik Hiyerarşi**: Boyut ve ağırlık ile net ayrım
4. **Asimetrik Denge**: Dinamik ama dengeli kompozisyon

### Color Philosophy
- **Ana Arka Plan**: #fafafa (Sıcak beyaz)
- **Vurgu Kırmızı**: #e63946 (Bauhaus kırmızısı - ana aksiyonlar)
- **Vurgu Sarı**: #f4a261 (Sıcak sarı - seçili elementler)
- **Vurgu Mavi**: #264653 (Derin mavi - bilgi panelleri)
- **Siyah**: #1d1d1d (Tipografi ve çerçeveler)
- **Gri**: #6c757d (İkincil metin)

### Layout Paradigm
- **Asymmetric Grid**: Sol 1/3 katman listesi, sağ 2/3 canvas ve kontroller
- **Bold Dividers**: Kalın siyah çizgilerle bölüm ayrımı
- **Floating Geometric Shapes**: Dekoratif arka plan elementleri

### Signature Elements
1. **Thick Black Borders**: 3-4px kalınlığında siyah çerçeveler
2. **Geometric Accents**: Köşelerde daire veya üçgen vurgular
3. **Bold Typography Labels**: Büyük, cesur etiketler

### Interaction Philosophy
- Hover'da renk dolgusu değişimi (outline → filled)
- Tıklamada geometrik şekil "stamp" efekti
- Drag'de keskin gölge ile yükseklik hissi

### Animation
- Sayfa geçişlerinde geometrik şekillerin kayması
- Panel açılışlarında "unfold" kağıt katlama efekti
- Değer değişikliklerinde smooth spring animasyonu

### Typography System
- **Başlıklar**: "Bebas Neue" - Condensed, güçlü
- **Body**: "Work Sans" - Temiz, okunabilir
- **Labels**: "Space Mono" - Teknik, monospace
</response>

---

<response>
## Fikir 3: Glass Morphism Studio
<probability>0.07</probability>

### Design Movement
**Glass Morphism / Aurora** - Yarı saydam cam efektleri, yumuşak gradyanlar, blur katmanları ve ışık oyunları.

### Core Principles
1. **Transparency Layers**: Çoklu yarı saydam katmanlar
2. **Soft Gradients**: Aurora benzeri yumuşak renk geçişleri
3. **Depth Through Blur**: Blur ile derinlik hissi
4. **Light Play**: Işık yansımaları ve parıltılar

### Color Philosophy
- **Arka Plan Gradient**: #0f0c29 → #302b63 → #24243e (Gece gökyüzü)
- **Cam Beyazı**: rgba(255,255,255,0.1) (Panel arka planları)
- **Aurora Yeşil**: #00d9ff → #00ff88 (Aktif elementler)
- **Aurora Mor**: #a855f7 → #ec4899 (Vurgular)
- **Metin**: #ffffff (Beyaz, yüksek kontrast)
- **Muted**: rgba(255,255,255,0.6) (İkincil metin)

### Layout Paradigm
- **Floating Cards**: Havada süzülen cam kartlar
- **Layered Depth**: Arka plan → orta katman → ön katman
- **Organic Flow**: Yumuşak köşeler, akışkan formlar

### Signature Elements
1. **Frosted Glass Panels**: backdrop-blur ile buzlu cam efekti
2. **Aurora Glow**: Panellerin arkasında yumuşak renk parıltıları
3. **Light Reflections**: Üst kenarlarda ince beyaz çizgi (ışık yansıması)

### Interaction Philosophy
- Hover'da blur yoğunluğu artışı ve hafif scale
- Tıklamada "ripple" dalgası efekti
- Drag'de panel arkasındaki aurora renginin değişimi

### Animation
- Panel girişlerinde "fade + slide up" kombinasyonu
- Arka plan aurora renklerinin yavaş animasyonu
- Değer değişikliklerinde smooth morph

### Typography System
- **Başlıklar**: "Plus Jakarta Sans" - Modern, yumuşak
- **Body**: "Inter" - Temiz, nötr (ama farklı ağırlıklarla)
- **Değerler**: "DM Mono" - Monospace, okunabilir
</response>

---

## Seçilen Tasarım: Cyberpunk Control Room

Bu tasarımı seçiyorum çünkü:
1. OBS'nin profesyonel, teknik doğasına en uygun estetik
2. Karanlık tema video düzenleme yazılımlarının standardı
3. Neon vurgular aktif/pasif durumları net gösterir
4. Modüler panel yapısı OBS'nin katman mantığıyla örtüşür
5. Teknik göstergeler ve grid yapısı hassas kontrol hissi verir

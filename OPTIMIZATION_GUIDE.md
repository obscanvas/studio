# Veritabanı Optimizasyonu ve Cloudinary Entegrasyonu

Bu döküman, proje veritabanını küçültmek ve performansı artırmak için yapılan değişiklikleri ve bu yeni yapının nasıl çalıştığını anlatır.

## Yapılan Değişiklikler

### 1. Bulut Tabanlı Görsel Depolama (Cloudinary)
Eskiden görseller `Base64` formatında (çok uzun metinler halinde) doğrudan veritabanındaki JSON içinde saklanıyordu. Bu, veritabanını hızla şişiriyor ve sorguları yavaşlatıyordu.

**Yeni Yapı:**
- Görseller artık **Cloudinary** servisine yükleniyor.
- Veritabanında sadece kısa bir URL saklanıyor (Örn: `https://res.cloudinary.com/...`).
- Yükleme işlemi `Medya Ekle` penceresinde **açıkça** yapılıyor. Kullanıcı yüklemenin başladığını ve bittiğini görüyor.

### 2. Veri Şeması Sıkıştırma (Schema Minification)
Veritabanına kaydedilen JSON verisini daha da küçültmek için "Sıkıştırma" (Minification) katmanı eklendi.

**Nasıl Çalışır?**
- Uygulama içinde (kod yazarken) anlamlı isimler kullanmaya devam ediyoruz: `layers`, `opacity`, `transform` vb.
- Veritabanına **KAYDEDERKEN** bu veriler sıkıştırılıyor:
    - `layers` -> `l`
    - `name` -> `n`
    - `opacity` -> `o`
    - `transform` -> `tr`
- Veritabanından **OKURKEN** bu veriler tekrar eski haline (genişletilmiş) getiriliyor.

**Örnek Kazanç:**
```json
// Eski (~150 karakter)
{
  "name": "Proje 1",
  "layers": [
    { "id": "xyz", "opacity": 1, "visible": true }
  ]
}

// Yeni (Minified - ~80 karakter)
{
  "n": "Proje 1",
  "l": [
    { "i": "xyz", "o": 1, "v": true }
  ]
}
```

## Dosya Yapısı ve Görevleri

| Dosya | Görev |
|-------|-------|
| `client/src/lib/cloudinary.ts` | Cloudinary'ye dosya yükleme servisi. |
| `client/src/lib/compression.ts` | Veriyi sıkıştıran (`minify`) ve açan (`expand`) fonksiyonlar. |
| `components/AddMediaDialog.tsx` | Kullanıcı arayüzü. Görsel seçilince otomatik yükleme başlatır. |
| `hooks/useStorage.ts` | Kayıt sırasında sıkıştırma, yükleme sırasında açma işlemini yönetir. |

## Gelecek İçin Öneriler

1.  **Eski Projeler:** Sistem eski (sıkıştırılmamış) projeleri açarken otomatik olarak tanır ve düzgün çalışır. Kaydettiğiniz anda yeni (sıkıştırılmış) formata dönüşürler.
2.  **API Anahtarları:** `.env` dosyasındaki Cloudinary anahtarlarının (`VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`) her ortamda (Local, Production) tanımlı olduğundan emin olun.
3.  **Yedekleme:** Büyük değişikliklerden önce veritabanı yedeği almak iyi bir pratiktir, ancak bu yapı geriye dönük uyumludur.

## Kullanım
Normal şekilde "Medya Ekle" butonunu kullanın. Dosya seçtiğinizde "Buluta Yükleniyor..." uyarısını göreceksiniz. Yükleme bitince "Katman Ekle" butonu aktif olacaktır.

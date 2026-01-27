/**
 * Resim dosyalarını istemci tarafında WebP formatına dönüştürür.
 * 
 * @param file Orijinal Dosya (File)
 * @param quality Dönüşüm kalitesi (0.0 - 1.0 arası)
 * @returns WebP formatında yeni bir Blob
 */
export async function convertToWebP(file: File, quality: number = 0.85): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context oluşturulamadı'));
                    return;
                }

                ctx.drawImage(img, 0, 0);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('WebP dönüşümü başarısız oldu'));
                        }
                    },
                    'image/webp',
                    quality
                );
            };
            img.onerror = () => reject(new Error('Resim yüklenemedi'));
            img.src = event.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Dosya okunamadı'));
        reader.readAsDataURL(file);
    });
}

/**
 * Dosyanın bir GIF olup olmadığını kontrol eder.
 * GIF'ler WebP'ye dönüştürülürse animasyonlarını kaybedebilir (basit canvas yöntemiyle).
 */
export function isGIF(file: File): boolean {
    return file.type === 'image/gif';
}

/**
 * Dosyanın bir resim olup olmadığını kontrol eder.
 */
export function isImage(file: File): boolean {
    return file.type.startsWith('image/');
}

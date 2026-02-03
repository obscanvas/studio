import { useCallback } from 'react';
import { ProjectConfig, DEFAULT_PROJECT_CONFIG, DEFAULT_FILTERS, Layer } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { convertToWebP, isImage, isGIF } from '@/lib/imageUtils';

const STORAGE_KEY = 'obs_web_studio_last_config';
const ID_KEY = 'obs_web_studio_last_id';

export function useStorage(
    config: ProjectConfig,
    setConfig: React.Dispatch<React.SetStateAction<ProjectConfig>>,
    projectId: string | null,
    setProjectId: (id: string | null) => void,
    setIsLoading: (loading: boolean) => void
) {
    const uploadToCloudinary = async (file: File | Blob, fileName: string): Promise<string | null> => {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || cloudName === 'buraya_cloud_name_gelecek') {
            toast.error('Cloudinary Cloud Name ayarlanmamış!');
            return null;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', 'obs-web-studio/layers');

        const publicId = fileName.split('.')[0] + '_' + Date.now();
        formData.append('public_id', publicId);

        try {
            const resourceType = file.type.startsWith('video') ? 'video' : 'image';
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Cloudinary upload error:', errorData);
                throw new Error(errorData.error?.message || 'Yükleme başarısız');
            }

            const data = await response.json();
            return data.secure_url;
        } catch (error: any) {
            console.error('Cloudinary upload failure:', error);
            toast.error(`Yükleme hatası: ${error.message}`);
            return null;
        }
    };

    const uploadToStorage = async (file: File): Promise<string | null> => {
        setIsLoading(true);
        try {
            let fileToUpload: File | Blob = file;
            let finalFileName = file.name;

            if (isImage(file) && !isGIF(file)) {
                try {
                    const webpBlob = await convertToWebP(file, 0.85);
                    fileToUpload = webpBlob;
                    finalFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                } catch (error) {
                    console.error('WebP conversion failed, uploading original:', error);
                }
            }

            const url = await uploadToCloudinary(fileToUpload, finalFileName);
            return url;
        } finally {
            setIsLoading(false);
        }
    };

    const saveConfig = useCallback(async () => {
        // 1. Tarayıcı hafızasına kaydet (En hızlısı)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        if (projectId) localStorage.setItem(ID_KEY, projectId);

        // 2. Buluta kaydet (Eğer proje ID varsa)
        if (projectId) {
            const { error } = await supabase
                .from('scenes')
                .update({ config, updated_at: new Date().toISOString() })
                .eq('id', projectId);

            if (error) console.error('Cloud save failed');
        }

        // 3. Yerel sunucuya kaydet (Eğer varsa)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            try {
                await fetch('/api/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(config),
                });
            } catch (e) { }
        }
    }, [config, projectId]);

    const loadConfig = useCallback(async (targetId?: string) => {
        // Öncelik Sırası: URL ID > localStorage ID > localStorage Config > Default
        const idToLoad = targetId || projectId || localStorage.getItem(ID_KEY);
        setIsLoading(true);

        try {
            // 1. Remote/Cloud yükleme
            if (idToLoad) {
                const { data, error } = await supabase
                    .from('scenes')
                    .select('config')
                    .eq('id', idToLoad)
                    .single();

                if (data && !error) {
                    setConfig(data.config);
                    if (!projectId) setProjectId(idToLoad); // ID'yi senkronize et
                    return;
                }
            }

            // 2. Yerel Sunucu (Local Server) yükleme
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                try {
                    const response = await fetch('/api/config');
                    if (response.ok) {
                        const serverConfig = await response.json();
                        if (serverConfig) {
                            setConfig({
                                ...serverConfig,
                                layers: serverConfig.layers.map((layer: Layer) => ({
                                    ...layer,
                                    filters: { ...DEFAULT_FILTERS, ...layer.filters },
                                })),
                            });
                            return;
                        }
                    }
                } catch (e) { }
            }

            // 3. Browser Hafızası (localStorage) yükleme
            const savedConfig = localStorage.getItem(STORAGE_KEY);
            if (savedConfig) {
                try {
                    const parsed = JSON.parse(savedConfig);
                    setConfig(parsed);
                    return;
                } catch (e) {
                    console.error('localStorage parse error');
                }
            }

            // 4. Default'a dön (Eğer hiçbir şey yoksa)
            setConfig(DEFAULT_PROJECT_CONFIG);

        } catch (error) {
            console.error('Config yüklenemedi:', error);
        } finally {
            setIsLoading(false);
        }
    }, [projectId, setConfig, setIsLoading, setProjectId]);

    const shareProject = async (isPublic: boolean): Promise<string | null> => {
        try {
            // Update config with isPublic setting
            const updatedConfig = { ...config, isPublic, lastModified: new Date().toISOString() };

            if (projectId) {
                // Update existing scene
                const { error } = await supabase
                    .from('scenes')
                    .update({ config: updatedConfig, updated_at: new Date().toISOString() })
                    .eq('id', projectId);

                if (error) {
                    console.error('Share error:', error);
                    toast.error('Paylaşım linki güncellenemedi');
                    return null;
                }

                // Update local config
                setConfig(updatedConfig);
                await saveConfig();
                return `${window.location.origin}${window.location.pathname}#/?id=${projectId}`;
            } else {
                // Create new scene
                const newId = Math.random().toString(36).substring(2, 10);
                const { error } = await supabase
                    .from('scenes')
                    .insert([{ id: newId, config: updatedConfig, created_at: new Date().toISOString() }]);

                if (error) {
                    console.error('Share error:', error);
                    toast.error('Paylaşım linki oluşturulamadı');
                    return null;
                }

                setProjectId(newId);
                setConfig(updatedConfig);
                localStorage.setItem(ID_KEY, newId);

                const currentUrl = new URL(window.location.href);
                currentUrl.hash = `/?id=${newId}`;
                window.location.href = currentUrl.toString();

                return `${window.location.origin}${window.location.pathname}#/?id=${newId}`;
            }
        } catch (e) {
            console.error('Share exception:', e);
            toast.error('Bir hata oluştu');
            return null;
        }
    };

    return {
        uploadToStorage,
        saveConfig,
        loadConfig,
        shareProject
    };
}

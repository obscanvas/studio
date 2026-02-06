import { useCallback } from "react";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { convertToWebP, isGIF, isImage } from "@/lib/imageUtils";
import { DEFAULT_FILTERS, DEFAULT_PROJECT_CONFIG, Layer, ProjectConfig } from "@/types";

const STORAGE_KEY = "obs_web_studio_last_config";
const ID_KEY = "obs_web_studio_last_id";

const isAccessColumnError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;
  const message = String((error as { message?: string }).message ?? "");
  return message.includes("is_public") || message.includes("user_id");
};

const normalizeProjectConfig = (
  raw: unknown,
  isPublicOverride?: boolean
): ProjectConfig => {
  const parsed = raw && typeof raw === "object" ? (raw as Partial<ProjectConfig>) : {};

  const parsedLayers = Array.isArray(parsed.layers) ? (parsed.layers as any[]) : [];
  const layers: Layer[] = parsedLayers.map((layer) => {
    const safeLayer = layer as Layer;
    return {
      ...safeLayer,
      filters: { ...DEFAULT_FILTERS, ...(safeLayer.filters ?? {}) },
    };
  });

  return {
    ...DEFAULT_PROJECT_CONFIG,
    ...parsed,
    isPublic:
      typeof isPublicOverride === "boolean"
        ? isPublicOverride
        : typeof parsed.isPublic === "boolean"
          ? parsed.isPublic
          : DEFAULT_PROJECT_CONFIG.isPublic,
    layers,
    lastModified: parsed.lastModified ?? new Date().toISOString(),
  };
};

export function useStorage(
  config: ProjectConfig,
  setConfig: React.Dispatch<React.SetStateAction<ProjectConfig>>,
  projectId: string | null,
  setProjectId: (id: string | null) => void,
  setIsLoading: (loading: boolean) => void
) {
  const uploadToCloudinary = async (
    file: File | Blob,
    fileName: string
  ): Promise<string | null> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || cloudName === "buraya_cloud_name_gelecek") {
      toast.error("Cloudinary Cloud Name ayarlanmamis.");
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "obs-web-studio/layers");

    const publicId = `${fileName.split(".")[0]}_${Date.now()}`;
    formData.append("public_id", publicId);

    try {
      const resourceType = file.type.startsWith("video") ? "video" : "image";
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Yukleme basarisiz");
      }

      const data = await response.json();
      return data.secure_url as string;
    } catch (error: any) {
      console.error("Cloudinary upload failure:", error);
      toast.error(`Yukleme hatasi: ${error.message}`);
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
          finalFileName = `${file.name.replace(/\.[^/.]+$/, "")}.webp`;
        } catch (error) {
          console.error("WebP conversion failed, uploading original:", error);
        }
      }

      return await uploadToCloudinary(fileToUpload, finalFileName);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = useCallback(async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    if (projectId) localStorage.setItem(ID_KEY, projectId);

    if (projectId) {
      const now = new Date().toISOString();
      let { error } = await supabase
        .from("scenes")
        .update({
          config,
          is_public: config.isPublic,
          updated_at: now,
        })
        .eq("id", projectId);

      if (error && isAccessColumnError(error)) {
        ({ error } = await supabase
          .from("scenes")
          .update({
            config,
            updated_at: now,
          })
          .eq("id", projectId));
      }

      if (error) {
        console.error("Cloud save failed:", error);
      }
    }

    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      try {
        await fetch("/api/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        });
      } catch {
        // noop
      }
    }
  }, [config, projectId]);

  const loadConfig = useCallback(
    async (targetId?: string) => {
      const idToLoad = targetId || projectId || localStorage.getItem(ID_KEY);
      setIsLoading(true);

      try {
        if (idToLoad) {
          let { data, error } = await supabase
            .from("scenes")
            .select("config, is_public")
            .eq("id", idToLoad)
            .single();

          if (error && isAccessColumnError(error)) {
            const legacyResult = await supabase
              .from("scenes")
              .select("config")
              .eq("id", idToLoad)
              .single();

            data = legacyResult.data
              ? { ...legacyResult.data, is_public: undefined }
              : null;
            error = legacyResult.error;
          }

          if (data && !error) {
            setConfig(normalizeProjectConfig(data.config, data.is_public ?? undefined));
            if (!projectId) {
              setProjectId(idToLoad);
            }
            return;
          }
        }

        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
          try {
            const response = await fetch("/api/config");
            if (response.ok) {
              const serverConfig = await response.json();
              if (serverConfig) {
                setConfig(normalizeProjectConfig(serverConfig));
                return;
              }
            }
          } catch {
            // noop
          }
        }

        const savedConfig = localStorage.getItem(STORAGE_KEY);
        if (savedConfig) {
          try {
            const parsed = JSON.parse(savedConfig);
            setConfig(normalizeProjectConfig(parsed));
            return;
          } catch {
            console.error("localStorage parse error");
          }
        }

        setConfig(DEFAULT_PROJECT_CONFIG);
      } catch (error) {
        console.error("Config yuklenemedi:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, setConfig, setIsLoading, setProjectId]
  );

  const shareProject = async (isPublic: boolean): Promise<string | null> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      if (authError || !userId) {
        toast.error("Paylasim icin giris yapmalisiniz");
        return null;
      }

      const updatedConfig = normalizeProjectConfig(
        {
          ...config,
          isPublic,
          lastModified: new Date().toISOString(),
        },
        isPublic
      );
      const legacyConfig = { ...(updatedConfig as any), ownerId: userId };

      if (projectId) {
        const now = new Date().toISOString();
        let { error } = await supabase
          .from("scenes")
          .update({
            config: updatedConfig,
            is_public: isPublic,
            updated_at: now,
          })
          .eq("id", projectId);

        if (error && isAccessColumnError(error)) {
          ({ error } = await supabase
            .from("scenes")
            .update({
              config: legacyConfig,
              updated_at: now,
            })
            .eq("id", projectId));
        }

        if (error) {
          console.error("Share error:", error);
          toast.error("Paylasim linki guncellenemedi");
          return null;
        }

        setConfig(updatedConfig);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
        localStorage.setItem(ID_KEY, projectId);

        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
          try {
            await fetch("/api/config", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatedConfig),
            });
          } catch {
            // noop
          }
        }

        return `${window.location.origin}${window.location.pathname}#/?id=${projectId}`;
      }

      const newId = nanoid(10);
      const now = new Date().toISOString();

      let { error } = await supabase.from("scenes").insert([
        {
          id: newId,
          user_id: userId,
          is_public: isPublic,
          config: updatedConfig,
          created_at: now,
          updated_at: now,
        },
      ]);

      if (error && isAccessColumnError(error)) {
        ({ error } = await supabase.from("scenes").insert([
          {
            id: newId,
            config: legacyConfig,
            created_at: now,
            updated_at: now,
          },
        ]));
      }

      if (error) {
        console.error("Share error:", error);
        toast.error("Paylasim linki olusturulamadi");
        return null;
      }

      setProjectId(newId);
      setConfig(updatedConfig);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
      localStorage.setItem(ID_KEY, newId);

      const currentUrl = new URL(window.location.href);
      currentUrl.hash = `/?id=${newId}`;
      window.location.href = currentUrl.toString();

      return `${window.location.origin}${window.location.pathname}#/?id=${newId}`;
    } catch (error) {
      console.error("Share exception:", error);
      toast.error("Bir hata olustu");
      return null;
    }
  };

  return {
    uploadToStorage,
    saveConfig,
    loadConfig,
    shareProject,
  };
}


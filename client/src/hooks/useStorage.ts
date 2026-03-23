import { useCallback } from "react";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { minifyConfig, expandConfig } from "@/lib/compression";
import { DEFAULT_FILTERS, DEFAULT_PROJECT_CONFIG, Layer, ProjectConfig } from "@/types";

const STORAGE_KEY = "obs_web_studio_last_config";
const ID_KEY = "obs_web_studio_last_id";

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
  const saveConfig = useCallback(async () => {
    const minified = minifyConfig(config);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(minified));

    if (projectId) localStorage.setItem(ID_KEY, projectId);

    const userId = auth.currentUser?.uid;

    if (!userId) {
      console.warn("User not logged in, saving locally only");
      return;
    }

    if (config.layers.length === 0) {
      return;
    }

    if (!projectId) {
      const newId = nanoid(10);
      const now = new Date().toISOString();
      const configWithDate = { ...config, lastModified: now };
      const minifiedToSave = minifyConfig(configWithDate);

      try {
        await setDoc(doc(db, "scenes", newId), {
          user_id: userId,
          is_public: config.isPublic,
          config: minifiedToSave,
          created_at: now,
          updated_at: now,
        });

        setProjectId(newId);
        setConfig(configWithDate);
        localStorage.setItem(ID_KEY, newId);

        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set("id", newId);
        currentUrl.searchParams.delete("new");
        window.history.replaceState({}, "", currentUrl.toString());

        toast.success("Yeni proje olusturuldu");
      } catch (error) {
        console.error("Cloud create failed:", error);
        toast.error("Proje olusturulamadi");
      }
      return;
    }

    const now = new Date().toISOString();
    const configToSave = { ...config, lastModified: now };
    const minifiedToUpdate = minifyConfig(configToSave);

    try {
      const sceneRef = doc(db, "scenes", projectId);
      const snap = await getDoc(sceneRef);

      if (snap.exists() && snap.data().user_id === userId) {
        await updateDoc(sceneRef, {
          config: minifiedToUpdate,
          is_public: config.isPublic,
          updated_at: now,
        });
      } else {
        console.error("Cloud save failed: ownership mismatch or doc not found");
        toast.error("Kaydetme basarisiz. Yetkiniz olmayabilir.");
      }
    } catch (error) {
      console.error("Cloud save failed:", error);
      toast.error("Kaydetme basarisiz.");
    }
  }, [config, projectId]);

  const loadConfig = useCallback(
    async (targetId?: string) => {
      if (targetId === "") {
        setProjectId(null);
        setConfig(DEFAULT_PROJECT_CONFIG);
        localStorage.removeItem(ID_KEY);
        setIsLoading(false);
        return;
      }

      const idToLoad = targetId || projectId || localStorage.getItem(ID_KEY);

      if (!idToLoad) {
        setProjectId(null);

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const expanded = expandConfig(parsed);
            setConfig(normalizeProjectConfig(expanded));
          } catch (e) {
            console.error("Local recover failed", e);
            setConfig(DEFAULT_PROJECT_CONFIG);
          }
        } else {
          setConfig(DEFAULT_PROJECT_CONFIG);
        }

        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const currentUserId = auth.currentUser?.uid;
        const sceneRef = doc(db, "scenes", idToLoad);
        const snap = await getDoc(sceneRef);

        if (snap.exists()) {
          const data = snap.data();
          const expandedConfig = expandConfig(data.config);

          setConfig(normalizeProjectConfig(expandedConfig, data.is_public ?? undefined));

          if (currentUserId && data.user_id === currentUserId) {
            setProjectId(idToLoad);
            localStorage.setItem(ID_KEY, idToLoad);
          } else {
            setProjectId(null);
            localStorage.removeItem(ID_KEY);
            toast.info("Bu proje salt okunur. Degisiklikler yeni bir proje olarak kaydedilecek.");
          }
          return;
        }

        setConfig(DEFAULT_PROJECT_CONFIG);
        setProjectId(null);
      } catch (error) {
        console.error("Config yuklenemedi:", error);
        toast.error("Proje yuklenemedi");
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, setConfig, setIsLoading, setProjectId]
  );

  const shareProject = useCallback(async (isPublic: boolean): Promise<string | null> => {
    try {
      const userId = auth.currentUser?.uid;
      console.log("[share] userId:", userId, "projectId:", projectId);

      if (!userId) {
        toast.error("Paylaşım için giriş yapmalısınız");
        return null;
      }

      const firebaseProjectId = db.app.options.projectId;
      if (!firebaseProjectId) {
        console.error("[share] Firebase projectId is missing");
        toast.error("Firebase yapılandırması eksik. Bulut kaydetme devre dışı.");
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

      const minifiedConfig = minifyConfig(updatedConfig);

      const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Zaman aşımı (${ms}ms): ${label}`)), ms)
        );
        return Promise.race([promise, timeout]);
      };

      if (projectId) {
        const now = new Date().toISOString();
        console.log("[share] Updating existing doc:", projectId);

        try {
          await withTimeout(
            updateDoc(doc(db, "scenes", projectId), {
              config: minifiedConfig,
              is_public: isPublic,
              updated_at: now,
            }),
            8000,
            "updateDoc"
          );

          setConfig(updatedConfig);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(minifiedConfig));
          localStorage.setItem(ID_KEY, projectId);

          const link = `${window.location.origin}${window.location.pathname}#/?id=${projectId}`;
          console.log("[share] Success! Link:", link);
          return link;
        } catch (error) {
          console.error("[share] updateDoc error:", error);
          toast.error(`Paylaşım hatası: ${(error as Error).message}`);
          return null;
        }
      }

      const newId = nanoid(10);
      const now = new Date().toISOString();
      console.log("[share] Creating new doc:", newId);

      try {
        await withTimeout(
          setDoc(doc(db, "scenes", newId), {
            user_id: userId,
            is_public: isPublic,
            config: minifiedConfig,
            created_at: now,
            updated_at: now,
          }),
          8000,
          "setDoc"
        );

        console.log("[share] setDoc completed, updating local state...");

        setProjectId(newId);
        setConfig(updatedConfig);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(minifiedConfig));
        localStorage.setItem(ID_KEY, newId);

        const currentUrl = new URL(window.location.href);
        currentUrl.hash = `/config?id=${newId}`;
        window.history.replaceState({}, "", currentUrl.toString());

        const link = `${window.location.origin}${window.location.pathname}#/?id=${newId}`;
        console.log("[share] Success! Link:", link);
        return link;
      } catch (error) {
        console.error("[share] setDoc error:", error);
        toast.error(`Paylaşım hatası: ${(error as Error).message}`);
        return null;
      }
    } catch (error) {
      console.error("[share] Exception:", error);
      toast.error(`Hata: ${(error as Error).message}`);
      return null;
    }
  }, [config, projectId, setConfig, setProjectId]);

  return {
    saveConfig,
    loadConfig,
    shareProject,
  };
}

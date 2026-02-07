import { ProjectConfig, Layer, LayerFilters } from "@/types";

// Minified Types (Minimal keys for storage)
export interface MinifiedLayer {
    i: string;      // id
    n: string;      // name
    t: string;      // type
    s: string;      // source
    z: number;      // zIndex
    c: string;      // createdAt
    u: string;      // updatedAt
    f: {            // filters
        op: number;   // opacity
        ox: number;   // offsetX
        oy: number;   // offsetY
        s: number;    // scale
        r: number;    // rotation
        h: number;    // hueRotate
        b: number;    // brightness
        c: number;    // contrast
        sa: number;   // saturate
        bl: number;   // blur
        fx: boolean;  // flipX
        fy: boolean;  // flipY
        ux: number;   // uvScrollX
        uy: number;   // uvScrollY
        v: boolean;   // visible
        af: string[]; // activeFilters
        df: string[]; // disabledFilters
    };
}

export interface MinifiedConfig {
    n: string;      // name
    s: {            // canvasSize
        w: number;
        h: number;
    };
    b: string;      // backgroundColor
    p: boolean;     // isPublic
    l: MinifiedLayer[]; // layers
    m: string;      // lastModified
    v: number;      // version
}

/**
 * Proje verisini veritabanı için sıkıştırır (Minify)
 */
export function minifyConfig(config: ProjectConfig): MinifiedConfig {
    return {
        n: config.name,
        s: {
            w: config.canvasSize.width,
            h: config.canvasSize.height,
        },
        b: config.backgroundColor,
        p: config.isPublic,
        m: config.lastModified,
        v: 1, // Schema version 1
        l: config.layers.map(layer => ({
            i: layer.id,
            n: layer.name,
            t: layer.type,
            s: layer.source,
            z: layer.zIndex,
            c: layer.createdAt,
            u: layer.updatedAt,
            f: {
                op: layer.filters.opacity,
                ox: layer.filters.offsetX,
                oy: layer.filters.offsetY,
                s: layer.filters.scale,
                r: layer.filters.rotation,
                h: layer.filters.hueRotate,
                b: layer.filters.brightness,
                c: layer.filters.contrast,
                sa: layer.filters.saturate,
                bl: layer.filters.blur,
                fx: layer.filters.flipX,
                fy: layer.filters.flipY,
                ux: layer.filters.uvScrollX,
                uy: layer.filters.uvScrollY,
                v: layer.filters.visible,
                af: layer.filters.activeFilters || [],
                df: layer.filters.disabledFilters || [],
            },
        })),
    };
}

/**
 * Sıkıştırılmış veriyi uygulama formatına çevirir (Expand)
 */
export function expandConfig(data: any): ProjectConfig {
    // Eski format desteği (Backwards Compatibility)
    if (data.layers && !data.l) {
        return data as ProjectConfig;
    }

    const minified = data as MinifiedConfig;

    return {
        name: minified.n || "Adsız Proje",
        canvasSize: {
            width: minified.s?.w ?? 1920,
            height: minified.s?.h ?? 1080,
        },
        backgroundColor: minified.b || "#000000",
        isPublic: minified.p ?? false,
        lastModified: minified.m || new Date().toISOString(),
        version: "1.0.0", // Default version if missing
        layers: (minified.l || []).map(l => ({
            id: l.i,
            name: l.n,
            type: l.t as any,
            source: l.s,
            zIndex: l.z ?? 0,
            createdAt: l.c || new Date().toISOString(),
            updatedAt: l.u || new Date().toISOString(),
            filters: {
                opacity: l.f?.op ?? 100,
                offsetX: l.f?.ox ?? 0,
                offsetY: l.f?.oy ?? 0,
                scale: l.f?.s ?? 1,
                rotation: l.f?.r ?? 0,
                hueRotate: l.f?.h ?? 0,
                brightness: l.f?.b ?? 100,
                contrast: l.f?.c ?? 100,
                saturate: l.f?.sa ?? 100,
                blur: l.f?.bl ?? 0,
                flipX: l.f?.fx ?? false,
                flipY: l.f?.fy ?? false,
                uvScrollX: l.f?.ux ?? 0,
                uvScrollY: l.f?.uy ?? 0,
                visible: l.f?.v ?? true,
                activeFilters: l.f?.af || [],
                disabledFilters: l.f?.df || [],
            },
        })),
    };
}

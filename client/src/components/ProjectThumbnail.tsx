import React, { useMemo, useRef, useState, useEffect } from 'react';
import { ProjectConfig } from '@/types';
import { getFilterStyle } from '@/lib/renderUtils';

interface ProjectThumbnailProps {
    config: ProjectConfig;
    className?: string;
}

export function ProjectThumbnail({ config, className = '' }: ProjectThumbnailProps) {
    const { canvasSize, backgroundColor, layers } = config;
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        if (!containerRef.current) return;

        const updateScale = () => {
            if (!containerRef.current) return;
            const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect();
            const { width: canvasW, height: canvasH } = canvasSize;

            if (containerW === 0 || containerH === 0) return;

            const scaleX = containerW / canvasW;
            const scaleY = containerH / canvasH;
            setScale(Math.min(scaleX, scaleY));
        };

        const observer = new ResizeObserver(updateScale);
        observer.observe(containerRef.current);
        updateScale(); // Initial call

        return () => observer.disconnect();
    }, [canvasSize]);

    // Render scaling to fit container
    // Assuming the container is 16:9 or similar, we want to contain the canvas
    const sortedLayers = useMemo(() =>
        [...layers].sort((a, b) => a.zIndex - b.zIndex),
        [layers]
    );

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full overflow-hidden bg-black/50 flex items-center justify-center ${className}`}
            style={{ backgroundColor }}
        >
            {/* Scaled Render Container */}
            <div
                style={{
                    width: canvasSize.width,
                    height: canvasSize.height,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    flexShrink: 0, // Prevent flex compression
                }}
                className="relative overflow-hidden shadow-2xl"
            >
                {/* Grid Overlay for aesthetic */}
                <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

                {sortedLayers.map((layer) => {
                    if (!layer.filters.visible) return null;

                    return (
                        <div
                            key={layer.id}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            style={{ zIndex: layer.zIndex }}
                        >
                            <div
                                className="relative group pointer-events-auto"
                                style={getFilterStyle(layer)}
                            >
                                {layer.type === 'video' ? (
                                    <video
                                        src={layer.source}
                                        muted
                                        playsInline
                                        className="max-w-full max-h-full object-contain"
                                    // No autoplay for thumbnails to save resources, or maybe poster only?
                                    // Let's try simple img tag for video poster if available, or just render video paused
                                    />
                                ) : (
                                    <img
                                        src={layer.source}
                                        alt={layer.name}
                                        className="max-w-full max-h-full object-contain"
                                        loading="lazy"
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Overlay info if needed */}
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-white/70 font-tech backdrop-blur-sm z-10">
                {canvasSize.width}x{canvasSize.height}
            </div>
        </div>
    );
}

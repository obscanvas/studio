import React, { useEffect, useRef, useState } from 'react';
import { Layer, LayerFilters } from '@/types';

interface TransformControlsProps {
    layer: Layer;
    canvasScale: number;
    canvasSize: { width: number; height: number };
    onUpdate: (updates: Partial<LayerFilters>) => void;
}

type DragMode = 'none' | 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br';

interface SnapGuide {
    type: 'x' | 'y';
    pos: number; // Yüzde veya piksel değil, container içindeki pozisyon
}

/**
 * TransformControls Component
 * Katman üzerinde sürükleme ve boyutlandırma işlemlerini yönetir.
 * Ayrıca hizalama (snapping) ve kılavuz çizgileri sağlar.
 */
export function TransformControls({ layer, canvasScale, canvasSize, onUpdate }: TransformControlsProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [guides, setGuides] = useState<SnapGuide[]>([]);

    const dragModeRef = useRef<DragMode>('none');
    const startPosRef = useRef({ x: 0, y: 0 });

    const startLayerRef = useRef({
        offsetX: 0,
        offsetY: 0,
        scale: 1
    });

    // Snap Eşiği (Piksel cinsinden, zoomdan bağımsız hissedilmeli)
    const SNAP_THRESHOLD = 15;

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (dragModeRef.current === 'none') return;
            e.preventDefault();

            const deltaX = (e.clientX - startPosRef.current.x) / canvasScale;
            const deltaY = (e.clientY - startPosRef.current.y) / canvasScale;

            if (dragModeRef.current === 'move') {
                let newX = startLayerRef.current.offsetX + deltaX;
                let newY = startLayerRef.current.offsetY + deltaY;

                const currentGuides: SnapGuide[] = [];

                const halfW = canvasSize.width / 2;
                const halfH = canvasSize.height / 2;

                // X Ekseni (Dikey Çizgiler)
                // Sol Kenar (-width/2)
                if (Math.abs(newX - (-halfW)) < SNAP_THRESHOLD / canvasScale) {
                    newX = -halfW;
                    currentGuides.push({ type: 'x', pos: 0 }); // Sol
                }
                // Sağ Kenar (width/2)
                else if (Math.abs(newX - halfW) < SNAP_THRESHOLD / canvasScale) {
                    newX = halfW;
                    currentGuides.push({ type: 'x', pos: 100 }); // Sağ
                }
                // Merkez (0)
                else if (Math.abs(newX) < SNAP_THRESHOLD / canvasScale) {
                    newX = 0;
                    currentGuides.push({ type: 'x', pos: 50 }); // Orta
                }

                // Y Ekseni (Yatay Çizgiler)
                // Üst Kenar (-height/2)
                if (Math.abs(newY - (-halfH)) < SNAP_THRESHOLD / canvasScale) {
                    newY = -halfH;
                    currentGuides.push({ type: 'y', pos: 0 }); // Üst
                }
                // Alt Kenar (height/2)
                else if (Math.abs(newY - halfH) < SNAP_THRESHOLD / canvasScale) {
                    newY = halfH;
                    currentGuides.push({ type: 'y', pos: 100 }); // Alt
                }
                // Merkez (0)
                else if (Math.abs(newY) < SNAP_THRESHOLD / canvasScale) {
                    newY = 0;
                    currentGuides.push({ type: 'y', pos: 50 }); // Orta
                }

                setGuides(currentGuides);

                onUpdate({
                    offsetX: newX,
                    offsetY: newY
                });
            } else if (dragModeRef.current.startsWith('resize')) {
                setGuides([]);

                const isRight = dragModeRef.current.includes('r');
                const isBottom = dragModeRef.current.includes('b');

                const scaleFactorX = isRight ? 1 : -1;
                const scaleFactorY = isBottom ? 1 : -1;

                const rawDelta = (deltaX * scaleFactorX + deltaY * scaleFactorY) / 200;
                const newScale = Math.max(0.1, Math.min(5.0, startLayerRef.current.scale + rawDelta));

                onUpdate({
                    scale: Number(newScale.toFixed(3))
                });
            }
        };

        const handleMouseUp = () => {
            if (dragModeRef.current !== 'none') {
                dragModeRef.current = 'none';
                setIsDragging(false);
                setGuides([]);
                document.body.style.cursor = '';
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, canvasScale, canvasSize, onUpdate]);

    const handleMouseDown = (e: React.MouseEvent, mode: DragMode) => {
        e.stopPropagation();
        e.preventDefault();

        dragModeRef.current = mode;
        setIsDragging(true);
        startPosRef.current = { x: e.clientX, y: e.clientY };
        startLayerRef.current = {
            offsetX: layer.filters.offsetX,
            offsetY: layer.filters.offsetY,
            scale: layer.filters.scale
        };
    };

    // Ters Scale mantığı
    const inverseScale = 1 / Math.max(0.01, layer.filters.scale);

    const handleStyle = `absolute w-6 h-6 bg-neon-cyan border border-black rounded-sm z-50 pointer-events-auto transition-colors hover:bg-white shadow-[0_0_5px_theme(colors.neon-cyan)]`;

    const getHandleTransform = () => ({
        transform: `scale(${inverseScale})`,
    });

    // Inverse Scale Wrapper Component
    const CornerHandle = ({ position, cursor, onClick }: any) => (
        <div
            className={`${handleStyle} ${cursor}`}
            style={{
                ...getHandleTransform(),
                ...position
            }}
            onMouseDown={(e) => handleMouseDown(e, onClick)}
        />
    );

    return (
        <div className="absolute inset-0 z-50 pointer-events-none">
            {/* Move Area (Border + Fill) */}
            {!isDragging && (
                <div
                    className="absolute inset-0 border-2 border-neon-cyan/50 pointer-events-none"
                />
            )}
            <div
                className={`absolute inset-0 pointer-events-auto cursor-move ${isDragging ? 'bg-neon-cyan/10 border-2 border-neon-cyan' : 'hover:bg-neon-cyan/5'}`}
                onMouseDown={(e) => handleMouseDown(e, 'move')}
            />

            {/* Corners */}
            <CornerHandle
                position={{ top: '-12px', left: '-12px' }}
                cursor="cursor-nw-resize"
                onClick="resize-tl"
            />
            <CornerHandle
                position={{ top: '-12px', right: '-12px' }}
                cursor="cursor-ne-resize"
                onClick="resize-tr"
            />
            <CornerHandle
                position={{ bottom: '-12px', left: '-12px' }}
                cursor="cursor-sw-resize"
                onClick="resize-bl"
            />
            <CornerHandle
                position={{ bottom: '-12px', right: '-12px' }}
                cursor="cursor-se-resize"
                onClick="resize-br"
            />

            {/* Info Labels */}
            {isDragging && (
                <div
                    className="absolute left-1/2 top-full mt-2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none z-[60]"
                    style={{ transform: `scale(${inverseScale})` }}
                >
                    {dragModeRef.current === 'move'
                        ? `X: ${Math.round(layer.filters.offsetX)} Y: ${Math.round(layer.filters.offsetY)}`
                        : `${Math.round(layer.filters.scale * 100)}%`
                    }
                </div>
            )}
        </div>
    );
}

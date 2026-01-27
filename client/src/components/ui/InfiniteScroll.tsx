import React, { useRef, useEffect } from 'react';

interface InfiniteScrollProps {
    children: React.ReactNode;
    speedX: number; // Pixels per second
    speedY: number; // Pixels per second
    className?: string;
}

/**
 * InfiniteScroll Component
 * Provides seamless, high-performance, and jitter-free scrolling for any content.
 * Matches professional OBS-style scroll filters.
 */
export function InfiniteScroll({ children, speedX, speedY, className }: InfiniteScrollProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const posRef = useRef({ x: 0, y: 0 });
    const animationRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);

    useEffect(() => {
        // If no speed is set, don't animate to save resources
        if (speedX === 0 && speedY === 0) {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            return;
        }

        let width = 0;
        let height = 0;

        const updateDimensions = () => {
            if (containerRef.current) {
                width = containerRef.current.clientWidth;
                height = containerRef.current.clientHeight;
            }
        };

        updateDimensions();

        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        const animate = (time: number) => {
            if (!lastTimeRef.current) {
                lastTimeRef.current = time;
                animationRef.current = requestAnimationFrame(animate);
                return;
            }

            const deltaTime = (time - lastTimeRef.current) / 1000;
            lastTimeRef.current = time;

            // Calculate new position based on constant time delta
            // Multiplying by a factor (e.g., 50) to match user's expected "speed" feel
            const velocity = 50;
            posRef.current.x += speedX * deltaTime * velocity;
            posRef.current.y += speedY * deltaTime * velocity;

            if (contentRef.current && width > 0 && height > 0) {
                // Wrap coordinates to stay within [0, width] and [0, height]
                posRef.current.x = ((posRef.current.x % width) + width) % width;
                posRef.current.y = ((posRef.current.y % height) + height) % height;

                // Apply transform3d for GPU acceleration
                // We translate backwards to create the scrolling forward effect
                contentRef.current.style.transform = `translate3d(${-posRef.current.x}px, ${-posRef.current.y}px, 0)`;
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            resizeObserver.disconnect();
            lastTimeRef.current = 0;
        };
    }, [speedX, speedY]);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden w-full h-full ${className || ''}`}
        >
            <div
                ref={contentRef}
                className="absolute top-0 left-0"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 100%)',
                    gridTemplateRows: 'repeat(2, 100%)',
                    width: '100%',
                    height: '100%'
                }}
            >
                {/* Render 4 clones of the children to ensure full coverage during multi-axis scroll */}
                <div className="w-full h-full">{children}</div>
                <div className="w-full h-full">{children}</div>
                <div className="w-full h-full">{children}</div>
                <div className="w-full h-full">{children}</div>
            </div>
        </div>
    );
}

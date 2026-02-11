import { useRef, useEffect } from 'react';

const MagnetLines = ({
    rows = 9,
    cols = 9,
    lineColor = "currentColor",
    lineWidth = "2px",
    lineHeight = "20px",
    baseRotation = 0,
    style = {}
}) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const items = container.querySelectorAll('.magnet-line');

        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;

            items.forEach(item => {
                const itemRect = item.getBoundingClientRect();
                const itemCenterX = itemRect.left + itemRect.width / 2;
                const itemCenterY = itemRect.top + itemRect.height / 2;

                const deltaX = clientX - itemCenterX;
                const deltaY = clientY - itemCenterY;

                // Calculate angle in radians, convert to degrees
                const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

                // Apply rotation (adding 90deg because usually lines are vertical by default)
                item.style.transform = `rotate(${angle + 90 + baseRotation}deg)`;
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [rows, cols, baseRotation]);

    return (
        <div
            ref={containerRef}
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
                width: '100%',
                height: '100%',
                ...style
            }}
        >
            {[...Array(rows * cols)].map((_, i) => (
                <div key={i} className="flex items-center justify-center w-full h-full pointer-events-none">
                    <div
                        className="magnet-line"
                        style={{
                            width: lineWidth,
                            height: lineHeight,
                            backgroundColor: lineColor,
                            // Smooth transition for rotation
                            transition: 'transform 0.1s ease-out',
                            borderRadius: '999px',
                            willChange: 'transform'
                        }}
                    ></div>
                </div>
            ))}
        </div>
    );
};

export default MagnetLines;

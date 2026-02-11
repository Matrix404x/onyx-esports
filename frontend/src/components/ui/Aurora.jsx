import { useEffect, useRef } from "react";

export default function Aurora({
    colorStops = ["#06b6d4", "#8b5cf6", "#06b6d4"], // Cyan -> Purple -> Cyan
    amplitude = 1.0,
    blend = 0.5,
    speed = 0.5
}) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let animationFrameId;
        let time = 0;

        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                // Set actual canvas size to match display size for sharpness
                canvas.width = parent.offsetWidth;
                canvas.height = parent.offsetHeight;
            }
        };

        window.addEventListener("resize", resize);
        resize();

        const draw = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Use a "composite" operation to blend layers nicely if needed, but 'source-over' with alpha is fine.
            // We want a dark background, so maybe 'screen' or 'lighter' for the aurora?
            // But canvas is transparent by default.

            colorStops.forEach((color, i) => {
                ctx.beginPath();
                ctx.fillStyle = color;
                ctx.globalAlpha = blend;
                // Heavy soft blur for the aurora effect
                ctx.filter = `blur(${50 * amplitude}px)`;

                // Draw a flowing sine wave
                // Vary the phase and frequency slightly for each color layer
                const layerOffset = (i * canvas.height * 0.3) + (canvas.height * 0.2); // Spread vertically

                ctx.moveTo(0, canvas.height); // Start bottom left

                // Draw top edge of the wave
                for (let x = 0; x <= canvas.width; x += 20) {
                    // y = sin(...) 
                    // We mix two sine waves for more organic feel
                    const freq1 = 0.002;
                    const freq2 = 0.005;
                    const y = Math.sin(x * freq1 + time * speed + i) * (150 * amplitude)
                        + Math.sin(x * freq2 - time * speed * 0.5) * (50 * amplitude)
                        + layerOffset;

                    ctx.lineTo(x, y);
                }

                ctx.lineTo(canvas.width, canvas.height); // Bottom right
                ctx.lineTo(0, canvas.height); // Bottom left
                ctx.closePath();
                ctx.fill();
            });

            time += 0.02; // Animation speed
            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [colorStops, amplitude, blend, speed]);

    return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

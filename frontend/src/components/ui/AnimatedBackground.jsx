import { useEffect, useRef } from "react";

const AnimatedBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        const dots = [];
        const dotCount = 50;
        const connectionDistance = 150;

        for (let i = 0; i < dotCount; i++) {
            dots.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw dots
            dots.forEach((dot, i) => {
                dot.x += dot.vx;
                dot.y += dot.vy;

                // Bounce off edges
                if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
                if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;

                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(6, 182, 212, 0.5)"; // Cyan color
                ctx.fill();

                // Draw connections
                for (let j = i + 1; j < dots.length; j++) {
                    const dot2 = dots[j];
                    const dist = Math.hypot(dot.x - dot2.x, dot.y - dot2.y);

                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(dot.x, dot.y);
                        ctx.lineTo(dot2.x, dot2.y);
                        const alpha = 1 - dist / connectionDistance;
                        ctx.strokeStyle = `rgba(6, 182, 212, ${alpha * 0.2})`;
                        ctx.stroke();
                    }
                }
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 -z-20 bg-slate-950" />;
};

export default AnimatedBackground;

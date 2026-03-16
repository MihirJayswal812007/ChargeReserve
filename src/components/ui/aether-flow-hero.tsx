"use client";

import React from 'react';

interface ParticleProps {
    x: number;
    y: number;
    directionX: number;
    directionY: number;
    size: number;
    color: string;
}

class Particle implements ParticleProps {
    x: number;
    y: number;
    directionX: number;
    directionY: number;
    size: number;
    color: string;
    
    constructor(x: number, y: number, directionX: number, directionY: number, size: number, color: string) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, mouse: { x: number | null, y: number | null, radius: number }) {
        if (this.x > canvas.width || this.x < 0) {
            this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
            this.directionY = -this.directionY;
        }

        if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius + this.size) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouse.radius - distance) / mouse.radius;

                this.x -= forceDirectionX * force * 5;
                this.y -= forceDirectionY * force * 5;
            }
        }

        this.x += this.directionX;
        this.y += this.directionY;
        this.draw(ctx);
    }
}

const AetherFlowHero = () => {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        let animationFrameId: number;
        let particles: Particle[] = [];
        const mouse = { x: null as number | null, y: null as number | null, radius: 200 };

        function init() {
            if (!canvas) return;
            particles = [];

            const numberOfParticles =
                (canvas.height * canvas.width) / 9000;

            for (let i = 0; i < numberOfParticles; i++) {
                const size = Math.random() * 2 + 1;

                const x =
                    Math.random() *
                        (window.innerWidth - size * 4) +
                    size * 2;

                const y =
                    Math.random() *
                        (window.innerHeight - size * 4) +
                    size * 2;

                const directionX =
                    Math.random() * 0.4 - 0.2;

                const directionY =
                    Math.random() * 0.4 - 0.2;

                const color =
                    "rgba(191,128,255,0.8)";

                particles.push(
                    new Particle(
                        x,
                        y,
                        directionX,
                        directionY,
                        size,
                        color
                    )
                );
            }
        }

        const resizeCanvas = () => {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        };

        window.addEventListener(
            "resize",
            resizeCanvas
        );

        resizeCanvas();

        const connect = () => {
            if (!ctx || !canvas) return;
            for (let a = 0; a < particles.length; a++) {
                for (
                    let b = a;
                    b < particles.length;
                    b++
                ) {
                    const distance =
                        (particles[a].x -
                            particles[b].x) **
                            2 +
                        (particles[a].y -
                            particles[b].y) **
                            2;

                    if (
                        distance <
                        (canvas.width / 7) *
                            (canvas.height / 7)
                    ) {
                        ctx.strokeStyle =
                            "rgba(200,150,255,0.3)";
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(
                            particles[a].x,
                            particles[a].y
                        );
                        ctx.lineTo(
                            particles[b].x,
                            particles[b].y
                        );
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = () => {
            animationFrameId =
                requestAnimationFrame(animate);

            if (!ctx) return;
            ctx.clearRect(
                0,
                0,
                window.innerWidth,
                window.innerHeight
            );

            for (
                let i = 0;
                i < particles.length;
                i++
            ) {
                particles[i].update(canvas, ctx, mouse);
            }

            connect();
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        window.addEventListener(
            "mousemove",
            handleMouseMove
        );

        init();
        animate();

        return () => {
            cancelAnimationFrame(
                animationFrameId
            );
            window.removeEventListener("resize", resizeCanvas);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <div className="relative h-screen w-full overflow-hidden">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
            />
            <div className="relative z-10 flex items-center justify-center h-full pointer-events-none">
                <h1 className="text-white text-6xl font-bold">
                    Aether Flow
                </h1>
            </div>
        </div>
    );
};

export default AetherFlowHero;

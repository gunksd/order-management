import React, { useEffect, useRef } from 'react';

const StarryBackground: React.FC = () => {
  const showCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const show = showCanvasRef.current;
    const help = document.createElement('canvas');

    if (!show) return;

    let showWidth: number, showHeight: number;

    const resizeCanvas = () => {
      showWidth = show.offsetWidth;
      showHeight = show.offsetHeight;
      show.width = showWidth;
      show.height = showHeight;

      const longSide = Math.max(showWidth, showHeight);
      help.width = longSide * 2.6;
      help.height = longSide * 2.6;

      const showContext = show.getContext('2d');
      if (showContext) {
        showContext.fillStyle = 'rgba(0,0,0,1)';
        showContext.fillRect(0, 0, showWidth, showHeight);
        if (showWidth < showHeight) {
          showContext.translate(showWidth, showHeight);
        } else {
          showContext.translate(showWidth, 0);
        }
      }
    };

    resizeCanvas();

    const showContext = show.getContext('2d');
    const helpContext = help.getContext('2d');

    if (!showContext || !helpContext) return;

    const rand = (min: number, max: number) => min + Math.round(Math.random() * (max - min));

    const randomColor = () => {
      const r = rand(120, 255);
      const g = rand(120, 255);
      const b = rand(120, 255);
      const a = rand(30, 100) / 100;
      return `rgba(${r},${g},${b},${a})`;
    };

    interface Star {
      x: number;
      y: number;
      size: number;
      color: string;
    }

    const stars: Star[] = [];

    const createStar = (): Star => ({
      x: rand(-help.width, help.width),
      y: rand(-help.height, help.height),
      size: 1.2,
      color: randomColor(),
    });

    const drawStar = () => {
      stars.forEach((star) => {
        helpContext.beginPath();
        helpContext.arc(star.x, star.y, star.size, 0, Math.PI * 2, true);
        helpContext.fillStyle = star.color;
        helpContext.closePath();
        helpContext.fill();
      });
    };

    let drawTimes = 0;

    const loop = () => {
      showContext.drawImage(help, -help.width / 2, -help.height / 2);

      drawTimes++;

      if (drawTimes > 200 && drawTimes % 8 === 0) {
        showContext.fillStyle = 'rgba(0,0,0,.04)';
        const longSide = Math.max(showWidth, showHeight);
        showContext.fillRect(-(longSide * 3), -(longSide * 3), longSide * 6, longSide * 6);
      }

      showContext.rotate((0.025 * Math.PI) / 180);
    };

    for (let i = 0; i < 18000; i++) {
      stars.push(createStar());
    }

    drawStar();

    const animate = () => {
      requestAnimationFrame(animate);
      loop();
    };

    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={showCanvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }} />;
};

export default StarryBackground;


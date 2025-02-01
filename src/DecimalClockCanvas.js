import React, { useRef, useEffect, useState } from "react";

const DecimalClockCanvas = () => {
  const horizontalCanvasRef = useRef(null);
  const circularCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const [timeData, setTimeData] = useState({
    dayPercent: "0.0",
    totalDecHours: "0.000",
    totalDecihours: "0.00",
    normalTimeStr: "00:00:00",
  });
  const pad = (num, size = 2) => ("0".repeat(size) + num).slice(-size);

  // Update digital time every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      const normalHours = now.getHours();
      const normalMinutes = now.getMinutes();
      const normalSeconds = now.getSeconds();
      const normalMilliseconds = now.getMilliseconds();
      const t =
        normalHours * 3600 +
        normalMinutes * 60 +
        normalSeconds +
        normalMilliseconds / 1000;
      const decHourDuration = 86400 / 10;
      const dayPercent = ((t / 86400) * 100).toFixed(1);
      const totalDecHours = (t / decHourDuration).toFixed(3);
      const totalDecihours = ((t / 86400) * 100).toFixed(2);
      const normalTimeStr = `${pad(normalHours)}:${pad(normalMinutes)}:${pad(normalSeconds)}`;
      setTimeData({ dayPercent, totalDecHours, totalDecihours, normalTimeStr });
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Inject responsive CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .decimal-clock-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 20px;
      }
      .digital-text {
        font-family: sans-serif;
        text-align: center;
        margin-bottom: 10px;
      }
      .digital-text h2 {
        margin: 5px 0;
      }
      .canvas-wrapper {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
      }
      .decimal-clock-canvas {
        margin: 20px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        border-radius: 15px;
        background: #fff;
      }
      .conversion-table {
        width: 80%;
        max-width: 600px;
        margin: 20px auto;
        border-collapse: collapse;
      }
      .conversion-table th, .conversion-table td {
        padding: 10px;
        border: 1px solid #ccc;
      }
      .conversion-table th {
        background-color: #333;
        color: #fff;
      }
      @media (max-width: 768px) {
        .canvas-wrapper {
          flex-direction: column;
          align-items: center;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Update canvas sizes responsively
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current && horizontalCanvasRef.current && circularCanvasRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // Set horizontal canvas width to 90% of container and adjust height dynamically
        const horizontalCanvas = horizontalCanvasRef.current;
        horizontalCanvas.width = containerWidth * 0.9;
        horizontalCanvas.height = horizontalCanvas.width < 600 ? 300 : (horizontalCanvas.width * 350) / 1200;
        // Set circular canvas width (max 600px) and keep it square
        const circularCanvas = circularCanvasRef.current;
        circularCanvas.width = Math.min(containerWidth * 0.9, 600);
        circularCanvas.height = circularCanvas.width;
      }
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  // Draw horizontal progress bars (bars only, no digital text)
  useEffect(() => {
    const canvas = horizontalCanvasRef.current;
    const ctx = canvas.getContext("2d");

    const drawHorizontal = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      // Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, "#f0f4f8");
      bgGrad.addColorStop(1, "#d9e2ec");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const now = new Date();
      const normalHours = now.getHours();
      const normalMinutes = now.getMinutes();
      const normalSeconds = now.getSeconds();
      const normalMilliseconds = now.getMilliseconds();
      const t =
        normalHours * 3600 +
        normalMinutes * 60 +
        normalSeconds +
        normalMilliseconds / 1000;

      const decHourDuration = 86400 / 10;
      const deciMinuteDuration = decHourDuration / 10;
      const decMinuteDuration = deciMinuteDuration / 10;
      const decSecondDuration = decMinuteDuration / 10;

      const decHourFraction = (t % decHourDuration) / decHourDuration;
      const deciMinuteFraction = (t % deciMinuteDuration) / deciMinuteDuration;
      const decMinuteFraction = (t % decMinuteDuration) / decMinuteDuration;
      const decSecondFraction = (t % decSecondDuration) / decSecondDuration;

      // For bars, use the full canvas height
      const barCount = 4;
      const gapBetween = 10;
      const barHeight = (height - gapBetween * (barCount + 1)) / barCount;
      const startY = gapBetween;

      const drawBar = (y, progress, label, gradientColors) => {
        const x = 20;
        const barWidth = width - 40;
        const radius = 10;
        // Outline with shadow
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.1)";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, y + barHeight - radius);
        ctx.quadraticCurveTo(x + barWidth, y + barHeight, x + barWidth - radius, y + barHeight);
        ctx.lineTo(x + radius, y + barHeight);
        ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#333";
        ctx.stroke();
        ctx.restore();

        // Division markers
        const divisions = 10;
        ctx.save();
        for (let i = 1; i < divisions; i++) {
          const markerX = x + (barWidth / divisions) * i;
          ctx.beginPath();
          ctx.moveTo(markerX, y);
          ctx.lineTo(markerX, y + barHeight);
          ctx.strokeStyle = "rgba(0,0,0,0.2)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();

        // Fill
        const fillWidth = barWidth * progress;
        const grad = ctx.createLinearGradient(x, y, x + fillWidth, y);
        grad.addColorStop(0, gradientColors[0]);
        grad.addColorStop(1, gradientColors[1]);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + fillWidth - radius, y);
        ctx.quadraticCurveTo(x + fillWidth, y, x + fillWidth, y + radius);
        ctx.lineTo(x + fillWidth, y + barHeight - radius);
        ctx.quadraticCurveTo(x + fillWidth, y + barHeight, x + fillWidth - radius, y + barHeight);
        ctx.lineTo(x + radius, y + barHeight);
        ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();

        // Optional: Draw label on the bar (if desired)
        ctx.font = "bold 16px sans-serif";
        ctx.fillStyle = "#333";
        ctx.textBaseline = "middle";
        ctx.fillText(label, x + 10, y + barHeight / 2);
      };

      drawBar(startY, decHourFraction, "Decimal Hour", ["#ff7e5f", "#feb47b"]);
      drawBar(startY + (barHeight + gapBetween) * 1, deciMinuteFraction, "Deci-Minute", ["#6a11cb", "#2575fc"]);
      drawBar(startY + (barHeight + gapBetween) * 2, decMinuteFraction, "Dec Minute", ["#43cea2", "#185a9d"]);
      drawBar(startY + (barHeight + gapBetween) * 3, decSecondFraction, "Dec Second", ["#f953c6", "#b91d73"]);

      requestAnimationFrame(drawHorizontal);
    };

    drawHorizontal();
  }, []);

  // Circular Canvas Drawing (unchanged)
  useEffect(() => {
    const canvas = circularCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const toRadians = (deg) => (deg * Math.PI) / 180;

    const drawCircular = () => {
      const { width, height } = canvas;
      const cx = width / 2, cy = height / 2;
      const outerRadius = Math.min(width, height) / 2 - 20;
      ctx.clearRect(0, 0, width, height);

      const bgRadial = ctx.createRadialGradient(cx, cy, outerRadius * 0.1, cx, cy, outerRadius);
      bgRadial.addColorStop(0, "#ffffff");
      bgRadial.addColorStop(1, "#cfd9df");
      ctx.fillStyle = bgRadial;
      ctx.beginPath();
      ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
      ctx.fill();

      const now = new Date();
      const normalHours = now.getHours();
      const normalMinutes = now.getMinutes();
      const normalSeconds = now.getSeconds();
      const normalMilliseconds = now.getMilliseconds();
      const t =
        normalHours * 3600 +
        normalMinutes * 60 +
        normalSeconds +
        normalMilliseconds / 1000;

      const decHourDuration = 86400 / 10;
      const deciMinuteDuration = decHourDuration / 10;
      const decMinuteDuration = deciMinuteDuration / 10;
      const decSecondDuration = decMinuteDuration / 10;

      const decHourFraction = (t % decHourDuration) / decHourDuration;
      const deciMinuteFraction = (t % deciMinuteDuration) / deciMinuteDuration;
      const decMinuteFraction = (t % decMinuteDuration) / decMinuteDuration;
      const decSecondFraction = (t % decSecondDuration) / decSecondDuration;
      const dayPercent = ((t / 86400) * 100).toFixed(1);

      const ringWidths = { decHour: 10, deciMinute: 10, decMinute: 10, decSecond: 10 };
      const ringSpacing = 5;
      const ringOuterRadius = outerRadius - 10;

      const drawRing = (radius, progress, colorStart, colorEnd, divisions) => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "#eee";
        ctx.lineWidth = 10;
        ctx.stroke();

        const grad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
        grad.addColorStop(0, colorStart);
        grad.addColorStop(1, colorEnd);
        ctx.beginPath();
        ctx.arc(cx, cy, radius, toRadians(-90), toRadians(-90 + progress * 360));
        ctx.strokeStyle = grad;
        ctx.lineWidth = 10;
        ctx.stroke();

        ctx.save();
        for (let i = 0; i < divisions; i++) {
          const angle = toRadians(i * (360 / divisions) - 90);
          const inner = radius - 10;
          const outer = radius + 10;
          ctx.beginPath();
          ctx.moveTo(cx + inner * Math.cos(angle), cy + inner * Math.sin(angle));
          ctx.lineTo(cx + outer * Math.cos(angle), cy + outer * Math.sin(angle));
          ctx.strokeStyle = "rgba(0,0,0,0.3)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.restore();
      };

      const decHourRadius = ringOuterRadius;
      const deciMinuteRadius = decHourRadius - (ringWidths.decHour + ringSpacing);
      const decMinuteRadius = deciMinuteRadius - (ringWidths.deciMinute + ringSpacing);
      const decSecondRadius = decMinuteRadius - (ringWidths.decMinute + ringSpacing);

      drawRing(decHourRadius, decHourFraction, "#ff7e5f", "#feb47b", 10);
      drawRing(deciMinuteRadius, deciMinuteFraction, "#6a11cb", "#2575fc", 10);
      drawRing(decMinuteRadius, decMinuteFraction, "#43cea2", "#185a9d", 10);
      drawRing(decSecondRadius, decSecondFraction, "#f953c6", "#b91d73", 10);

      ctx.font = "bold 24px sans-serif";
      ctx.fillStyle = "#111";
      ctx.textAlign = "center";
      ctx.fillText(`${(t / decHourDuration).toFixed(3)} Dec Hour`, cx, cy - 20);
      ctx.fillText(`(${((t / 86400) * 100).toFixed(2)} Decihour)`, cx, cy + 20);
      ctx.fillText(`Day: ${dayPercent}%`, cx, cy + 60);
      const normalTimeStr = `${pad(normalHours)}:${pad(normalMinutes)}:${pad(normalSeconds)}`;
      ctx.fillText(`Normal: ${normalTimeStr}`, cx, cy + 100);

      requestAnimationFrame(drawCircular);
    };

    drawCircular();
  }, []);

  return (
    <div style={{ textAlign: "center", fontFamily: "sans-serif" }} ref={containerRef}>
      <h1>Decimal Clock</h1>
      <div className="digital-text">
        <h2>Day: {timeData.dayPercent}%</h2>
        <h2>Decimal: {timeData.totalDecHours} Dec Hour</h2>
        <h2>({timeData.totalDecihours} Decihour)</h2>
        <h2>Normal: {timeData.normalTimeStr}</h2>
      </div>
      <div className="canvas-wrapper">
        <canvas ref={horizontalCanvasRef} className="decimal-clock-canvas" />
        <canvas ref={circularCanvasRef} className="decimal-clock-canvas" />
      </div>
      <div>
        <h2>Conversion Table</h2>
        <table className="conversion-table">
          <thead>
            <tr>
              <th>Decimal Unit</th>
              <th>Normal Time Equivalent</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Full Day</td>
              <td>100 (100%)</td>
            </tr>
            <tr>
              <td>1 Decimal Hour</td>
              <td>8640 seconds (2h 24m 0s)</td>
            </tr>
            <tr>
              <td>1 Deci-Minute</td>
              <td>864 seconds (14m 24s)</td>
            </tr>
            <tr>
              <td>1 Dec Minute</td>
              <td>86.4 seconds (1m 26.4s)</td>
            </tr>
            <tr>
              <td>1 Dec Second</td>
              <td>8.64 seconds</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DecimalClockCanvas;

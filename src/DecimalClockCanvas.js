import React, { useRef, useEffect } from "react";

const DecimalClockCanvas = () => {
  const horizontalCanvasRef = useRef(null);
  const circularCanvasRef = useRef(null);
  const pad = (num, size = 2) => ("0".repeat(size) + num).slice(-size);

  const drawRoundedRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  // Horizontal canvas: progress bars with division markers and digital display.
  useEffect(() => {
    const canvas = horizontalCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;

    const drawHorizontal = () => {
      ctx.clearRect(0, 0, width, height);
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

      // Durations for decimal time divisions:
      // A full day = 86400 sec.
      // Decimal system: 10 Decimal Hours, each into 10 Deci-Minutes,
      // each Deci-Minute into 10 Dec Minutes, each Dec Minute into 10 Dec Seconds.
      const decHourDuration = 86400 / 10; // 8640 sec per Decimal Hour
      const deciMinuteDuration = decHourDuration / 10; // 864 sec per Deci-Minute
      const decMinuteDuration = deciMinuteDuration / 10; // 86.4 sec per Dec Minute
      const decSecondDuration = decMinuteDuration / 10; // 8.64 sec per Dec Second

      // Compute components (for progress bars)
      const decHour = Math.floor(t / decHourDuration);
      const rem1 = t % decHourDuration;
      const decHourFraction = rem1 / decHourDuration;

      const deciMinute = Math.floor(rem1 / deciMinuteDuration);
      const rem2 = rem1 % deciMinuteDuration;
      const deciMinuteFraction = rem2 / deciMinuteDuration;

      const decMinute = Math.floor(rem2 / decMinuteDuration);
      const rem3 = rem2 % decMinuteDuration;
      const decMinuteFraction = rem3 / decMinuteDuration;

      const decSecond = Math.floor(rem3 / decSecondDuration);
      const rem4 = rem3 % decSecondDuration;
      const decSecondFraction = rem4 / decSecondDuration;

      // For readability, compute total Decimal Hour as a floating value (0-10)
      const totalDecHours = t / decHourDuration; // e.g., 5.543
      // Alternatively, express the day in 100 "decihours"
      const totalDecihours = (t / 86400) * 100; // e.g., 55.43
      const dayPercent = ((t / 86400) * 100).toFixed(1);

      // Draw a bar with markers.
      const drawBar = (y, progress, label, gradientColors) => {
        const x = 50;
        const barWidth = 500;
        const barHeight = 50;
        const radius = 10;
        // Outline with shadow.
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.1)";
        ctx.shadowBlur = 10;
        drawRoundedRect(ctx, x, y, barWidth, barHeight, radius);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#333";
        ctx.stroke();
        ctx.restore();

        // Division markers (10 equal segments).
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

        // Filled progress.
        const fillWidth = barWidth * progress;
        const grad = ctx.createLinearGradient(x, y, x + fillWidth, y);
        grad.addColorStop(0, gradientColors[0]);
        grad.addColorStop(1, gradientColors[1]);
        ctx.save();
        ctx.beginPath();
        drawRoundedRect(ctx, x, y, fillWidth, barHeight, radius);
        ctx.clip();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();

        // Bar label.
        ctx.font = "bold 20px sans-serif";
        ctx.fillStyle = "#333";
        ctx.textBaseline = "middle";
        ctx.fillText(label, x + 10, y + barHeight / 2);
      };

      const startY = 50;
      const gap = 70;
      drawBar(
        startY,
        decHourFraction,
        `Dec Hour: ${decHour}`,
        ["#ff7e5f", "#feb47b"]
      );
      drawBar(
        startY + gap,
        deciMinuteFraction,
        `Deci-Min: ${deciMinute}`,
        ["#6a11cb", "#2575fc"]
      );
      drawBar(
        startY + 2 * gap,
        decMinuteFraction,
        `Dec Minute: ${decMinute}`,
        ["#43cea2", "#185a9d"]
      );
      drawBar(
        startY + 3 * gap,
        decSecondFraction,
        `Dec Second: ${decSecond}`,
        ["#f953c6", "#b91d73"]
      );

      // Digital display for readability.
      const timeAreaX = 600;
      ctx.textAlign = "left";
      ctx.font = "bold 48px sans-serif";
      ctx.fillStyle = "#111";
      ctx.fillText(`Day: ${dayPercent}%`, timeAreaX, height / 2 - 100);
      ctx.fillText(
        `Decimal: ${totalDecHours.toFixed(3)} Dec Hour`,
        timeAreaX,
        height / 2 - 40
      );
      ctx.fillText(
        `(${totalDecihours.toFixed(2)} Decihour)`,
        timeAreaX,
        height / 2 + 20
      );
      const normalTimeStr = `${pad(normalHours)}:${pad(normalMinutes)}:${pad(
        normalSeconds
      )}`;
      ctx.fillText(`Normal: ${normalTimeStr}`, timeAreaX, height / 2 + 80);

      requestAnimationFrame(drawHorizontal);
    };

    drawHorizontal();
  }, []);

  // Circular canvas: clock face with concentric rings, markers, and digital display.
  useEffect(() => {
    const canvas = circularCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    const cx = width / 2,
      cy = height / 2;
    const outerRadius = Math.min(width, height) / 2 - 20;
    const toRadians = (deg) => (deg * Math.PI) / 180;

    const drawCircular = () => {
      ctx.clearRect(0, 0, width, height);

      // Clock face background.
      const bgRadial = ctx.createRadialGradient(cx, cy, outerRadius * 0.1, cx, cy, outerRadius);
      bgRadial.addColorStop(0, "#ffffff");
      bgRadial.addColorStop(1, "#cfd9df");
      ctx.fillStyle = bgRadial;
      ctx.beginPath();
      ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
      ctx.fill();

      // Outer markers for overall clock (10 divisions for Decimal Hours).
      const divisions = 10;
      ctx.save();
      for (let i = 0; i < divisions; i++) {
        const angle = toRadians(i * (360 / divisions));
        const inner = outerRadius * 0.92;
        const outer = outerRadius;
        ctx.beginPath();
        ctx.moveTo(cx + inner * Math.cos(angle), cy + inner * Math.sin(angle));
        ctx.lineTo(cx + outer * Math.cos(angle), cy + outer * Math.sin(angle));
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      ctx.restore();

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

      // Decimal time computations.
      const decHourDuration = 86400 / 10;
      const deciMinuteDuration = decHourDuration / 10;
      const decMinuteDuration = deciMinuteDuration / 10;
      const decSecondDuration = decMinuteDuration / 10;

      const decHour = Math.floor(t / decHourDuration);
      const rem1 = t % decHourDuration;
      const decHourFraction = rem1 / decHourDuration;

      const deciMinute = Math.floor(rem1 / deciMinuteDuration);
      const rem2 = rem1 % deciMinuteDuration;
      const deciMinuteFraction = rem2 / deciMinuteDuration;

      const decMinute = Math.floor(rem2 / decMinuteDuration);
      const rem3 = rem2 % decMinuteDuration;
      const decMinuteFraction = rem3 / decMinuteDuration;

      const decSecond = Math.floor(rem3 / decSecondDuration);
      const rem4 = rem3 % decSecondDuration;
      const decSecondFraction = rem4 / decSecondDuration;

      // Readable decimal time.
      const totalDecHours = t / decHourDuration;
      const totalDecihours = (t / 86400) * 100;
      const dayPercent = ((t / 86400) * 100).toFixed(1);

      // Draw concentric rings with markers.
      const ringWidths = { decHour: 10, deciMinute: 10, decMinute: 10, decSecond: 10 };
      const ringSpacing = 5;
      const ringOuterRadius = outerRadius - 10;

      const drawRing = (radius, progress, colorStart, colorEnd, divisions) => {
        // Background ring.
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "#eee";
        ctx.lineWidth = 10;
        ctx.stroke();

        // Progress arc.
        const grad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
        grad.addColorStop(0, colorStart);
        grad.addColorStop(1, colorEnd);
        ctx.beginPath();
        ctx.arc(cx, cy, radius, toRadians(-90), toRadians(-90 + progress * 360));
        ctx.strokeStyle = grad;
        ctx.lineWidth = 10;
        ctx.stroke();

        // Division markers.
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

      // Center digital display.
      ctx.font = "bold 24px sans-serif";
      ctx.fillStyle = "#111";
      ctx.textAlign = "center";
      ctx.fillText(`${totalDecHours.toFixed(3)} Dec Hour`, cx, cy - 20);
      ctx.fillText(`(${totalDecihours.toFixed(2)} Decihour)`, cx, cy + 20);
      ctx.fillText(`Day: ${dayPercent}%`, cx, cy + 60);
      const normalTimeStr = `${pad(normalHours)}:${pad(normalMinutes)}:${pad(normalSeconds)}`;
      ctx.fillText(`Normal: ${normalTimeStr}`, cx, cy + 100);

      requestAnimationFrame(drawCircular);
    };

    drawCircular();
  }, []);

  return (
    <div style={{ textAlign: "center", fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: "20px" }}>Decimal Clock</h1>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
        <canvas
          ref={horizontalCanvasRef}
          width={1200}
          height={350}
          style={{
            margin: "20px",
            borderRadius: "15px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        />
        <canvas
          ref={circularCanvasRef}
          width={600}
          height={600}
          style={{
            margin: "20px",
            borderRadius: "50%",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        />
      </div>
      <div style={{ margin: "20px auto", width: "80%", maxWidth: "600px" }}>
        <h2>Conversion Table</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
          <thead>
            <tr style={{ backgroundColor: "#333", color: "#fff" }}>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>Decimal Unit</th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>Normal Time Equivalent</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>Full Day</td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>100 (100%)</td>
            </tr>
            <tr>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>1 Decimal Hour</td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                8640 seconds (2h 24m 0s)
              </td>
            </tr>
            <tr>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>1 Deci-Minute</td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                864 seconds (14m 24s)
              </td>
            </tr>
            <tr>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>1 Dec Minute</td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                86.4 seconds (1m 26.4s)
              </td>
            </tr>
            <tr>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>1 Dec Second</td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>8.64 seconds</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DecimalClockCanvas;

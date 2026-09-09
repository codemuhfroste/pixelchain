// A procedural placeholder face, used only when there's no real reference
// photo yet — lets the pattern generator be tried out immediately instead
// of blocking on "upload a photo first".
export function drawSampleFace(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 480;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createLinearGradient(0, 0, 0, 480);
  grad.addColorStop(0, "#dfe6ea");
  grad.addColorStop(1, "#c7d0d6");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 400, 480);

  ctx.fillStyle = "#8a6a52";
  ctx.beginPath();
  ctx.ellipse(200, 470, 120, 90, 0, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = "#e8b894";
  ctx.fillRect(170, 290, 60, 60);

  ctx.fillStyle = "#e8b894";
  ctx.beginPath();
  ctx.ellipse(200, 220, 95, 115, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#3a2a1c";
  ctx.beginPath();
  ctx.ellipse(200, 150, 100, 60, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(105, 150, 20, 90);
  ctx.fillRect(275, 150, 20, 90);

  ctx.fillStyle = "#2a2018";
  ctx.beginPath();
  ctx.ellipse(165, 215, 10, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(235, 215, 10, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#7a4a3a";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(200, 265, 26, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  return canvas.toDataURL();
}

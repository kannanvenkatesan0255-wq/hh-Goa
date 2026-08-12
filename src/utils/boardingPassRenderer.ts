/**
 * HH Goa 2026 — Master Boarding Pass Canvas Renderer
 * Renders the locked master frame with dynamic User Photo, User Name, and Date.
 */

import { getSystemDefaultDate } from './dateUtils';

export interface RenderPassOptions {
  name: string;
  date: string;
  photoImage: HTMLImageElement | null;
  photoPosition: {
    x: number; // offset X from center (-100 to 100)
    y: number; // offset Y from center (-100 to 100)
    zoom: number; // scale (1.0 to 2.5)
  };
}

export function renderBoardingPassToCanvas(
  canvas: HTMLCanvasElement,
  options: RenderPassOptions
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Master Canvas Dimensions (Exact 1600 x 960 horizontal master aspect ratio)
  const W = 1600;
  const H = 960;

  canvas.width = W;
  canvas.height = H;

  // 1. Outer Dark Background
  ctx.fillStyle = '#0d1722';
  ctx.fillRect(0, 0, W, H);

  // 2. Ticket Card Parameters
  const cardX = 35;
  const cardY = 35;
  const cardW = 1530;
  const cardH = 890;
  const cardR = 36;
  const perfX = 1180; // Perforation vertical line

  // Draw Main Ticket Cream Body (#f6f3ea)
  ctx.save();
  ctx.beginPath();
  drawRoundedRectPath(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.fillStyle = '#f6f3ea';
  ctx.fill();

  // Card paper border
  ctx.strokeStyle = '#e0d8ca';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // 3. Ticket Cutout Notches (Top & Bottom semi-circles at perforation)
  const notchR = 26;
  ctx.fillStyle = '#0d1722';

  // Top notch
  ctx.beginPath();
  ctx.arc(perfX, cardY, notchR, 0, Math.PI);
  ctx.fill();

  // Bottom notch
  ctx.beginPath();
  ctx.arc(perfX, cardY + cardH, notchR, Math.PI, 0);
  ctx.fill();

  // 4. Perforation Dashed Line
  ctx.save();
  ctx.beginPath();
  ctx.setLineDash([10, 10]);
  ctx.moveTo(perfX, cardY + notchR + 8);
  ctx.lineTo(perfX, cardY + cardH - notchR - 8);
  ctx.strokeStyle = '#095755';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // 5. Left Vertical Teal Banner (#FrameInGoa)
  const bannerX = 35;
  const bannerY = 200;
  const bannerW = 68;
  const bannerH = 520;

  ctx.save();
  ctx.fillStyle = '#095755';
  ctx.beginPath();
  // Angled polygon banner
  ctx.moveTo(bannerX, bannerY + 24);
  ctx.lineTo(bannerX + bannerW, bannerY);
  ctx.lineTo(bannerX + bannerW, bannerY + bannerH);
  ctx.lineTo(bannerX, bannerY + bannerH - 24);
  ctx.closePath();
  ctx.fill();

  // Rotated Text: #FrameInGoa
  ctx.save();
  ctx.translate(bannerX + bannerW / 2 + 2, bannerY + bannerH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 24px "Plus Jakarta Sans", sans-serif, system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '4px';
  ctx.fillText('#FrameInGoa', 0, 0);
  ctx.restore();

  // Top Airplane icon on Banner
  drawAirplaneIcon(ctx, bannerX + bannerW / 2, bannerY + 45, 20, '#ffffff', -Math.PI / 4);

  // Globe Icon on Banner
  drawGlobeIcon(ctx, bannerX + bannerW / 2, bannerY + bannerH - 55, 14, '#ffffff');

  // Bottom Hazard Stripes (Angled lines)
  const stripeY = bannerY + bannerH - 4;
  ctx.beginPath();
  ctx.moveTo(bannerX, stripeY);
  ctx.lineTo(bannerX + bannerW, stripeY);
  ctx.lineTo(bannerX + bannerW, stripeY + 65);
  ctx.lineTo(bannerX, stripeY + 85);
  ctx.closePath();
  ctx.clip();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  for (let i = -50; i < 150; i += 22) {
    ctx.beginPath();
    ctx.moveTo(bannerX + i, stripeY + 100);
    ctx.lineTo(bannerX + i + 65, stripeY - 20);
    ctx.stroke();
  }
  ctx.restore();

  // 6. Top Left Header ("BOARDING PASS ..........")
  drawAirplaneIcon(ctx, 130, 108, 22, '#095755', 0);

  ctx.fillStyle = '#092130';
  ctx.font = '800 20px "Plus Jakarta Sans", sans-serif, system-ui';
  ctx.textAlign = 'left';
  ctx.letterSpacing = '3px';
  ctx.fillText('BOARDING PASS  . . . . . . . . .', 168, 115);

  // 7. PHOTO WINDOW (Left Center Subject Photo)
  const photoX = 135;
  const photoY = 185;
  const photoW = 390;
  const photoH = 480;
  const photoRadius = 42;

  // Outer Teal Frame Line for Photo
  ctx.save();
  ctx.beginPath();
  drawRoundedRectPath(ctx, photoX, photoY, photoW, photoH, photoRadius);
  ctx.strokeStyle = '#095755';
  ctx.lineWidth = 8;
  ctx.stroke();

  // Clip area inside Photo Frame
  const innerPad = 4;
  ctx.beginPath();
  drawRoundedRectPath(
    ctx,
    photoX + innerPad,
    photoY + innerPad,
    photoW - innerPad * 2,
    photoH - innerPad * 2,
    photoRadius - 2
  );
  ctx.clip();

  if (options.photoImage && options.photoImage.complete && options.photoImage.naturalWidth > 0) {
    // Render uploaded user photo with cover scaling + user pan/zoom
    const img = options.photoImage;
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    const targetW = photoW - innerPad * 2;
    const targetH = photoH - innerPad * 2;

    // Cover math
    const scale = Math.max(targetW / imgW, targetH / imgH) * options.photoPosition.zoom;
    const renderW = imgW * scale;
    const renderH = imgH * scale;

    const centerX = photoX + innerPad + targetW / 2;
    const centerY = photoY + innerPad + targetH / 2;

    const drawX = centerX - renderW / 2 + options.photoPosition.x;
    const drawY = centerY - renderH / 2 + options.photoPosition.y;

    ctx.drawImage(img, drawX, drawY, renderW, renderH);
  } else {
    // Clean empty state placeholder when no photo uploaded yet
    ctx.fillStyle = '#ece6d8';
    ctx.fillRect(photoX, photoY, photoW, photoH);

    // Subtle background circle
    ctx.fillStyle = '#095755';
    ctx.globalAlpha = 0.08;
    ctx.beginPath();
    ctx.arc(photoX + photoW / 2, photoY + photoH / 2 - 20, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Avatar silhouette icon
    ctx.fillStyle = '#095755';
    ctx.beginPath();
    ctx.arc(photoX + photoW / 2, photoY + photoH / 2 - 40, 48, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(photoX + photoW / 2, photoY + photoH / 2 + 70, 80, Math.PI, 0);
    ctx.fill();

    // Helper text
    ctx.fillStyle = '#092130';
    ctx.font = '800 16px "Plus Jakarta Sans", sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '1px';
    ctx.fillText('UPLOAD YOUR PHOTO', photoX + photoW / 2, photoY + photoH - 50);
  }
  ctx.restore();

  // 8. CENTER MAIN SECTION
  const centerLeft = 575;

  // "DESTINATION" line with airplane + dashed vector
  ctx.fillStyle = '#095755';
  ctx.font = '800 16px "Plus Jakarta Sans", sans-serif, system-ui';
  ctx.textAlign = 'left';
  ctx.letterSpacing = '3px';
  ctx.fillText('DESTINATION', centerLeft, 185);

  drawAirplaneIcon(ctx, centerLeft + 185, 180, 14, '#092130', 0);

  ctx.save();
  ctx.beginPath();
  ctx.setLineDash([4, 4]);
  ctx.moveTo(centerLeft + 210, 180);
  ctx.lineTo(centerLeft + 420, 180);
  ctx.strokeStyle = '#095755';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // Giant Main Headline Typography
  // "HACKER"
  ctx.fillStyle = '#081d2a';
  ctx.font = '900 86px "Plus Jakarta Sans", sans-serif, system-ui';
  ctx.textAlign = 'left';
  ctx.letterSpacing = '2px';
  ctx.fillText('HACKER', centerLeft, 270);

  // "HOUSE"
  ctx.fillText('HOUSE', centerLeft, 355);

  // "GOA" with Custom Palm Tree Triangle 'A'
  ctx.fillStyle = '#095755';
  ctx.font = '900 98px "Plus Jakarta Sans", sans-serif, system-ui';
  ctx.fillText('GO', centerLeft, 455);

  // Custom 'A' with palm tree silhouette
  const goaA_X = centerLeft + 230;
  const goaA_Y = 455;
  drawCustomPalmA(ctx, goaA_X, goaA_Y - 74, 88, 82, '#095755', '#f6f3ea');

  // "///////  2026  ///////"
  ctx.fillStyle = '#095755';
  ctx.font = '800 28px "Plus Jakarta Sans", sans-serif, system-ui';
  ctx.textAlign = 'left';
  ctx.letterSpacing = '2px';
  ctx.fillText('////////   2026   ////////', centerLeft, 520);

  // Tagline: "BUILD  •  CONNECT  •  EXPLORE"
  ctx.fillStyle = '#081d2a';
  ctx.font = '800 18px "Plus Jakarta Sans", sans-serif, system-ui';
  ctx.letterSpacing = '4px';
  ctx.fillText('BUILD   •   CONNECT   •   EXPLORE', centerLeft, 568);

  // 9. BOTTOM CENTER CARD (Passenger & Journey Details)
  const cardBoxX = 460;
  const cardBoxY = 640;
  const cardBoxW = 680;
  const cardBoxH = 155;
  const cardBoxR = 20;

  ctx.save();
  ctx.beginPath();
  drawRoundedRectPath(ctx, cardBoxX, cardBoxY, cardBoxW, cardBoxH, cardBoxR);
  ctx.fillStyle = '#fcfbf7';
  ctx.fill();
  ctx.strokeStyle = '#cad8d4';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Airplane Icon in card
  drawAirplaneIcon(ctx, cardBoxX + 48, cardBoxY + 78, 26, '#095755', -Math.PI / 4);

  // Divider inside card
  ctx.beginPath();
  ctx.moveTo(cardBoxX + 340, cardBoxY + 22);
  ctx.lineTo(cardBoxX + 340, cardBoxY + cardBoxH - 22);
  ctx.strokeStyle = '#d2dfdb';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Passenger Name / Journey Text
  const rawName = options.name.trim();
  const formattedName = (rawName || 'PASSENGER NAME').toUpperCase();

  ctx.fillStyle = '#556875';
  ctx.font = '800 12px "Plus Jakarta Sans", sans-serif, system-ui';
  ctx.letterSpacing = '2px';
  ctx.fillText('PASSENGER NAME', cardBoxX + 88, cardBoxY + 45);

  // SMART TEXT-FIT ALGORITHM FOR LONG USER NAMES
  // Safe fixed bounding box: start = cardBoxX + 88, max width before divider at cardBoxX + 340
  const nameX = cardBoxX + 88;
  const maxNameWidth = 238;
  const maxFontSize = 26;
  const minFontSize = 11;

  ctx.fillStyle = '#081d2a';

  let currentFontSize = maxFontSize;
  let currentLetterSpacing = 1;

  const fontSpec = (size: number) => `900 ${size}px "Plus Jakarta Sans", sans-serif, system-ui`;
  
  ctx.font = fontSpec(currentFontSize);
  ctx.letterSpacing = `${currentLetterSpacing}px`;

  let measuredWidth = ctx.measureText(formattedName).width;

  // 1. Scaled font-size reduction loop
  while (measuredWidth > maxNameWidth && currentFontSize > minFontSize) {
    currentFontSize -= 0.5;
    ctx.font = fontSpec(currentFontSize);
    measuredWidth = ctx.measureText(formattedName).width;
  }

  // 2. Reduce letter spacing if still slightly wide
  if (measuredWidth > maxNameWidth && currentFontSize <= minFontSize) {
    currentLetterSpacing = 0;
    ctx.letterSpacing = '0px';
    measuredWidth = ctx.measureText(formattedName).width;
  }

  // 3. Multi-line or graceful truncation if extremely long
  if (measuredWidth > maxNameWidth) {
    const words = formattedName.split(' ');
    if (words.length > 1) {
      let line1 = '';
      let line2 = '';
      const mid = Math.ceil(words.length / 2);
      for (let i = 0; i < words.length; i++) {
        if (i < mid) line1 += (line1 ? ' ' : '') + words[i];
        else line2 += (line2 ? ' ' : '') + words[i];
      }

      ctx.font = fontSpec(13);
      ctx.letterSpacing = '0.5px';
      const w1 = ctx.measureText(line1).width;
      const w2 = ctx.measureText(line2).width;

      if (w1 <= maxNameWidth && w2 <= maxNameWidth) {
        ctx.fillText(line1, nameX, cardBoxY + 68);
        ctx.fillText(line2, nameX, cardBoxY + 84);
      } else {
        let trunc = formattedName;
        ctx.font = fontSpec(11);
        while (ctx.measureText(trunc + '...').width > maxNameWidth && trunc.length > 0) {
          trunc = trunc.slice(0, -1);
        }
        ctx.fillText(trunc + '...', nameX, cardBoxY + 78);
      }
    } else {
      let trunc = formattedName;
      ctx.font = fontSpec(11);
      while (ctx.measureText(trunc + '...').width > maxNameWidth && trunc.length > 0) {
        trunc = trunc.slice(0, -1);
      }
      ctx.fillText(trunc + '...', nameX, cardBoxY + 78);
    }
  } else {
    ctx.fillText(formattedName, nameX, cardBoxY + 78);
  }

  ctx.fillStyle = '#095755';
  ctx.font = '800 13px "Plus Jakarta Sans", sans-serif, system-ui';
  ctx.letterSpacing = '1.5px';
  ctx.fillText('YOUR JOURNEY TO INNOVATION STARTS HERE.', cardBoxX + 88, cardBoxY + 118);

  // Calendar Icon in card (Right section)
  drawCalendarIcon(ctx, cardBoxX + 375, cardBoxY + 72, 22, '#095755');

  // Date & Location Text
  const formattedDate = (options.date.trim() || getSystemDefaultDate()).toUpperCase();

  ctx.fillStyle = '#081d2a';
  ctx.font = '800 20px "Plus Jakarta Sans", sans-serif, system-ui';
  ctx.letterSpacing = '1px';
  ctx.fillText(formattedDate, cardBoxX + 415, cardBoxY + 70);

  ctx.fillStyle = '#556875';
  ctx.font = '800 15px "Plus Jakarta Sans", sans-serif, system-ui';
  ctx.letterSpacing = '2px';
  ctx.fillText('GOA, INDIA', cardBoxX + 415, cardBoxY + 104);

  ctx.restore();

  // 10. BOTTOM LEFT BARCODE
  const codeX = 135;
  const codeY = 725;
  const codeW = 290;
  const codeH = 80;

  drawCrispBarcode(ctx, codeX, codeY, codeW, codeH, '#081d2a');

  // 11. RIGHT TICKET STUB (Right of perforation at x = 1180)
  const stubCenterX = 1375;

  // HH GOA Monogram Logo
  drawHHGoaLogo(ctx, stubCenterX, 130);

  ctx.fillStyle = '#081d2a';
  ctx.font = '800 16px "Plus Jakarta Sans", sans-serif, system-ui';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '2px';
  ctx.fillText('HACKER HOUSE GOA', stubCenterX, 310);

  // "—— 2026 ——"
  ctx.fillStyle = '#556875';
  ctx.font = '700 16px "Plus Jakarta Sans", sans-serif, system-ui';
  ctx.letterSpacing = '3px';
  ctx.fillText('——  2026  ——', stubCenterX, 342);

  // Divider line
  ctx.beginPath();
  ctx.moveTo(1225, 375);
  ctx.lineTo(1525, 375);
  ctx.strokeStyle = '#d5e2de';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Detail 1: FROM EVERYWHERE
  drawAirplaneIcon(ctx, 1240, 442, 20, '#081d2a', 0);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#556875';
  ctx.font = '800 12px "Plus Jakarta Sans", sans-serif, system-ui';
  ctx.letterSpacing = '2px';
  ctx.fillText('FROM', 1275, 432);
  ctx.fillStyle = '#081d2a';
  ctx.font = '800 18px "Plus Jakarta Sans", sans-serif, system-ui';
  ctx.letterSpacing = '1px';
  ctx.fillText('EVERYWHERE', 1275, 454);

  // Divider
  ctx.beginPath();
  ctx.moveTo(1225, 495);
  ctx.lineTo(1525, 495);
  ctx.strokeStyle = '#e6eeea';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Detail 2: TO GOA, INDIA
  drawMapPinIcon(ctx, 1240, 560, 20, '#081d2a');
  ctx.fillStyle = '#556875';
  ctx.font = '800 12px "Plus Jakarta Sans", sans-serif, system-ui';
  ctx.letterSpacing = '2px';
  ctx.fillText('TO', 1275, 550);
  ctx.fillStyle = '#081d2a';
  ctx.font = '800 18px "Plus Jakarta Sans", sans-serif, system-ui';
  ctx.letterSpacing = '1px';
  ctx.fillText('GOA, INDIA', 1275, 572);

  // Divider
  ctx.beginPath();
  ctx.moveTo(1225, 612);
  ctx.lineTo(1525, 612);
  ctx.strokeStyle = '#e6eeea';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Detail 3: DATE
  drawCalendarIcon(ctx, 1240, 678, 20, '#081d2a');
  ctx.fillStyle = '#556875';
  ctx.font = '800 12px "Plus Jakarta Sans", sans-serif, system-ui';
  ctx.letterSpacing = '2px';
  ctx.fillText('DATE', 1275, 668);
  ctx.fillStyle = '#081d2a';
  ctx.font = '800 18px "Plus Jakarta Sans", sans-serif, system-ui';
  ctx.letterSpacing = '1px';
  ctx.fillText(formattedDate, 1275, 690);

  // Bottom Line & Arrow Callout
  ctx.beginPath();
  ctx.moveTo(1225, 745);
  ctx.lineTo(1525, 745);
  ctx.strokeStyle = '#095755';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Arrow '>'
  ctx.fillStyle = '#095755';
  ctx.font = '900 24px "Plus Jakarta Sans", sans-serif, system-ui';
  ctx.fillText('>', 1230, 788);

  // Callout text
  ctx.font = '800 15px "Plus Jakarta Sans", sans-serif, system-ui';
  ctx.letterSpacing = '1px';
  ctx.fillText('READY TO BUILD', 1260, 778);
  ctx.fillText('THE FUTURE?', 1260, 798);
}

// --- HELPER DRAWING FUNCTIONS ---

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
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
}

function drawAirplaneIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string,
  angleRad: number = 0
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angleRad);
  ctx.fillStyle = color;
  ctx.beginPath();
  // Clean airplane shape
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.3, -size * 0.2);
  ctx.lineTo(size, size * 0.3);
  ctx.lineTo(size, size * 0.5);
  ctx.lineTo(size * 0.25, size * 0.2);
  ctx.lineTo(size * 0.2, size * 0.7);
  ctx.lineTo(size * 0.45, size * 0.9);
  ctx.lineTo(size * 0.45, size);
  ctx.lineTo(0, size * 0.8);
  ctx.lineTo(-size * 0.45, size);
  ctx.lineTo(-size * 0.45, size * 0.9);
  ctx.lineTo(-size * 0.2, size * 0.7);
  ctx.lineTo(-size * 0.25, size * 0.2);
  ctx.lineTo(-size, size * 0.5);
  ctx.lineTo(-size, size * 0.3);
  ctx.lineTo(-size * 0.3, -size * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawGlobeIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  // Circle
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Equator line
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx + r, cy);
  ctx.stroke();

  // Ellipse vertical
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.5, r, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawCalendarIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.5;

  const w = size * 1.2;
  const h = size * 1.1;
  const x = cx - w / 2;
  const y = cy - h / 2;

  // Calendar box
  ctx.beginPath();
  drawRoundedRectPath(ctx, x, y, w, h, 4);
  ctx.stroke();

  // Header line
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.3);
  ctx.lineTo(x + w, y + h * 0.3);
  ctx.stroke();

  // Binder rings
  ctx.fillRect(x + w * 0.25 - 2, y - 3, 4, 6);
  ctx.fillRect(x + w * 0.75 - 2, y - 3, 4, 6);

  // Grid dots inside
  ctx.fillRect(x + w * 0.3 - 2, y + h * 0.55, 4, 4);
  ctx.fillRect(x + w * 0.7 - 2, y + h * 0.55, 4, 4);
  ctx.fillRect(x + w * 0.3 - 2, y + h * 0.8 - 2, 4, 4);
  ctx.fillRect(x + w * 0.7 - 2, y + h * 0.8 - 2, 4, 4);

  ctx.restore();
}

function drawMapPinIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy - size * 0.3, size * 0.5, Math.PI, 0);
  ctx.lineTo(cx, cy + size * 0.6);
  ctx.closePath();
  ctx.fill();

  // Inner cutout dot
  ctx.fillStyle = '#f6f3ea';
  ctx.beginPath();
  ctx.arc(cx, cy - size * 0.3, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCustomPalmA(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fgColor: string,
  bgColor: string
): void {
  ctx.save();
  // Draw Triangle 'A'
  ctx.fillStyle = fgColor;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();

  // Inner Cutout Palm Tree Silhouette
  ctx.fillStyle = bgColor;

  // Trunk
  ctx.beginPath();
  ctx.moveTo(x + w / 2 - 4, y + h);
  ctx.quadraticCurveTo(x + w / 2, y + h * 0.5, x + w / 2 - 2, y + h * 0.45);
  ctx.lineTo(x + w / 2 + 4, y + h * 0.45);
  ctx.quadraticCurveTo(x + w / 2 + 2, y + h * 0.5, x + w / 2 + 6, y + h);
  ctx.closePath();
  ctx.fill();

  // Palm Leaves
  const lx = x + w / 2;
  const ly = y + h * 0.45;

  ctx.beginPath();
  // Left leaf
  ctx.moveTo(lx, ly);
  ctx.quadraticCurveTo(lx - 18, ly - 10, lx - 24, ly + 6);
  ctx.quadraticCurveTo(lx - 12, ly - 2, lx, ly);

  // Right leaf
  ctx.moveTo(lx, ly);
  ctx.quadraticCurveTo(lx + 18, ly - 10, lx + 24, ly + 6);
  ctx.quadraticCurveTo(lx + 12, ly - 2, lx, ly);

  // Top leaf
  ctx.moveTo(lx, ly);
  ctx.quadraticCurveTo(lx - 8, ly - 22, lx, ly - 25);
  ctx.quadraticCurveTo(lx + 8, ly - 22, lx, ly);

  ctx.fill();
  ctx.restore();
}

function drawHHGoaLogo(ctx: CanvasRenderingContext2D, cx: number, topY: number): void {
  ctx.save();

  // Draw HH Monogram
  const w = 120;
  const h = 100;
  const x = cx - w / 2;
  const y = topY;

  // Left H
  ctx.fillStyle = '#081d2a';
  ctx.fillRect(x, y, 22, h);
  ctx.fillRect(x + 38, y, 22, h);
  ctx.fillRect(x, y + 42, 60, 18);

  // Right H (Teal accent)
  ctx.fillStyle = '#095755';
  ctx.fillRect(x + 62, y, 22, h);
  ctx.fillRect(x + 100, y, 22, h);
  ctx.fillRect(x + 62, y + 42, 60, 18);

  // "G O A" text below monogram
  ctx.font = '900 36px "Plus Jakarta Sans", sans-serif, system-ui';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '10px';
  ctx.fillText('GOA', cx, y + 148);

  ctx.restore();
}

function drawCrispBarcode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
): void {
  ctx.save();
  ctx.fillStyle = color;

  // Generate deterministic barcode pattern
  const barPattern = [
    3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2, 1, 4, 1, 2, 3, 1, 1,
    2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2, 1, 4, 1, 2
  ];

  let currentX = x;
  let isBar = true;

  for (let i = 0; i < barPattern.length; i++) {
    const width = barPattern[i] * 3.5;
    if (isBar && currentX + width <= x + w) {
      ctx.fillRect(currentX, y, width, h);
    }
    currentX += width;
    isBar = !isBar;
  }

  ctx.restore();
}

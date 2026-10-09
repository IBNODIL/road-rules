import * as THREE from "three";
import type { SignType } from "@/lib/types";

const S = 512;
const RED = "#d4202a";
const WHITE = "#ffffff";
const BLUE = "#1459b8";
const YELLOW = "#ffc61a";
const BLACK = "#111111";

type P = [number, number];

function poly(ctx: CanvasRenderingContext2D, pts: P[]) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}

function scale(pts: P[], k: number, cx: number, cy: number): P[] {
  return pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);
}

function ngon(n: number, r: number, rot: number): P[] {
  return Array.from({ length: n }, (_, i) => {
    const a = rot + (i / n) * Math.PI * 2;
    return [256 + Math.cos(a) * r, 256 + Math.sin(a) * r] as P;
  });
}

function circle(ctx: CanvasRenderingContext2D, r: number, fill: string) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(256, 256, r, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

export function makeSignTexture(type: SignType): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  switch (type) {
    case "stop": {
      const a = Math.PI / 8;
      poly(ctx, ngon(8, 250, a));
      ctx.fillStyle = WHITE;
      ctx.fill();
      poly(ctx, ngon(8, 228, a));
      ctx.fillStyle = RED;
      ctx.fill();
      ctx.fillStyle = WHITE;
      ctx.font = "bold 150px sans-serif";
      ctx.fillText("STOP", 256, 262);
      break;
    }
    case "yield": {
      const tri: P[] = [
        [24, 80],
        [488, 80],
        [256, 484],
      ];
      poly(ctx, tri);
      ctx.fillStyle = RED;
      ctx.lineWidth = 36;
      ctx.strokeStyle = RED;
      ctx.stroke();
      ctx.fill();
      poly(ctx, scale(tri, 0.58, 256, 215));
      ctx.fillStyle = WHITE;
      ctx.fill();
      break;
    }
    case "noentry": {
      circle(ctx, 250, WHITE);
      circle(ctx, 232, RED);
      roundRect(ctx, 76, 214, 360, 84, 8, WHITE);
      break;
    }
    case "speed50": {
      circle(ctx, 250, RED);
      circle(ctx, 192, WHITE);
      ctx.fillStyle = BLACK;
      ctx.font = "bold 230px sans-serif";
      ctx.fillText("50", 256, 272);
      break;
    }
    case "priority": {
      const d: P[] = [
        [256, 6],
        [506, 256],
        [256, 506],
        [6, 256],
      ];
      poly(ctx, d);
      ctx.fillStyle = BLACK;
      ctx.lineWidth = 24;
      ctx.strokeStyle = BLACK;
      ctx.stroke();
      ctx.fill();
      poly(ctx, scale(d, 0.94, 256, 256));
      ctx.fillStyle = WHITE;
      ctx.fill();
      poly(ctx, scale(d, 0.74, 256, 256));
      ctx.fillStyle = YELLOW;
      ctx.fill();
      break;
    }
    case "oneway": {
      roundRect(ctx, 10, 10, 492, 492, 56, WHITE);
      roundRect(ctx, 30, 30, 452, 452, 40, BLUE);
      ctx.fillStyle = WHITE;
      poly(ctx, [
        [166, 250],
        [256, 90],
        [346, 250],
      ]);
      ctx.fill();
      ctx.fillRect(220, 240, 72, 200);
      break;
    }
    case "noparking": {
      circle(ctx, 250, RED);
      circle(ctx, 214, BLUE);
      ctx.save();
      ctx.beginPath();
      ctx.arc(256, 256, 214, 0, Math.PI * 2);
      ctx.clip();
      ctx.strokeStyle = RED;
      ctx.lineWidth = 44;
      ctx.lineCap = "butt";
      ctx.beginPath();
      ctx.moveTo(60, 60);
      ctx.lineTo(452, 452);
      ctx.moveTo(452, 60);
      ctx.lineTo(60, 452);
      ctx.stroke();
      ctx.restore();
      break;
    }
    case "crossing": {
      roundRect(ctx, 10, 10, 492, 492, 56, WHITE);
      roundRect(ctx, 30, 30, 452, 452, 40, BLUE);
      const tri: P[] = [
        [256, 70],
        [440, 410],
        [72, 410],
      ];
      poly(ctx, tri);
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 20;
      ctx.stroke();
      ctx.fill();
      ctx.strokeStyle = BLACK;
      ctx.fillStyle = BLACK;
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.arc(256, 196, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(256, 232);
      ctx.lineTo(256, 316);
      ctx.moveTo(214, 276);
      ctx.lineTo(256, 250);
      ctx.lineTo(300, 276);
      ctx.moveTo(256, 316);
      ctx.lineTo(224, 378);
      ctx.moveTo(256, 316);
      ctx.lineTo(292, 378);
      ctx.stroke();
      break;
    }
    case "warning": {
      const tri: P[] = [
        [256, 24],
        [490, 440],
        [22, 440],
      ];
      poly(ctx, tri);
      ctx.fillStyle = RED;
      ctx.strokeStyle = RED;
      ctx.lineWidth = 36;
      ctx.stroke();
      ctx.fill();
      poly(ctx, scale(tri, 0.64, 256, 301));
      ctx.fillStyle = WHITE;
      ctx.fill();
      ctx.fillStyle = BLACK;
      ctx.font = "bold 220px sans-serif";
      ctx.fillText("!", 256, 330);
      break;
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

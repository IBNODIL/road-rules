import { ImageResponse } from "next/og";

export const alt = "Roadwise, learn traffic rules in 3D";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#000",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          fontSize: 84,
          fontWeight: 600,
        }}
      >
        <div style={{ fontSize: 36, color: "#FFB800", marginBottom: 24 }}>Roadwise</div>
        <div>See every road rule in 3D before you face it.</div>
      </div>
    ),
    size,
  );
}

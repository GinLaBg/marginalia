/**
 * Couverture typographique générée — utilisée quand aucune image n'est disponible.
 * La couleur est dérivée du titre et de l'auteur via un hash, donc stable
 * pour un même livre sans dépendre d'un visuel tiers.
 */

const PALETTES: { bg: string; text: string; accent: string }[] = [
  { bg: "#1a1a2e", text: "#e8e4d9", accent: "#8b7355" },
  { bg: "#2d1b1b", text: "#f0e6d3", accent: "#c97c4a" },
  { bg: "#1b2d1b", text: "#e8f0e8", accent: "#5a8a5a" },
  { bg: "#1b1b2d", text: "#e8e8f0", accent: "#6b6baa" },
  { bg: "#2d2d1b", text: "#f0f0e0", accent: "#a0a050" },
  { bg: "#2d1b2d", text: "#f0e0f0", accent: "#9060a0" },
  { bg: "#1b2d2d", text: "#e0f0f0", accent: "#408080" },
  { bg: "#0f1923", text: "#d4cfc7", accent: "#7c9ab5" },
  { bg: "#1e1208", text: "#f2ead8", accent: "#c4924a" },
  { bg: "#0d1f0d", text: "#dff2df", accent: "#4a9a4a" },
];

function hashBook(title: string, author: string): number {
  const seed = `${title.trim().toLowerCase()}::${author.trim().toLowerCase()}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getPalette(title: string, author: string) {
  return PALETTES[hashBook(title, author) % PALETTES.length];
}

/** Découpe le titre en lignes de max ~18 caractères */
function splitTitle(title: string): string[] {
  const words = title.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > 18 && current) {
      lines.push(current.trim());
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines.slice(0, 4); // max 4 lignes
}

interface GeneratedCoverProps {
  title: string;
  author: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function GeneratedCover({
  title,
  author,
  className = "",
  size = "md",
}: GeneratedCoverProps) {
  const palette = getPalette(title, author);
  const titleLines = splitTitle(title);
  const patternId = `lines-${hashBook(title, author)}`;
  const authorLabel = author
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .join(" ");

  const fontSizes = {
    sm: { title: "9px",  author: "7px",  ornament: "14px" },
    md: { title: "13px", author: "10px", ornament: "20px" },
    lg: { title: "18px", author: "13px", ornament: "28px" },
  };
  const fs = fontSizes[size];

  return (
    <div
      className={`w-full h-full flex flex-col ${className}`}
      style={{ backgroundColor: palette.bg, position: "relative", overflow: "hidden" }}
    >
      {/* Motif décoratif — lignes fines */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={patternId} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M0 20 L20 0" stroke={palette.text} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>

      {/* Bordure intérieure */}
      <div
        style={{
          position: "absolute",
          inset: "6%",
          border: `1px solid ${palette.accent}`,
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />

      {/* Contenu centré */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          padding: "12% 10%",
          gap: "8%",
          textAlign: "center",
        }}
      >
        {/* Ornement */}
        <div
          style={{
            color: palette.accent,
            fontSize: fs.ornament,
            lineHeight: 1,
            opacity: 0.7,
            fontFamily: "Georgia, serif",
          }}
        >
          ◆
        </div>

        {/* Titre */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {titleLines.map((line, i) => (
            <div
              key={i}
              style={{
                color: palette.text,
                fontSize: fs.title,
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: "italic",
                lineHeight: 1.25,
                letterSpacing: "0.02em",
              }}
            >
              {line}
            </div>
          ))}
        </div>

        {/* Séparateur */}
        <div
          style={{
            width: "30%",
            height: "1px",
            backgroundColor: palette.accent,
            opacity: 0.6,
          }}
        />

        {/* Auteur */}
        <div
          style={{
            color: palette.text,
            fontSize: fs.author,
            fontFamily: "Georgia, serif",
            opacity: 0.7,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {authorLabel}
        </div>
      </div>
    </div>
  );
}

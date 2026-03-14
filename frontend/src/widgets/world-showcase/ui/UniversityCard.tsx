import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Chip
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import type { UniversityListItem } from "@/shared/types/contracts";

const ACCENT_COLORS = [
  { from: "#7c3aed", to: "#06b6d4" },
  { from: "#ec4899", to: "#f97316" },
  { from: "#10b981", to: "#06b6d4" },
  { from: "#f59e0b", to: "#ec4899" },
  { from: "#3b82f6", to: "#8b5cf6" },
  { from: "#06b6d4", to: "#10b981" },
  { from: "#8b5cf6", to: "#ec4899" },
  { from: "#f43f5e", to: "#f97316" }
];

function getAccent(id: number) {
  return ACCENT_COLORS[id % ACCENT_COLORS.length];
}

interface Props {
  item: UniversityListItem;
  index: number;
}

export function UniversityCard({ item, index }: Props) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const accent = getAccent(item.id);
  // Use Wikipedia image if available, else Unsplash search by name (better than random picsum)
  const primarySrc = item.imageUrl ?? null;
  const fallbackSrc = `https://source.unsplash.com/640x320/?university,campus,${encodeURIComponent(item.name)}`;

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        height: "100%",
        animation: "cardIn 0.5s ease both",
        animationDelay: `${Math.min(index * 0.05, 0.7)}s`,
        "@keyframes cardIn": {
          from: { opacity: 0, transform: "translateY(28px)" },
          to: { opacity: 1, transform: "translateY(0)" }
        }
      }}
    >
      <Card
        sx={{
          height: "100%",
          background: hovered
            ? "rgba(255,255,255,0.07)"
            : "rgba(255,255,255,0.04)",
          border: hovered
            ? `1px solid rgba(${accent.from === "#7c3aed" ? "167,139,250" : "255,255,255"},0.25)`
            : "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          overflow: "hidden",
          transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease, background 0.3s ease, border 0.3s ease",
          transform: hovered ? "translateY(-8px) scale(1.015)" : "translateY(0) scale(1)",
          boxShadow: hovered
            ? `0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.15)`
            : "0 4px 20px rgba(0,0,0,0.3)"
        }}
      >
        <CardActionArea
          component={RouterLink}
          to={`/universities/${item.id}`}
          sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}
        >
          {/* Image with Ken Burns effect */}
          <Box sx={{ position: "relative", height: 200, overflow: "hidden" }}>
            {!imgError ? (
              <Box
                component="img"
                src={primarySrc ?? fallbackSrc}
                alt={item.name}
                loading="lazy"
                onError={() => setImgError(true)}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 8s ease",
                  transform: hovered ? "scale(1.12) translate(-2%, -1%)" : "scale(1)"
                }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  background: `linear-gradient(135deg, ${accent.from} 0%, ${accent.to} 100%)`
                }}
              />
            )}

            {/* Gradient overlay */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(180deg, transparent 30%, rgba(15,10,30,0.85) 100%)`,
                transition: "opacity 0.3s ease"
              }}
            />

            {/* Accent bar top */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg, ${accent.from}, ${accent.to})`,
                opacity: hovered ? 1 : 0,
                transition: "opacity 0.3s ease"
              }}
            />

            {/* Progress bar (video simulation) */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                height: 2,
                background: `linear-gradient(90deg, ${accent.from}, ${accent.to})`,
                borderRadius: "0 2px 2px 0",
                ...(hovered
                  ? {
                      animation: "vp 8s linear forwards",
                      "@keyframes vp": { from: { width: "0%" }, to: { width: "100%" } }
                    }
                  : { width: 0 })
              }}
            />

            {/* Flag */}
            <Box
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                transition: "transform 0.3s ease",
                transform: hovered ? "scale(1.1)" : "scale(1)"
              }}
            >
              <Box
                component="img"
                src={`https://flagcdn.com/w40/${item.countryCode.toLowerCase()}.png`}
                alt={item.countryName}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                sx={{
                  height: 20,
                  borderRadius: "3px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.6)",
                  display: "block"
                }}
              />
            </Box>

            {/* Preview badge */}
            <Box
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                bgcolor: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(8px)",
                color: "#fff",
                px: 1,
                py: 0.25,
                borderRadius: "50px",
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                border: "1px solid rgba(255,255,255,0.15)",
                opacity: hovered ? 1 : 0,
                transform: hovered ? "translateY(0)" : "translateY(-8px)",
                transition: "opacity 0.25s ease, transform 0.25s ease"
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: "#ef4444",
                  animation: hovered ? "pulse 1s ease infinite" : "none",
                  "@keyframes pulse": {
                    "0%,100%": { opacity: 1 },
                    "50%": { opacity: 0.4 }
                  }
                }}
              />
              LIVE PREVIEW
            </Box>
          </Box>

          {/* Card body */}
          <CardContent sx={{ flexGrow: 1, p: 2.5, display: "flex", flexDirection: "column" }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "#f1f0ff",
                mb: 1,
                lineHeight: 1.35,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }}
            >
              {item.name}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: "auto" }}>
              <LocationOnIcon sx={{ fontSize: 13, color: "rgba(241,240,255,0.45)" }} />
              <Typography sx={{ fontSize: "0.78rem", color: "rgba(241,240,255,0.5)", fontWeight: 500 }}>
                {[item.city, item.countryName].filter(Boolean).join(", ")}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2 }}>
              <Chip
                label={item.countryCode}
                size="small"
                sx={{
                  background: `linear-gradient(135deg, ${accent.from}22, ${accent.to}22)`,
                  border: `1px solid ${accent.from}44`,
                  color: accent.from,
                  fontWeight: 700,
                  fontSize: "0.7rem"
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: hovered ? accent.from : "rgba(241,240,255,0.35)",
                  transition: "color 0.25s ease, transform 0.25s ease",
                  transform: hovered ? "translateX(2px)" : "translateX(0)"
                }}
              >
                Explore
                <ArrowForwardIcon sx={{ fontSize: 14 }} />
              </Box>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
}

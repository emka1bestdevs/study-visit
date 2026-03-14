import { useRef } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Skeleton,
  Chip,
  IconButton,
  Card,
  CardActionArea,
  CardContent
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useUniversitiesByProgram } from "@/entities/university/model/useUniversityQueries";
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

function CompactCard({ item, index }: { item: UniversityListItem; index: number }) {
  const accent = ACCENT_COLORS[item.id % ACCENT_COLORS.length];
  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        animation: "cardIn 0.45s ease both",
        animationDelay: `${Math.min(index * 0.06, 0.5)}s`,
        "@keyframes cardIn": {
          from: { opacity: 0, transform: "translateY(16px)" },
          to: { opacity: 1, transform: "translateY(0)" }
        }
      }}
    >
      <Card
        sx={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          borderRadius: "16px",
          overflow: "hidden",
          transition: "transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease, border 0.3s ease",
          "&:hover": {
            transform: "translateY(-6px)",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(167,139,250,0.25)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
          }
        }}
      >
        <CardActionArea
          component={RouterLink}
          to={`/universities/${item.id}`}
          sx={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}
        >
          {/* Image */}
          <Box sx={{ position: "relative", height: 140, overflow: "hidden" }}>
            <Box
              component="img"
              src={item.imageUrl ?? `https://source.unsplash.com/480x280/?university,campus`}
              alt={item.name}
              loading="lazy"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                transition: "transform 6s ease",
                "&:hover": { transform: "scale(1.1)" }
              }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, transparent 30%, rgba(15,10,30,0.8) 100%)"
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(90deg, ${accent.from}, ${accent.to})`
              }}
            />
            <Box
              component="img"
              src={`https://flagcdn.com/w40/${item.countryCode.toLowerCase()}.png`}
              alt={item.countryName}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                height: 18,
                borderRadius: "3px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.6)"
              }}
            />
          </Box>

          {/* Content */}
          <CardContent sx={{ p: 2, pb: "12px !important" }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.85rem",
                color: "#f1f0ff",
                mb: 0.75,
                lineHeight: 1.35,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                minHeight: "2.3em"
              }}
            >
              {item.name}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                <LocationOnIcon sx={{ fontSize: 12, color: "rgba(241,240,255,0.4)" }} />
                <Typography sx={{ fontSize: "0.72rem", color: "rgba(241,240,255,0.45)", fontWeight: 500, lineClamp: 1 }}>
                  {[item.city, item.countryName].filter(Boolean).join(", ")}
                </Typography>
              </Box>
              <ArrowForwardIcon sx={{ fontSize: 14, color: accent.from, flexShrink: 0 }} />
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
}

interface Props {
  category: string;
  color: string;
  icon: React.ReactNode;
  onSeeAll: (category: string) => void;
}

export function SpecialtyCategoryRow({ category, color, icon, onSeeAll }: Props) {
  const { data, isLoading } = useUniversitiesByProgram(category);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 520 : -520, behavior: "smooth" });
  };

  const items = data?.items ?? [];

  return (
    <Box sx={{ mb: 6 }}>
      {/* Row header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2.5,
          px: { xs: 0, md: 0 }
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              background: `linear-gradient(135deg, ${color}33, ${color}11)`,
              border: `1px solid ${color}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: color,
              flexShrink: 0
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: "#f1f0ff", lineHeight: 1.2 }}>
              {category}
            </Typography>
            {!isLoading && (
              <Typography sx={{ fontSize: "0.75rem", color: "rgba(241,240,255,0.45)", fontWeight: 500 }}>
                {items.length} {items.length === 1 ? "university" : "universities"}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label="See all →"
            size="small"
            onClick={() => onSeeAll(category)}
            sx={{
              bgcolor: `${color}22`,
              color: color,
              border: `1px solid ${color}44`,
              fontWeight: 700,
              fontSize: "0.75rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": { bgcolor: `${color}33`, transform: "translateX(2px)" }
            }}
          />
          <IconButton
            size="small"
            onClick={() => scroll("left")}
            sx={{
              color: "rgba(241,240,255,0.5)",
              border: "1px solid rgba(255,255,255,0.1)",
              width: 32,
              height: 32,
              "&:hover": { bgcolor: "rgba(255,255,255,0.08)", color: "#f1f0ff" }
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => scroll("right")}
            sx={{
              color: "rgba(241,240,255,0.5)",
              border: "1px solid rgba(255,255,255,0.1)",
              width: 32,
              height: 32,
              "&:hover": { bgcolor: "rgba(255,255,255,0.08)", color: "#f1f0ff" }
            }}
          >
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Horizontal scroll row */}
      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          pb: 1.5,
          scrollbarWidth: "thin",
          scrollbarColor: `${color}44 transparent`,
          "&::-webkit-scrollbar": { height: 4 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            background: `${color}44`,
            borderRadius: 2,
            "&:hover": { background: `${color}88` }
          }
        }}
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width={240}
                height={220}
                sx={{ borderRadius: "16px", bgcolor: "rgba(255,255,255,0.05)", flexShrink: 0 }}
                animation="wave"
              />
            ))
          : items.length === 0
          ? (
            <Box sx={{ py: 4, px: 2, color: "rgba(241,240,255,0.35)", fontSize: "0.9rem" }}>
              No universities found for this category.
            </Box>
          )
          : items.map((item, i) => (
              <CompactCard key={item.id} item={item} index={i} />
            ))}
      </Box>

      {/* Divider */}
      <Box
        sx={{
          mt: 3,
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent)"
        }}
      />
    </Box>
  );
}

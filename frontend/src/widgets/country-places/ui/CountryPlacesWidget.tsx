import { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Rating,
  Chip,
  CircularProgress,
  Alert
} from "@mui/material";
import PlaceIcon from "@mui/icons-material/Place";
import ExploreIcon from "@mui/icons-material/Explore";
import { useCountryPlaces } from "@/entities/university/model/useUniversityQueries";

interface Props {
  universityId: number;
  countryName: string;
}

interface Place {
  name: string;
  rating: number | null;
  address: string | null;
  placeId: string;
}

const PLACE_ACCENTS = [
  { from: "#7c3aed", to: "#06b6d4" },
  { from: "#ec4899", to: "#f97316" },
  { from: "#10b981", to: "#06b6d4" },
  { from: "#f59e0b", to: "#ec4899" },
  { from: "#3b82f6", to: "#8b5cf6" },
  { from: "#06b6d4", to: "#10b981" }
];

function PlaceCard({ place, index }: { place: Place; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const accent = PLACE_ACCENTS[index % PLACE_ACCENTS.length];
  // Use real Wikipedia image if available, else gradient fallback
  const imgSrc = place.imageUrl ?? null;

  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        height: "100%",
        animation: "placeIn 0.5s ease both",
        animationDelay: `${index * 0.07}s`,
        "@keyframes placeIn": {
          from: { opacity: 0, transform: "scale(0.94)" },
          to: { opacity: 1, transform: "scale(1)" }
        },
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        transform: hovered ? "translateY(-8px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 24px 50px rgba(0,0,0,0.5)"
          : "0 4px 20px rgba(0,0,0,0.3)",
        overflow: "hidden",
        background: "rgba(255,255,255,0.04)",
        border: hovered
          ? `1px solid rgba(255,255,255,0.15)`
          : "1px solid rgba(255,255,255,0.07)"
      }}
    >
      {/* Photo */}
      <Box sx={{ height: 200, position: "relative", overflow: "hidden" }}>
        {!imgError && imgSrc ? (
          <Box
            component="img"
            src={imgSrc}
            alt={place.name}
            loading="lazy"
            onError={() => setImgError(true)}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 6s ease",
              transform: hovered ? "scale(1.1)" : "scale(1)"
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
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, transparent 40%, rgba(15,10,30,0.8) 100%)"
          }}
        />
        {/* Accent top bar */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${accent.from}, ${accent.to})`,
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s"
          }}
        />
        {place.rating && (
          <Chip
            label={`★ ${place.rating.toFixed(1)}`}
            size="small"
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
              color: "#fff",
              fontWeight: 800,
              fontSize: "0.78rem",
              border: "none"
            }}
          />
        )}
      </Box>

      <CardContent sx={{ p: 2.5 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "#f1f0ff",
            mb: 1,
            lineHeight: 1.35
          }}
        >
          {place.name}
        </Typography>
        {place.address && (
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, mb: 1.5 }}>
            <PlaceIcon sx={{ fontSize: 13, color: "rgba(241,240,255,0.4)", mt: 0.35, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: "rgba(241,240,255,0.45)", lineHeight: 1.5 }}>
              {place.address}
            </Typography>
          </Box>
        )}
        {place.rating && (
          <Rating value={place.rating} readOnly precision={0.5} size="small" />
        )}
      </CardContent>
    </Card>
  );
}

export function CountryPlacesWidget({ universityId, countryName }: Props) {
  const { data, isLoading, isError } = useCountryPlaces(universityId);
  const places = data?.items ?? [];

  return (
    <Box>
      {/* Section header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 4,
          p: 3,
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,0.07)"
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 3,
            background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(16,185,129,0.2))",
            border: "1px solid rgba(6,182,212,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}
        >
          <ExploreIcon sx={{ fontSize: 28, color: "#06b6d4" }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#f1f0ff", lineHeight: 1.2 }}>
            Explore {countryName}
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(241,240,255,0.45)", mt: 0.4 }}>
            Top-rated places to visit
          </Typography>
        </Box>
      </Box>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: "#06b6d4" }} />
        </Box>
      )}

      {isError && (
        <Alert
          severity="warning"
          sx={{
            borderRadius: 3,
            bgcolor: "rgba(251,191,36,0.08)",
            border: "1px solid rgba(251,191,36,0.15)",
            color: "#fcd34d",
            "& .MuiAlert-icon": { color: "#fbbf24" }
          }}
        >
          Could not load place recommendations. Configure a Google Places API key.
        </Alert>
      )}

      {!isLoading && !isError && places.length === 0 && (
        <Alert
          severity="info"
          sx={{
            borderRadius: 3,
            bgcolor: "rgba(6,182,212,0.08)",
            border: "1px solid rgba(6,182,212,0.15)",
            color: "#67e8f9",
            "& .MuiAlert-icon": { color: "#06b6d4" }
          }}
        >
          No place recommendations available. Add a Google Places API key to enable this.
        </Alert>
      )}

      {!isLoading && places.length > 0 && (
        <Grid container spacing={3}>
          {places.map((place, i) => (
            <Grid item xs={12} sm={6} md={4} key={place.placeId}>
              <PlaceCard place={place} index={i} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

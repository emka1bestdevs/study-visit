import { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Grid,
  Paper,
  Avatar,
  Rating,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Divider
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SchoolIcon from "@mui/icons-material/School";
import StarIcon from "@mui/icons-material/Star";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import type { UniversityDetails } from "@/shared/types/contracts";
import { useUniversityReviews } from "@/entities/university/model/useUniversityQueries";

interface Props {
  university: UniversityDetails;
}

interface HeroProps {
  id: number;
  name: string;
  countryCode: string;
  countryName: string;
  imageUrl: string | null;
}

function HeroImage({ id, name, countryCode, countryName, imageUrl }: HeroProps) {
  const [imgErr, setImgErr] = useState(false);
  // Wikipedia images are thumbnails (800-900px) — for the hero we can request a larger size
  // by replacing the width in the URL if it's a Wikimedia URL
  const heroSrc = imageUrl
    ? imageUrl.replace(/\/\d+px-/, "/1200px-")
    : null;

  return (
    <Box
      sx={{
        height: { xs: 280, md: 400 },
        position: "relative",
        overflow: "hidden",
        borderRadius: 4,
        mb: 4
      }}
    >
      {!imgErr && heroSrc ? (
        <Box
          component="img"
          src={heroSrc}
          alt={name}
          onError={() => setImgErr(true)}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            animation: "slowZoom 20s ease-in-out infinite alternate",
            "@keyframes slowZoom": {
              from: { transform: "scale(1)" },
              to: { transform: "scale(1.07)" }
            }
          }}
        />
      ) : (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)"
          }}
        />
      )}

      {/* Dark gradient overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(15,10,30,0.2) 0%, rgba(15,10,30,0.75) 100%)"
        }}
      />

      {/* Top accent line */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "linear-gradient(90deg, #7c3aed, #06b6d4, #ec4899)"
        }}
      />

      {/* Bottom info */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          p: { xs: 3, md: 4.5 }
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
          <Box
            component="img"
            src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
            alt={countryName}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            sx={{ height: 24, borderRadius: "4px", boxShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
          />
          <Chip
            label={countryName}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              color: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(255,255,255,0.2)",
              fontWeight: 600
            }}
          />
        </Box>
        <Typography
          variant="h3"
          sx={{
            color: "#fff",
            fontWeight: 900,
            fontSize: { xs: "1.7rem", md: "2.6rem" },
            lineHeight: 1.2,
            textShadow: "0 2px 20px rgba(0,0,0,0.5)"
          }}
        >
          {name}
        </Typography>
      </Box>
    </Box>
  );
}

export function UniversityProfileWidget({ university }: Props) {
  const { data: reviewsData, isLoading: reviewsLoading } = useUniversityReviews(university.id);
  const reviews = reviewsData?.items ?? [];

  return (
    <Box>
      <HeroImage
        id={university.id}
        name={university.name}
        countryCode={university.countryCode}
        countryName={university.countryName}
        imageUrl={university.imageUrl}
      />

      {/* Meta row */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          mb: 4,
          p: 3,
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,0.08)"
        }}
      >
        {university.city && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LocationOnIcon sx={{ fontSize: 18, color: "#a78bfa" }} />
            <Typography sx={{ fontWeight: 600, color: "rgba(241,240,255,0.85)", fontSize: "0.95rem" }}>
              {university.city}, {university.countryName}
            </Typography>
          </Box>
        )}

        {university.website && (
          <Box
            component="a"
            href={university.website}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              ml: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 3,
              py: 1.25,
              borderRadius: "50px",
              background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.9rem",
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 28px rgba(124,58,237,0.55)"
              }
            }}
          >
            <OpenInNewIcon sx={{ fontSize: 16 }} />
            Visit Official Website
          </Box>
        )}
      </Box>

      <Grid container spacing={4}>
        {/* Faculties */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: "100%",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 4
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
                  background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.3))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <SchoolIcon sx={{ color: "#a78bfa", fontSize: 22 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#f1f0ff" }}>
                Faculties & Programs
              </Typography>
            </Box>

            {university.faculties.length === 0 ? (
              <Typography sx={{ color: "rgba(241,240,255,0.4)", fontStyle: "italic" }}>
                No faculty data available
              </Typography>
            ) : (
              university.faculties.map((faculty) => (
                <Accordion
                  key={faculty.id}
                  disableGutters
                  elevation={0}
                  sx={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "12px !important",
                    mb: 1.5,
                    "&:before": { display: "none" },
                    "&.Mui-expanded": {
                      background: "rgba(124,58,237,0.08)",
                      border: "1px solid rgba(124,58,237,0.2)"
                    }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: "#a78bfa" }} />}
                    sx={{ borderRadius: "12px", minHeight: 52 }}
                  >
                    <Typography sx={{ fontWeight: 600, color: "#f1f0ff", fontSize: "0.9rem" }}>
                      {faculty.name}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {faculty.programs.map((prog) => (
                        <Chip
                          key={prog.id}
                          label={prog.name}
                          size="small"
                          sx={{
                            bgcolor: "rgba(167,139,250,0.1)",
                            color: "#a78bfa",
                            border: "1px solid rgba(167,139,250,0.2)",
                            fontWeight: 600,
                            "&:hover": { bgcolor: "rgba(167,139,250,0.2)" }
                          }}
                        />
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Paper>
        </Grid>

        {/* Reviews */}
        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: "100%",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 4
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
                  background: "linear-gradient(135deg, rgba(251,191,36,0.3), rgba(245,158,11,0.3))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <StarIcon sx={{ color: "#fbbf24", fontSize: 22 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#f1f0ff" }}>
                Student Reviews
              </Typography>
            </Box>

            {reviewsLoading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress sx={{ color: "#a78bfa" }} />
              </Box>
            )}

            {!reviewsLoading && reviews.length === 0 && (
              <Alert
                severity="info"
                sx={{
                  borderRadius: 3,
                  bgcolor: "rgba(6,182,212,0.1)",
                  border: "1px solid rgba(6,182,212,0.2)",
                  color: "#67e8f9",
                  "& .MuiAlert-icon": { color: "#06b6d4" }
                }}
              >
                No reviews yet. Add a Google Places API key to load real reviews.
              </Alert>
            )}

            {!reviewsLoading &&
              reviews.map((review, i) => (
                <Box
                  key={i}
                  sx={{
                    mb: 3,
                    p: 2.5,
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 3,
                    border: "1px solid rgba(255,255,255,0.06)",
                    animation: "reviewIn 0.4s ease both",
                    animationDelay: `${i * 0.08}s`,
                    "@keyframes reviewIn": {
                      from: { opacity: 0, transform: "translateX(16px)" },
                      to: { opacity: 1, transform: "translateX(0)" }
                    }
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                        fontWeight: 800,
                        fontSize: "0.95rem"
                      }}
                    >
                      {review.authorName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: "#f1f0ff", fontSize: "0.9rem" }}>
                        {review.authorName}
                      </Typography>
                      <Rating value={review.rating} readOnly size="small" precision={0.5} />
                    </Box>
                    {review.publishedAt && (
                      <Typography sx={{ ml: "auto", color: "rgba(241,240,255,0.35)", fontSize: "0.75rem" }}>
                        {new Date(review.publishedAt).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                  <Divider sx={{ mb: 1.5, borderColor: "rgba(255,255,255,0.06)" }} />
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <FormatQuoteIcon sx={{ color: "#7c3aed", opacity: 0.5, fontSize: 24, mt: -0.5 }} />
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(241,240,255,0.65)", lineHeight: 1.7, fontStyle: "italic" }}
                    >
                      {review.text}
                    </Typography>
                  </Box>
                </Box>
              ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

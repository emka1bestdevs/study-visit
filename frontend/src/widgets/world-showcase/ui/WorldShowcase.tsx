import { useState } from "react";
import { Box, Container, Typography, Grid, Skeleton, Pagination } from "@mui/material";
import { useBrowseUniversities } from "@/entities/university/model/useUniversityQueries";
import { UniversityCard } from "./UniversityCard";

export function WorldShowcase() {
  const [page, setPage] = useState(1);
  const limit = 24;
  const { data, isLoading } = useBrowseUniversities(page, limit);
  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="xl">
        {/* Section header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              color: "#f1f0ff",
              mb: 1.5,
              animation: "fadeUp 0.6s ease",
              "@keyframes fadeUp": {
                from: { opacity: 0, transform: "translateY(20px)" },
                to: { opacity: 1, transform: "translateY(0)" }
              }
            }}
          >
            Universities{" "}
            <Box
              component="span"
              sx={{
                background: "linear-gradient(135deg, #a78bfa, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              Around the World
            </Box>
          </Typography>
          <Typography sx={{ color: "rgba(241,240,255,0.5)", fontSize: "1rem" }}>
            Hover a card to preview · Click to explore
          </Typography>
        </Box>

        {/* Grid */}
        <Grid container spacing={3}>
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                  <Skeleton
                    variant="rectangular"
                    height={340}
                    sx={{ borderRadius: 3, bgcolor: "rgba(255,255,255,0.05)" }}
                    animation="wave"
                  />
                </Grid>
              ))
            : data?.items.map((item, i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                  <UniversityCard item={item} index={i} />
                </Grid>
              ))}
        </Grid>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => {
                setPage(v);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              size="large"
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "rgba(241,240,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  fontWeight: 700,
                  "&:hover": { bgcolor: "rgba(124,58,237,0.2)" },
                  "&.Mui-selected": {
                    background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                    color: "#fff",
                    border: "none"
                  }
                }
              }}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}

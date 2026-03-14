import { Box, Grid, Typography, CircularProgress, Alert } from "@mui/material";
import { useUniversitiesByProgram } from "@/entities/university/model/useUniversityQueries";
import { UniversityCard } from "@/widgets/world-showcase/ui/UniversityCard";

interface Props {
  programQuery: string;
  countryCode?: string;
}

export function UniversityResultsList({ programQuery, countryCode }: Props) {
  const { data, isLoading, isError } = useUniversitiesByProgram(programQuery, countryCode);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={52} thickness={4} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ borderRadius: 3, fontWeight: 600 }}>
        Failed to load universities. Please try again.
      </Alert>
    );
  }

  const items = data?.items ?? [];

  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h5" sx={{ color: "#546e8a", mb: 1, fontWeight: 600 }}>
          No universities found
        </Typography>
        <Typography sx={{ color: "#90a4ae" }}>
          Try a different program name
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {items.map((item, i) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
          <UniversityCard item={item} index={i} />
        </Grid>
      ))}
    </Grid>
  );
}

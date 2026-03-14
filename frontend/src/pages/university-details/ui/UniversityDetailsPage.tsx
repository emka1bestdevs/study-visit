import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useUniversityDetails } from "@/entities/university/model/useUniversityQueries";
import { UniversityProfileWidget } from "@/widgets/university-profile/ui/UniversityProfileWidget";
import { CountryPlacesWidget } from "@/widgets/country-places/ui/CountryPlacesWidget";

export function UniversityDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const universityId = Number(id);
  const { data: universityData, isLoading, isError } = useUniversityDetails(universityId);
  const university = universityData?.item;

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#0f0a1e"
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={56} sx={{ color: "#a78bfa" }} />
          <Typography sx={{ mt: 2, color: "rgba(241,240,255,0.5)", fontWeight: 600 }}>
            Loading university…
          </Typography>
        </Box>
      </Box>
    );
  }

  if (isError || !university) {
    return (
      <Box sx={{ bgcolor: "#0f0a1e", minHeight: "100vh", pt: 10 }}>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            University not found or failed to load.
          </Alert>
          <Button
            component={RouterLink}
            to="/"
            startIcon={<ArrowBackIcon />}
            variant="contained"
            sx={{ mt: 3 }}
          >
            Back to Home
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#0f0a1e", minHeight: "100vh" }}>
      {/* Back link bar */}
      <Box
        sx={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          py: 1.5,
          px: 3
        }}
      >
        <Button
          component={RouterLink}
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{
            color: "rgba(241,240,255,0.6)",
            fontWeight: 600,
            fontSize: "0.85rem",
            "&:hover": { color: "#a78bfa", bgcolor: "transparent" }
          }}
        >
          Back to Home
        </Button>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4, pb: 10 }}>
        <UniversityProfileWidget university={university} />
        <Box sx={{ mt: 8 }}>
          <CountryPlacesWidget universityId={universityId} countryName={university.countryName} />
        </Box>
      </Container>
    </Box>
  );
}

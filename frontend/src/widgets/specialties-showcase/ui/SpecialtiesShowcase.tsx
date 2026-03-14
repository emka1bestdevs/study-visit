import { Box, Container, Typography } from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import BuildIcon from "@mui/icons-material/Build";
import GavelIcon from "@mui/icons-material/Gavel";
import PaletteIcon from "@mui/icons-material/Palette";
import PsychologyIcon from "@mui/icons-material/Psychology";
import { SpecialtyCategoryRow } from "./SpecialtyCategoryRow";

const CATEGORIES = [
  { name: "Computer Science", color: "#7c3aed", icon: <CodeIcon sx={{ fontSize: 20 }} /> },
  { name: "Medicine", color: "#ec4899", icon: <LocalHospitalIcon sx={{ fontSize: 20 }} /> },
  { name: "Business", color: "#f59e0b", icon: <BusinessCenterIcon sx={{ fontSize: 20 }} /> },
  { name: "Engineering", color: "#06b6d4", icon: <BuildIcon sx={{ fontSize: 20 }} /> },
  { name: "Law", color: "#10b981", icon: <GavelIcon sx={{ fontSize: 20 }} /> },
  { name: "Design", color: "#f97316", icon: <PaletteIcon sx={{ fontSize: 20 }} /> },
  { name: "Psychology", color: "#8b5cf6", icon: <PsychologyIcon sx={{ fontSize: 20 }} /> }
];

interface Props {
  onCategorySearch: (category: string) => void;
}

export function SpecialtiesShowcase({ onCategorySearch }: Props) {
  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="xl">
        {/* Section header */}
        <Box sx={{ mb: 6, textAlign: "center" }}>
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
            Browse by{" "}
            <Box
              component="span"
              sx={{
                background: "linear-gradient(135deg, #a78bfa, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              Specialty
            </Box>
          </Typography>
          <Typography sx={{ color: "rgba(241,240,255,0.5)", fontSize: "1rem" }}>
            Discover universities by field of study · Scroll to explore
          </Typography>
        </Box>

        {/* Category rows */}
        {CATEGORIES.map((cat) => (
          <SpecialtyCategoryRow
            key={cat.name}
            category={cat.name}
            color={cat.color}
            icon={cat.icon}
            onSeeAll={onCategorySearch}
          />
        ))}
      </Container>
    </Box>
  );
}

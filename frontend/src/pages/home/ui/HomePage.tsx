import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Chip,
  TextField,
  Autocomplete,
  InputAdornment,
  Select,
  MenuItem,
  FormControl
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PublicIcon from "@mui/icons-material/Public";
import SchoolIcon from "@mui/icons-material/School";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useProgramSuggestions } from "@/entities/program/model/useProgramSuggestions";
import { useProgramSearchState } from "@/features/program-search/model/useProgramSearchState";
import { useCountries } from "@/entities/university/model/useUniversityQueries";
import { UniversityResultsList } from "@/widgets/university-results/ui/UniversityResultsList";
import { WorldShowcase } from "@/widgets/world-showcase/ui/WorldShowcase";
import { SpecialtiesShowcase } from "@/widgets/specialties-showcase/ui/SpecialtiesShowcase";

const POPULAR = ["Computer Science", "Medicine", "Business", "Engineering", "Law", "Design", "Psychology"];

export function HomePage() {
  const {
    inputValue,
    setInputValue,
    submittedProgram,
    submitProgram,
    selectedCountry,
    setSelectedCountry
  } = useProgramSearchState();
  const { data: suggestionsData } = useProgramSuggestions(inputValue);
  const suggestions = suggestionsData?.items ?? [];
  const [acValue, setAcValue] = useState<string | null>(null);
  const { data: countriesData } = useCountries();
  const countries = countriesData?.items ?? [];

  const doSearch = (val: string) => {
    submitProgram(val);
    if (val) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0f0a1e" }}>
      {/* ── HERO ── */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          minHeight: { xs: 520, md: 640 },
          display: "flex",
          alignItems: "center"
        }}
      >
        {/* Animated gradient background */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.5) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(6,182,212,0.3) 0%, transparent 60%), #0f0a1e"
          }}
        />

        {/* Floating orbs */}
        {[
          { size: 500, top: "-20%", left: "-10%", color: "rgba(124,58,237,0.15)", delay: "0s" },
          { size: 400, top: "40%", right: "-5%", color: "rgba(6,182,212,0.12)", delay: "3s" },
          { size: 300, bottom: "-10%", left: "30%", color: "rgba(236,72,153,0.1)", delay: "6s" }
        ].map((orb, i) => (
          <Box
            key={i}
            aria-hidden
            sx={{
              position: "absolute",
              width: orb.size,
              height: orb.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              top: orb.top,
              left: (orb as { left?: string }).left,
              right: (orb as { right?: string }).right,
              bottom: (orb as { bottom?: string }).bottom,
              animation: `orb 12s ease-in-out ${orb.delay} infinite alternate`,
              "@keyframes orb": {
                from: { transform: "scale(1) translate(0,0)" },
                to: { transform: "scale(1.2) translate(20px, -20px)" }
              }
            }}
          />
        ))}

        {/* Grid dots pattern */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)"
          }}
        />

        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1, py: 8, textAlign: "center" }}>
          {/* Badge */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 0.75,
              mb: 3,
              borderRadius: 50,
              background: "rgba(124,58,237,0.2)",
              border: "1px solid rgba(124,58,237,0.4)",
              backdropFilter: "blur(10px)",
              animation: "fadeIn 0.6s ease",
              "@keyframes fadeIn": { from: { opacity: 0 }, to: { opacity: 1 } }
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 16, color: "#a78bfa" }} />
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#a78bfa", letterSpacing: "0.05em" }}>
              149 UNIVERSITIES · 55 COUNTRIES
            </Typography>
          </Box>

          {/* Headline */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2.6rem", sm: "3.6rem", md: "4.5rem" },
              fontWeight: 900,
              lineHeight: 1.1,
              mb: 2,
              animation: "slideUp 0.7s ease",
              "@keyframes slideUp": {
                from: { opacity: 0, transform: "translateY(30px)" },
                to: { opacity: 1, transform: "translateY(0)" }
              }
            }}
          >
            <Box component="span" sx={{ color: "#f1f0ff" }}>Find your </Box>
            <Box
              component="span"
              sx={{
                background: "linear-gradient(135deg, #a78bfa 0%, #06b6d4 50%, #ec4899 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              dream uni
            </Box>
          </Typography>

          <Typography
            sx={{
              color: "rgba(241,240,255,0.6)",
              fontSize: { xs: "1rem", md: "1.2rem" },
              mb: 4,
              fontWeight: 400,
              animation: "slideUp 0.7s 0.1s ease both"
            }}
          >
            Search any program — see every university that offers it, worldwide.
          </Typography>

          {/* Search */}
          <Box
            component="form"
            onSubmit={(e) => { e.preventDefault(); doSearch(inputValue); }}
            sx={{ animation: "slideUp 0.7s 0.2s ease both", mb: 3 }}
          >
            <Autocomplete
              freeSolo
              options={suggestions.map((s) => s.name)}
              inputValue={inputValue}
              value={acValue}
              onInputChange={(_, v) => setInputValue(v)}
              onChange={(_, v) => {
                if (typeof v === "string") { setAcValue(v); doSearch(v); }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="e.g. Computer Science, Medicine, Law…"
                  onKeyDown={(e) => { if (e.key === "Enter") doSearch(inputValue); }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#a78bfa" }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "rgba(255,255,255,0.06)",
                      backdropFilter: "blur(20px)",
                      borderRadius: "50px",
                      color: "#f1f0ff",
                      fontSize: "1.05rem",
                      pr: 0.5,
                      "& fieldset": { border: "1.5px solid rgba(124,58,237,0.35)" },
                      "&:hover fieldset": { border: "1.5px solid rgba(167,139,250,0.6)" },
                      "&.Mui-focused fieldset": { border: "1.5px solid rgba(167,139,250,0.9)" },
                      "& input::placeholder": { color: "rgba(241,240,255,0.4)" },
                      "& .MuiAutocomplete-endAdornment button": { color: "rgba(241,240,255,0.5)" }
                    }
                  }}
                />
              )}
            />

            {/* Country filter */}
            <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
              <FormControl size="small" sx={{ minWidth: 240 }}>
                <Select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  displayEmpty
                  IconComponent={KeyboardArrowDownIcon}
                  renderValue={(val) =>
                    val
                      ? countries.find((c) => c.code === val)?.name ?? val
                      : "🌍 All countries"
                  }
                  sx={{
                    bgcolor: "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "50px",
                    color: selectedCountry ? "#f1f0ff" : "rgba(241,240,255,0.55)",
                    fontSize: "0.9rem",
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "1.5px solid rgba(124,58,237,0.35)"
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      border: "1.5px solid rgba(167,139,250,0.6)"
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      border: "1.5px solid rgba(167,139,250,0.9)"
                    },
                    "& .MuiSelect-icon": { color: "rgba(241,240,255,0.4)" },
                    "& .MuiSelect-select": { py: 1.1, pl: 2.5 }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: "#1a1030",
                        border: "1px solid rgba(124,58,237,0.3)",
                        borderRadius: "16px",
                        mt: 1,
                        maxHeight: 320,
                        "& .MuiMenuItem-root": {
                          color: "rgba(241,240,255,0.8)",
                          fontSize: "0.875rem",
                          "&:hover": { bgcolor: "rgba(124,58,237,0.2)" },
                          "&.Mui-selected": {
                            bgcolor: "rgba(124,58,237,0.25)",
                            color: "#a78bfa",
                            "&:hover": { bgcolor: "rgba(124,58,237,0.3)" }
                          }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="">🌍 All countries</MenuItem>
                  {countries.map((c) => (
                    <MenuItem key={c.code} value={c.code}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box
                          component="img"
                          src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`}
                          alt={c.name}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          sx={{ height: 14, borderRadius: "2px" }}
                        />
                        {c.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Popular tags */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
            <Typography sx={{ color: "rgba(241,240,255,0.4)", fontSize: "0.8rem", mr: 0.5, alignSelf: "center" }}>
              Popular:
            </Typography>
            {POPULAR.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                onClick={() => doSearch(tag)}
                sx={{
                  bgcolor: "rgba(255,255,255,0.06)",
                  color: "rgba(241,240,255,0.75)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(124,58,237,0.25)",
                    border: "1px solid rgba(167,139,250,0.5)",
                    color: "#a78bfa"
                  }
                }}
              />
            ))}
          </Box>

          {/* Stats row */}
          <Box sx={{ display: "flex", gap: 4, justifyContent: "center", mt: 5 }}>
            {[
              { icon: <SchoolIcon sx={{ fontSize: 20 }} />, value: "149+", label: "Universities" },
              { icon: <PublicIcon sx={{ fontSize: 20 }} />, value: "55+", label: "Countries" },
              { icon: <AutoAwesomeIcon sx={{ fontSize: 20 }} />, value: "600+", label: "Programs" }
            ].map((s) => (
              <Box key={s.label} sx={{ textAlign: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75, color: "#a78bfa", mb: 0.25 }}>
                  {s.icon}
                  <Typography sx={{ fontWeight: 900, fontSize: "1.4rem", color: "#f1f0ff" }}>{s.value}</Typography>
                </Box>
                <Typography sx={{ fontSize: "0.75rem", color: "rgba(241,240,255,0.45)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── Results ── */}
      {submittedProgram && (
        <Container maxWidth="xl" sx={{ pt: 5, pb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4, flexWrap: "wrap" }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#f1f0ff" }}>
              Results for{" "}
              <Box component="span" sx={{ color: "#a78bfa" }}>"{submittedProgram}"</Box>
              {selectedCountry && (
                <>
                  {" "}in{" "}
                  <Box component="span" sx={{ color: "#06b6d4" }}>
                    {countries.find((c) => c.code === selectedCountry)?.name ?? selectedCountry}
                  </Box>
                </>
              )}
            </Typography>
            <Chip
              label="← new search"
              size="small"
              onClick={() => submitProgram("")}
              sx={{ bgcolor: "rgba(124,58,237,0.2)", color: "#a78bfa", cursor: "pointer", border: "1px solid rgba(124,58,237,0.3)" }}
            />
          </Box>
          <UniversityResultsList programQuery={submittedProgram} countryCode={selectedCountry || undefined} />
        </Container>
      )}

      {/* ── Specialties Showcase ── */}
      {!submittedProgram && (
        <SpecialtiesShowcase onCategorySearch={doSearch} />
      )}

      {/* ── World Showcase ── */}
      {!submittedProgram && <WorldShowcase />}
    </Box>
  );
}

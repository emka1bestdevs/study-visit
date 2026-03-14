import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import GlobalStyles from "@mui/material/GlobalStyles";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 }
  }
});

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#7c3aed", light: "#a78bfa", dark: "#5b21b6", contrastText: "#fff" },
    secondary: { main: "#06b6d4", light: "#67e8f9", dark: "#0891b2" },
    background: { default: "#0f0a1e", paper: "#1a1033" },
    text: { primary: "#f1f0ff", secondary: "#a89fd4" }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h1: { fontWeight: 900 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 700 }
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          color: "#f1f0ff"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 28,
          paddingRight: 28,
          fontWeight: 700,
          fontSize: "0.95rem"
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
          boxShadow: "0 4px 24px rgba(124,58,237,0.4)",
          "&:hover": {
            background: "linear-gradient(135deg, #6d28d9 0%, #0891b2 100%)",
            boxShadow: "0 8px 32px rgba(124,58,237,0.55)",
            transform: "translateY(-1px)"
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          fontWeight: 700,
          fontSize: "0.78rem"
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)"
        }
      }
    }
  }
});

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles
        styles={{
          "*": { boxSizing: "border-box" },
          "html, body": {
            scrollBehavior: "smooth",
            fontFamily: '"Inter", sans-serif',
            backgroundColor: "#0f0a1e",
            color: "#f1f0ff"
          },
          "#root": { minHeight: "100vh" },
          "::-webkit-scrollbar": { width: 6 },
          "::-webkit-scrollbar-track": { background: "#0f0a1e" },
          "::-webkit-scrollbar-thumb": {
            background: "rgba(124,58,237,0.5)",
            borderRadius: 3
          },
          "a": { textDecoration: "none", color: "inherit" }
        }}
      />
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}

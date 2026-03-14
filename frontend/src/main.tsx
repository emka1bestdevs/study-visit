import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/app/App";
import { AppProviders } from "@/app/providers";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
);

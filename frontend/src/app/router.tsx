import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "@/pages/home/ui/HomePage";
import { UniversityDetailsPage } from "@/pages/university-details/ui/UniversityDetailsPage";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />
  },
  {
    path: "/universities/:id",
    element: <UniversityDetailsPage />
  }
]);

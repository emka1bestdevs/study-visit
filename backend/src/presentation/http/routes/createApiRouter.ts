import { Router } from "express";
import { UniversityController } from "../controllers/UniversityController.js";

export function createApiRouter(universityController: UniversityController) {
  const router = Router();

  router.get("/programs", universityController.searchPrograms);
  router.get("/countries", universityController.getCountries);
  router.get("/universities/browse", universityController.browseUniversities);
  router.get("/universities", universityController.searchUniversitiesByProgram);
  router.get("/universities/:id", universityController.getUniversityDetails);
  router.get("/universities/:id/reviews", universityController.getUniversityReviews);
  router.get("/universities/:id/places", universityController.getCountryPlaces);

  return router;
}

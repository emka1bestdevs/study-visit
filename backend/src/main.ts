import "dotenv/config"; // loads .env before any other module runs
import { env } from "./shared/env.js";
import { BrowseUniversitiesUseCase } from "./application/use-cases/BrowseUniversitiesUseCase.js";
import { GetCountryPlacesUseCase } from "./application/use-cases/GetCountryPlacesUseCase.js";
import { GetUniversityDetailsUseCase } from "./application/use-cases/GetUniversityDetailsUseCase.js";
import { GetUniversityReviewsUseCase } from "./application/use-cases/GetUniversityReviewsUseCase.js";
import { SearchProgramsUseCase } from "./application/use-cases/SearchProgramsUseCase.js";
import { SearchUniversitiesByProgramUseCase } from "./application/use-cases/SearchUniversitiesByProgramUseCase.js";
import { GooglePlacesGateway } from "./infrastructure/google/GooglePlacesGateway.js";
import { prismaClient } from "./infrastructure/prisma/prismaClient.js";
import { PrismaUniversityRepository } from "./infrastructure/prisma/PrismaUniversityRepository.js";
import { UniversityController } from "./presentation/http/controllers/UniversityController.js";
import { createHttpApp } from "./presentation/http/createHttpApp.js";

async function bootstrap() {
  const universityRepository = new PrismaUniversityRepository();
  const placesGateway = new GooglePlacesGateway(env.GOOGLE_PLACES_API_KEY);

  const universityController = new UniversityController({
    browseUniversitiesUseCase: new BrowseUniversitiesUseCase(universityRepository),
    searchProgramsUseCase: new SearchProgramsUseCase(universityRepository),
    searchUniversitiesUseCase: new SearchUniversitiesByProgramUseCase(
      universityRepository
    ),
    getUniversityDetailsUseCase: new GetUniversityDetailsUseCase(
      universityRepository
    ),
    getUniversityReviewsUseCase: new GetUniversityReviewsUseCase({
      universityRepository,
      placesGateway,
      reviewCacheTtlHours: env.GOOGLE_PLACES_REVIEW_TTL_HOURS
    }),
    getCountryPlacesUseCase: new GetCountryPlacesUseCase({
      universityRepository,
      placesGateway,
      placeCacheTtlHours: env.GOOGLE_PLACES_COUNTRY_TTL_HOURS
    })
  });

  const app = createHttpApp(universityController);
  const server = app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${env.PORT}`);
  });

  async function shutdown() {
    await prismaClient.$disconnect();
    server.close();
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch(async (error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start backend", error);
  await prismaClient.$disconnect();
  process.exit(1);
});

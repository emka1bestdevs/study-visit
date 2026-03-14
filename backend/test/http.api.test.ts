import request from "supertest";
import { describe, expect, it } from "vitest";
import { GetCountryPlacesUseCase } from "../src/application/use-cases/GetCountryPlacesUseCase.js";
import { GetUniversityDetailsUseCase } from "../src/application/use-cases/GetUniversityDetailsUseCase.js";
import { GetUniversityReviewsUseCase } from "../src/application/use-cases/GetUniversityReviewsUseCase.js";
import { SearchProgramsUseCase } from "../src/application/use-cases/SearchProgramsUseCase.js";
import { SearchUniversitiesByProgramUseCase } from "../src/application/use-cases/SearchUniversitiesByProgramUseCase.js";
import { UniversityController } from "../src/presentation/http/controllers/UniversityController.js";
import { createHttpApp } from "../src/presentation/http/createHttpApp.js";
import { FakePlacesGateway } from "./utils/FakePlacesGateway.js";
import {
  InMemoryUniversityRepository,
  createSampleUniversities
} from "./utils/InMemoryUniversityRepository.js";

function createTestApp() {
  const repository = new InMemoryUniversityRepository(createSampleUniversities());
  const placesGateway = new FakePlacesGateway();
  const controller = new UniversityController({
    searchProgramsUseCase: new SearchProgramsUseCase(repository),
    searchUniversitiesUseCase: new SearchUniversitiesByProgramUseCase(repository),
    getUniversityDetailsUseCase: new GetUniversityDetailsUseCase(repository),
    getUniversityReviewsUseCase: new GetUniversityReviewsUseCase({
      universityRepository: repository,
      placesGateway,
      reviewCacheTtlHours: 24
    }),
    getCountryPlacesUseCase: new GetCountryPlacesUseCase({
      universityRepository: repository,
      placesGateway,
      placeCacheTtlHours: 24
    })
  });

  return createHttpApp(controller);
}

describe("API routes", () => {
  it("returns program suggestions", async () => {
    const app = createTestApp();
    const response = await request(app).get("/api/programs").query({ query: "comp" });

    expect(response.status).toBe(200);
    expect(response.body.items[0].slug).toBe("computer-science");
  });

  it("returns universities by direction", async () => {
    const app = createTestApp();
    const response = await request(app)
      .get("/api/universities")
      .query({ program: "medicine" });

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].name).toBe("Medical Research University");
  });

  it("returns places for selected university country", async () => {
    const app = createTestApp();
    const response = await request(app).get("/api/universities/2/places");

    expect(response.status).toBe(200);
    expect(response.body.items[0].name).toBe("Historic Center");
  });
});

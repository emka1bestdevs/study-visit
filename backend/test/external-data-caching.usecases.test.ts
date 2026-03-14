import { describe, expect, it } from "vitest";
import { GetCountryPlacesUseCase } from "../src/application/use-cases/GetCountryPlacesUseCase.js";
import { GetUniversityReviewsUseCase } from "../src/application/use-cases/GetUniversityReviewsUseCase.js";
import { FakePlacesGateway } from "./utils/FakePlacesGateway.js";
import {
  InMemoryUniversityRepository,
  createSampleUniversities
} from "./utils/InMemoryUniversityRepository.js";

describe("external data caching", () => {
  it("caches university reviews and avoids repeated gateway calls", async () => {
    const repository = new InMemoryUniversityRepository(createSampleUniversities());
    const placesGateway = new FakePlacesGateway();
    const useCase = new GetUniversityReviewsUseCase({
      universityRepository: repository,
      placesGateway,
      reviewCacheTtlHours: 24
    });

    const first = await useCase.execute(1);
    const second = await useCase.execute(1);

    expect(first).toHaveLength(1);
    expect(second).toHaveLength(1);
    expect(placesGateway.resolveCalls).toBe(1);
    expect(placesGateway.reviewCalls).toBe(1);
  });

  it("caches country places and avoids repeated gateway calls", async () => {
    const repository = new InMemoryUniversityRepository(createSampleUniversities());
    const placesGateway = new FakePlacesGateway();
    const useCase = new GetCountryPlacesUseCase({
      universityRepository: repository,
      placesGateway,
      placeCacheTtlHours: 24
    });

    const first = await useCase.execute(2);
    const second = await useCase.execute(2);

    expect(first).toHaveLength(1);
    expect(second).toHaveLength(1);
    expect(placesGateway.countryCalls).toBe(1);
  });
});

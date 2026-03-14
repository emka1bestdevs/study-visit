import { describe, expect, it } from "vitest";
import { GetUniversityDetailsUseCase } from "../src/application/use-cases/GetUniversityDetailsUseCase.js";
import { SearchProgramsUseCase } from "../src/application/use-cases/SearchProgramsUseCase.js";
import { SearchUniversitiesByProgramUseCase } from "../src/application/use-cases/SearchUniversitiesByProgramUseCase.js";
import {
  InMemoryUniversityRepository,
  createSampleUniversities
} from "./utils/InMemoryUniversityRepository.js";

describe("search and details use-cases", () => {
  it("returns program suggestions by query", async () => {
    const repository = new InMemoryUniversityRepository(createSampleUniversities());
    const useCase = new SearchProgramsUseCase(repository);

    const result = await useCase.execute("comp");
    expect(result.some((item) => item.slug === "computer-science")).toBe(true);
  });

  it("returns universities by direction", async () => {
    const repository = new InMemoryUniversityRepository(createSampleUniversities());
    const useCase = new SearchUniversitiesByProgramUseCase(repository);

    const result = await useCase.execute("medicine");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Medical Research University");
  });

  it("returns university details by id", async () => {
    const repository = new InMemoryUniversityRepository(createSampleUniversities());
    const useCase = new GetUniversityDetailsUseCase(repository);

    const result = await useCase.execute(1);
    expect(result.faculties[0].programs[0].name).toBe("Computer Science");
  });
});

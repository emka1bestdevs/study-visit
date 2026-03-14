import type { UniversityListItem } from "@world-universities/shared";
import type { UniversityRepository } from "../../domain/repositories/UniversityRepository.js";

export class SearchUniversitiesByProgramUseCase {
  constructor(private readonly universityRepository: UniversityRepository) {}

  async execute(programQuery: string, countryCode?: string): Promise<UniversityListItem[]> {
    const normalized = programQuery.trim();
    if (normalized.length < 2) {
      return [];
    }

    return this.universityRepository.findUniversitiesByProgram(
      normalized,
      100,
      countryCode || undefined
    );
  }
}

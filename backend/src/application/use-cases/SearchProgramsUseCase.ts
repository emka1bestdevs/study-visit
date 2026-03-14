import type { ProgramSuggestion } from "@world-universities/shared";
import type { UniversityRepository } from "../../domain/repositories/UniversityRepository.js";

export class SearchProgramsUseCase {
  constructor(private readonly universityRepository: UniversityRepository) {}

  async execute(query: string): Promise<ProgramSuggestion[]> {
    const normalized = query.trim();
    if (normalized.length < 2) {
      return [];
    }

    return this.universityRepository.searchPrograms(normalized, 20);
  }
}

import type { UniversityListPage } from "../../domain/repositories/UniversityRepository.js";
import type { UniversityRepository } from "../../domain/repositories/UniversityRepository.js";

export class BrowseUniversitiesUseCase {
  constructor(private readonly universityRepository: UniversityRepository) {}

  async execute(page: number, limit: number): Promise<UniversityListPage> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);
    return this.universityRepository.findAll(safePage, safeLimit);
  }

  async executeCountries(): Promise<Array<{ code: string; name: string }>> {
    return this.universityRepository.findAllCountries();
  }
}

import type { UniversityDetails } from "@world-universities/shared";
import type { UniversityRepository } from "../../domain/repositories/UniversityRepository.js";
import { NotFoundError } from "../../shared/errors.js";

export class GetUniversityDetailsUseCase {
  constructor(private readonly universityRepository: UniversityRepository) {}

  async execute(universityId: number): Promise<UniversityDetails> {
    const details =
      await this.universityRepository.findUniversityDetailsById(universityId);

    if (!details) {
      throw new NotFoundError("University not found");
    }

    return details;
  }
}

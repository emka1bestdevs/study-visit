import type { ExternalReview } from "@world-universities/shared";
import type { PlacesGateway } from "../../domain/repositories/PlacesGateway.js";
import type { UniversityRepository } from "../../domain/repositories/UniversityRepository.js";
import { NotFoundError } from "../../shared/errors.js";
import { isCacheValid } from "../../infrastructure/cache/cacheUtils.js";

interface GetUniversityReviewsDeps {
  universityRepository: UniversityRepository;
  placesGateway: PlacesGateway;
  reviewCacheTtlHours: number;
}

export class GetUniversityReviewsUseCase {
  private readonly universityRepository: UniversityRepository;
  private readonly placesGateway: PlacesGateway;
  private readonly reviewCacheTtlHours: number;

  constructor(deps: GetUniversityReviewsDeps) {
    this.universityRepository = deps.universityRepository;
    this.placesGateway = deps.placesGateway;
    this.reviewCacheTtlHours = deps.reviewCacheTtlHours;
  }

  async execute(universityId: number): Promise<ExternalReview[]> {
    const university =
      await this.universityRepository.findUniversityRecordById(universityId);

    if (!university) {
      throw new NotFoundError("University not found");
    }

    const cached = await this.universityRepository.getUniversityReviewCache(
      universityId
    );

    if (cached && isCacheValid(cached.fetchedAt, this.reviewCacheTtlHours)) {
      return cached.payload;
    }

    let placeId = university.googlePlaceId;
    if (!placeId) {
      placeId = await this.placesGateway.resolveUniversityPlaceId({
        universityName: university.name,
        countryName: university.countryName,
        city: university.city
      });

      if (!placeId) {
        return [];
      }

      await this.universityRepository.saveUniversityGooglePlaceId(
        universityId,
        placeId
      );
    }

    const reviews = await this.placesGateway.getUniversityReviews(placeId);
    await this.universityRepository.saveUniversityReviewCache(universityId, reviews);

    return reviews;
  }
}

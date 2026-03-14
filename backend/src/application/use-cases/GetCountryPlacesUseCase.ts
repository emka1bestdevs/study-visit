import type { PlaceRecommendation } from "@world-universities/shared";
import type { PlacesGateway } from "../../domain/repositories/PlacesGateway.js";
import type { UniversityRepository } from "../../domain/repositories/UniversityRepository.js";
import { NotFoundError } from "../../shared/errors.js";
import { isCacheValid } from "../../infrastructure/cache/cacheUtils.js";

interface GetCountryPlacesDeps {
  universityRepository: UniversityRepository;
  placesGateway: PlacesGateway;
  placeCacheTtlHours: number;
}

export class GetCountryPlacesUseCase {
  private readonly universityRepository: UniversityRepository;
  private readonly placesGateway: PlacesGateway;
  private readonly placeCacheTtlHours: number;

  constructor(deps: GetCountryPlacesDeps) {
    this.universityRepository = deps.universityRepository;
    this.placesGateway = deps.placesGateway;
    this.placeCacheTtlHours = deps.placeCacheTtlHours;
  }

  async execute(universityId: number): Promise<PlaceRecommendation[]> {
    const university =
      await this.universityRepository.findUniversityRecordById(universityId);
    if (!university) {
      throw new NotFoundError("University not found");
    }

    const cached = await this.universityRepository.getCountryPlaceCache(
      university.countryCode
    );
    if (cached && isCacheValid(cached.fetchedAt, this.placeCacheTtlHours)) {
      return cached.payload;
    }

    const places = await this.placesGateway.getCountryTopPlaces(
      university.countryName
    );
    await this.universityRepository.saveCountryPlaceCache(
      university.countryCode,
      places
    );
    return places;
  }
}

import type { ExternalReview, PlaceRecommendation } from "@world-universities/shared";
import type {
  PlacesGateway,
  ResolveUniversityPlaceInput
} from "../../src/domain/repositories/PlacesGateway.js";

export class FakePlacesGateway implements PlacesGateway {
  resolveCalls = 0;
  reviewCalls = 0;
  countryCalls = 0;

  async resolveUniversityPlaceId(
    _input: ResolveUniversityPlaceInput
  ): Promise<string | null> {
    this.resolveCalls += 1;
    return "resolved-place-id";
  }

  async getUniversityReviews(_placeId: string): Promise<ExternalReview[]> {
    this.reviewCalls += 1;
    return [
      {
        authorName: "Test Author",
        rating: 5,
        text: "Great university",
        publishedAt: new Date().toISOString()
      }
    ];
  }

  async getCountryTopPlaces(_countryName: string): Promise<PlaceRecommendation[]> {
    this.countryCalls += 1;
    return [
      {
        placeId: "place-1",
        name: "Historic Center",
        rating: 4.8,
        address: "Main Street"
      }
    ];
  }
}

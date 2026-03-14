import type { ExternalReview, PlaceRecommendation } from "@world-universities/shared";

export interface ResolveUniversityPlaceInput {
  universityName: string;
  countryName: string;
  city: string | null;
}

export interface PlacesGateway {
  resolveUniversityPlaceId(
    input: ResolveUniversityPlaceInput
  ): Promise<string | null>;
  getUniversityReviews(placeId: string): Promise<ExternalReview[]>;
  getCountryTopPlaces(countryName: string): Promise<PlaceRecommendation[]>;
}

import type { ExternalReview, PlaceRecommendation } from "@world-universities/shared";
import type {
  PlacesGateway,
  ResolveUniversityPlaceInput
} from "../../domain/repositories/PlacesGateway.js";

interface GooglePlaceCandidate {
  place_id: string;
}

interface GoogleReview {
  author_name?: string;
  rating?: number;
  text?: string;
  time?: number;
}

interface GooglePlaceSearchResult {
  place_id: string;
  name: string;
  rating?: number;
  formatted_address?: string;
}

interface GoogleFindPlaceResponse {
  candidates: GooglePlaceCandidate[];
  status: string;
}

interface GoogleDetailsResponse {
  result?: {
    reviews?: GoogleReview[];
  };
  status: string;
}

interface GoogleTextSearchResponse {
  results: GooglePlaceSearchResult[];
  status: string;
}

export class GooglePlacesGateway implements PlacesGateway {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async resolveUniversityPlaceId(
    input: ResolveUniversityPlaceInput
  ): Promise<string | null> {
    if (!this.apiKey) {
      return null;
    }

    const query = `${input.universityName} ${input.city ?? ""} ${
      input.countryName
    } university`;
    const params = new URLSearchParams({
      input: query,
      inputtype: "textquery",
      fields: "place_id",
      key: this.apiKey
    });

    const data = await this.safeFetchJson<GoogleFindPlaceResponse>(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${params.toString()}`
    );

    if (!data || !Array.isArray(data.candidates) || !data.candidates.length) {
      return null;
    }

    return data.candidates[0].place_id ?? null;
  }

  async getUniversityReviews(placeId: string): Promise<ExternalReview[]> {
    if (!this.apiKey) {
      return [];
    }

    const params = new URLSearchParams({
      place_id: placeId,
      fields: "reviews",
      key: this.apiKey
    });

    const data = await this.safeFetchJson<GoogleDetailsResponse>(
      `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`
    );

    const reviews = data?.result?.reviews ?? [];
    return reviews.slice(0, 10).map((review) => ({
      authorName: review.author_name || "Anonymous",
      rating: Number(review.rating ?? 0),
      text: review.text || "",
      publishedAt: review.time
        ? new Date(review.time * 1000).toISOString()
        : null
    }));
  }

  async getCountryTopPlaces(countryName: string): Promise<PlaceRecommendation[]> {
    if (!this.apiKey) {
      return [];
    }

    const params = new URLSearchParams({
      query: `top tourist attractions in ${countryName}`,
      key: this.apiKey
    });

    const data = await this.safeFetchJson<GoogleTextSearchResponse>(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`
    );

    const results = data?.results ?? [];
    return results.slice(0, 12).map((result) => ({
      placeId: result.place_id,
      name: result.name,
      rating: result.rating ?? null,
      address: result.formatted_address ?? null
    }));
  }

  private async safeFetchJson<T>(url: string): Promise<T | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return null;
      }
      return (await response.json()) as T;
    } catch {
      return null;
    }
  }
}

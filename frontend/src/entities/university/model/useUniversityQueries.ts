import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/shared/api/httpClient";
import type {
  ExternalReview,
  PlaceRecommendation,
  UniversityDetails,
  UniversityListItem
} from "@/shared/types/contracts";

interface UniversityBrowseResponse {
  items: UniversityListItem[];
  total: number;
}

interface UniversityListResponse {
  items: UniversityListItem[];
}

interface CountriesResponse {
  items: Array<{ code: string; name: string }>;
}

export function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: () => getJson<CountriesResponse>("/api/countries"),
    staleTime: Infinity
  });
}

export function useBrowseUniversities(page = 1, limit = 24) {
  return useQuery({
    queryKey: ["universities-browse", page, limit],
    queryFn: () =>
      getJson<UniversityBrowseResponse>(
        `/api/universities/browse?page=${page}&limit=${limit}`
      )
  });
}

interface UniversityDetailsResponse {
  item: UniversityDetails;
}

interface ReviewResponse {
  items: ExternalReview[];
}

interface PlaceResponse {
  items: PlaceRecommendation[];
}

export function useUniversitiesByProgram(program: string, countryCode?: string) {
  return useQuery({
    queryKey: ["universities-by-program", program, countryCode ?? ""],
    queryFn: () => {
      const params = new URLSearchParams({ program });
      if (countryCode) params.set("country", countryCode);
      return getJson<UniversityListResponse>(`/api/universities?${params.toString()}`);
    },
    enabled: program.trim().length >= 2
  });
}

export function useUniversityDetails(id?: number) {
  return useQuery({
    queryKey: ["university-details", id],
    queryFn: () => getJson<UniversityDetailsResponse>(`/api/universities/${id}`),
    enabled: Number.isInteger(id)
  });
}

export function useUniversityReviews(id?: number) {
  return useQuery({
    queryKey: ["university-reviews", id],
    queryFn: () => getJson<ReviewResponse>(`/api/universities/${id}/reviews`),
    enabled: Number.isInteger(id)
  });
}

export function useCountryPlaces(id?: number) {
  return useQuery({
    queryKey: ["country-places", id],
    queryFn: () => getJson<PlaceResponse>(`/api/universities/${id}/places`),
    enabled: Number.isInteger(id)
  });
}

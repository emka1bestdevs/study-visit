import type {
  ExternalReview,
  PlaceRecommendation,
  ProgramSuggestion,
  UniversityDetails,
  UniversityListItem
} from "@world-universities/shared";

export interface UniversityRecord {
  id: number;
  name: string;
  countryCode: string;
  countryName: string;
  city: string | null;
  website: string | null;
  googlePlaceId: string | null;
}

export interface CachedPayload<T> {
  payload: T;
  fetchedAt: Date;
}

export interface UniversityListPage {
  items: UniversityListItem[];
  total: number;
}

export interface UniversityRepository {
  findAll(page: number, limit: number): Promise<UniversityListPage>;
  searchPrograms(query: string, limit: number): Promise<ProgramSuggestion[]>;
  findAllCountries(): Promise<Array<{ code: string; name: string }>>;
  findUniversitiesByProgram(
    programQuery: string,
    limit: number,
    countryCode?: string
  ): Promise<UniversityListItem[]>;
  findUniversityDetailsById(id: number): Promise<UniversityDetails | null>;
  findUniversityRecordById(id: number): Promise<UniversityRecord | null>;
  saveUniversityGooglePlaceId(id: number, placeId: string): Promise<void>;
  getUniversityReviewCache(
    universityId: number
  ): Promise<CachedPayload<ExternalReview[]> | null>;
  saveUniversityReviewCache(
    universityId: number,
    payload: ExternalReview[]
  ): Promise<void>;
  getCountryPlaceCache(
    countryCode: string
  ): Promise<CachedPayload<PlaceRecommendation[]> | null>;
  saveCountryPlaceCache(
    countryCode: string,
    payload: PlaceRecommendation[]
  ): Promise<void>;
}

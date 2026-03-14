export interface ProgramSuggestion {
  slug: string;
  name: string;
}

export interface UniversityListItem {
  id: number;
  name: string;
  countryCode: string;
  countryName: string;
  city: string | null;
  website: string | null;
  imageUrl: string | null;
}

export interface UniversityDetails extends UniversityListItem {
  faculties: Array<{
    id: number;
    name: string;
    programs: Array<{
      id: number;
      name: string;
      slug: string;
    }>;
  }>;
}

export interface ExternalReview {
  authorName: string;
  rating: number;
  text: string;
  publishedAt: string | null;
}

export interface PlaceRecommendation {
  name: string;
  rating: number | null;
  address: string | null;
  placeId: string;
  imageUrl: string | null;
}

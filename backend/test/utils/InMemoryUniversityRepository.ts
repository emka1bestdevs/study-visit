import type {
  ExternalReview,
  PlaceRecommendation,
  UniversityDetails,
  UniversityListItem
} from "@world-universities/shared";
import type {
  CachedPayload,
  UniversityRecord,
  UniversityRepository
} from "../../src/domain/repositories/UniversityRepository.js";

interface InMemoryUniversityData {
  record: UniversityRecord;
  details: UniversityDetails;
}

export class InMemoryUniversityRepository implements UniversityRepository {
  private readonly data = new Map<number, InMemoryUniversityData>();
  private readonly reviewCache = new Map<number, CachedPayload<ExternalReview[]>>();
  private readonly countryCache = new Map<
    string,
    CachedPayload<PlaceRecommendation[]>
  >();

  constructor(initial: InMemoryUniversityData[]) {
    for (const item of initial) {
      this.data.set(item.record.id, item);
    }
  }

  async searchPrograms(query: string) {
    const normalized = query.toLowerCase();
    const programs = new Map<string, string>();

    for (const item of this.data.values()) {
      for (const faculty of item.details.faculties) {
        for (const program of faculty.programs) {
          if (program.name.toLowerCase().includes(normalized)) {
            programs.set(program.slug, program.name);
          }
        }
      }
    }

    return Array.from(programs.entries()).map(([slug, name]) => ({ slug, name }));
  }

  async findUniversitiesByProgram(programQuery: string): Promise<UniversityListItem[]> {
    const normalized = programQuery.toLowerCase();
    const results: UniversityListItem[] = [];

    for (const item of this.data.values()) {
      const matches = item.details.faculties.some((faculty) =>
        faculty.programs.some((program) =>
          `${program.name} ${program.slug}`.toLowerCase().includes(normalized)
        )
      );

      if (matches) {
        results.push({
          id: item.record.id,
          name: item.record.name,
          countryCode: item.record.countryCode,
          countryName: item.record.countryName,
          city: item.record.city,
          website: item.record.website
        });
      }
    }

    return results;
  }

  async findUniversityDetailsById(id: number) {
    return this.data.get(id)?.details ?? null;
  }

  async findUniversityRecordById(id: number) {
    return this.data.get(id)?.record ?? null;
  }

  async saveUniversityGooglePlaceId(id: number, placeId: string) {
    const item = this.data.get(id);
    if (item) {
      item.record.googlePlaceId = placeId;
    }
  }

  async getUniversityReviewCache(universityId: number) {
    return this.reviewCache.get(universityId) ?? null;
  }

  async saveUniversityReviewCache(universityId: number, payload: ExternalReview[]) {
    this.reviewCache.set(universityId, {
      payload,
      fetchedAt: new Date()
    });
  }

  async getCountryPlaceCache(countryCode: string) {
    return this.countryCache.get(countryCode) ?? null;
  }

  async saveCountryPlaceCache(
    countryCode: string,
    payload: PlaceRecommendation[]
  ) {
    this.countryCache.set(countryCode, {
      payload,
      fetchedAt: new Date()
    });
  }
}

export function createSampleUniversities(): InMemoryUniversityData[] {
  return [
    {
      record: {
        id: 1,
        name: "Global Tech University",
        countryCode: "US",
        countryName: "United States",
        city: "New York",
        website: "https://gtu.example.edu",
        googlePlaceId: null
      },
      details: {
        id: 1,
        name: "Global Tech University",
        countryCode: "US",
        countryName: "United States",
        city: "New York",
        website: "https://gtu.example.edu",
        faculties: [
          {
            id: 10,
            name: "Faculty of Engineering",
            programs: [
              { id: 100, name: "Computer Science", slug: "computer-science" },
              {
                id: 101,
                name: "Electrical Engineering",
                slug: "electrical-engineering"
              }
            ]
          }
        ]
      }
    },
    {
      record: {
        id: 2,
        name: "Medical Research University",
        countryCode: "DE",
        countryName: "Germany",
        city: "Berlin",
        website: "https://mru.example.edu",
        googlePlaceId: "place-med-2"
      },
      details: {
        id: 2,
        name: "Medical Research University",
        countryCode: "DE",
        countryName: "Germany",
        city: "Berlin",
        website: "https://mru.example.edu",
        faculties: [
          {
            id: 20,
            name: "Faculty of Health Sciences",
            programs: [
              { id: 200, name: "Medicine", slug: "medicine" },
              { id: 201, name: "Nursing", slug: "nursing" }
            ]
          }
        ]
      }
    }
  ];
}

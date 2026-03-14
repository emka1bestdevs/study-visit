import { Prisma } from "@prisma/client";
import slugify from "slugify";
import type {
  ExternalReview,
  PlaceRecommendation,
  ProgramSuggestion,
  UniversityDetails,
  UniversityListItem
} from "@world-universities/shared";
import type {
  CachedPayload,
  UniversityListPage,
  UniversityRecord,
  UniversityRepository
} from "../../domain/repositories/UniversityRepository.js";
import { prismaClient } from "./prismaClient.js";

function asTypedArray<T>(value: Prisma.JsonValue): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }
  return [];
}

export class PrismaUniversityRepository implements UniversityRepository {
  async findAll(page: number, limit: number): Promise<UniversityListPage> {
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      prismaClient.university.findMany({
        skip,
        take: limit,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          countryCode: true,
          city: true,
          website: true,
          imageUrl: true,
          country: { select: { name: true } }
        }
      }),
      prismaClient.university.count()
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        name: row.name,
        countryCode: row.countryCode,
        countryName: row.country.name,
        city: row.city,
        website: row.website,
        imageUrl: row.imageUrl
      })),
      total
    };
  }

  async searchPrograms(query: string, limit: number): Promise<ProgramSuggestion[]> {
    const slugQuery = slugify(query, { lower: true, strict: true, trim: true });

    const rows = await prismaClient.program.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { slug: { contains: slugQuery } }
        ]
      },
      select: {
        slug: true,
        name: true
      },
      orderBy: {
        name: "asc"
      },
      take: limit * 3
    });

    const deduped = new Map<string, ProgramSuggestion>();
    for (const row of rows) {
      if (!deduped.has(row.slug)) {
        deduped.set(row.slug, row);
      }
      if (deduped.size >= limit) {
        break;
      }
    }

    return Array.from(deduped.values());
  }

  async findAllCountries(): Promise<Array<{ code: string; name: string }>> {
    const rows = await prismaClient.country.findMany({
      select: { code: true, name: true },
      orderBy: { name: "asc" }
    });
    return rows;
  }

  async findUniversitiesByProgram(
    programQuery: string,
    limit: number,
    countryCode?: string
  ): Promise<UniversityListItem[]> {
    const slugQuery = slugify(programQuery, {
      lower: true,
      strict: true,
      trim: true
    });

    const rows = await prismaClient.university.findMany({
      where: {
        ...(countryCode ? { countryCode } : {}),
        faculties: {
          some: {
            programs: {
              some: {
                OR: [
                  { name: { contains: programQuery, mode: "insensitive" } },
                  { slug: { contains: slugQuery } }
                ]
              }
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        countryCode: true,
        city: true,
        website: true,
        imageUrl: true,
        country: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        name: "asc"
      },
      take: limit
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      countryCode: row.countryCode,
      countryName: row.country.name,
      city: row.city,
      website: row.website,
      imageUrl: row.imageUrl
    }));
  }

  async findUniversityDetailsById(id: number): Promise<UniversityDetails | null> {
    const row = await prismaClient.university.findUnique({
      where: { id },
      include: {
        country: true,
        faculties: {
          include: {
            programs: true
          },
          orderBy: {
            name: "asc"
          }
        }
      }
    });

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      name: row.name,
      countryCode: row.countryCode,
      countryName: row.country.name,
      city: row.city,
      website: row.website,
      imageUrl: row.imageUrl,
      faculties: row.faculties.map((faculty) => ({
        id: faculty.id,
        name: faculty.name,
        programs: faculty.programs
          .map((program) => ({
            id: program.id,
            name: program.name,
            slug: program.slug
          }))
          .sort((a, b) => a.name.localeCompare(b.name))
      }))
    };
  }

  async findUniversityRecordById(id: number): Promise<UniversityRecord | null> {
    const row = await prismaClient.university.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        countryCode: true,
        city: true,
        website: true,
        googlePlaceId: true,
        country: {
          select: {
            name: true
          }
        }
      }
    });

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      name: row.name,
      countryCode: row.countryCode,
      countryName: row.country.name,
      city: row.city,
      website: row.website,
      googlePlaceId: row.googlePlaceId
    };
  }

  async saveUniversityGooglePlaceId(id: number, placeId: string): Promise<void> {
    await prismaClient.university.update({
      where: { id },
      data: {
        googlePlaceId: placeId
      }
    });
  }

  async getUniversityReviewCache(
    universityId: number
  ): Promise<CachedPayload<ExternalReview[]> | null> {
    const row = await prismaClient.universityReviewCache.findUnique({
      where: {
        universityId
      }
    });

    if (!row) {
      return null;
    }

    return {
      payload: asTypedArray<ExternalReview>(row.payload),
      fetchedAt: row.fetchedAt
    };
  }

  async saveUniversityReviewCache(
    universityId: number,
    payload: ExternalReview[]
  ): Promise<void> {
    await prismaClient.universityReviewCache.upsert({
      where: {
        universityId
      },
      create: {
        universityId,
        payload,
        fetchedAt: new Date()
      },
      update: {
        payload,
        fetchedAt: new Date()
      }
    });
  }

  async getCountryPlaceCache(
    countryCode: string
  ): Promise<CachedPayload<PlaceRecommendation[]> | null> {
    const row = await prismaClient.countryPlaceCache.findUnique({
      where: {
        countryCode
      }
    });

    if (!row) {
      return null;
    }

    return {
      payload: asTypedArray<PlaceRecommendation>(row.payload),
      fetchedAt: row.fetchedAt
    };
  }

  async saveCountryPlaceCache(
    countryCode: string,
    payload: PlaceRecommendation[]
  ): Promise<void> {
    await prismaClient.countryPlaceCache.upsert({
      where: {
        countryCode
      },
      create: {
        countryCode,
        payload,
        fetchedAt: new Date()
      },
      update: {
        payload,
        fetchedAt: new Date()
      }
    });
  }
}

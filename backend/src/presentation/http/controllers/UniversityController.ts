import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { BrowseUniversitiesUseCase } from "../../../application/use-cases/BrowseUniversitiesUseCase.js";
import { GetCountryPlacesUseCase } from "../../../application/use-cases/GetCountryPlacesUseCase.js";
import { GetUniversityDetailsUseCase } from "../../../application/use-cases/GetUniversityDetailsUseCase.js";
import { GetUniversityReviewsUseCase } from "../../../application/use-cases/GetUniversityReviewsUseCase.js";
import { SearchProgramsUseCase } from "../../../application/use-cases/SearchProgramsUseCase.js";
import { SearchUniversitiesByProgramUseCase } from "../../../application/use-cases/SearchUniversitiesByProgramUseCase.js";

const searchProgramsQuerySchema = z.object({
  query: z.string().default("")
});

const searchUniversitiesQuerySchema = z.object({
  program: z.string().default(""),
  country: z.string().optional()
});

const browseQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(24)
});

const universityIdSchema = z.coerce.number().int().positive();

interface UniversityControllerDeps {
  browseUniversitiesUseCase: BrowseUniversitiesUseCase;
  searchProgramsUseCase: SearchProgramsUseCase;
  searchUniversitiesUseCase: SearchUniversitiesByProgramUseCase;
  getUniversityDetailsUseCase: GetUniversityDetailsUseCase;
  getUniversityReviewsUseCase: GetUniversityReviewsUseCase;
  getCountryPlacesUseCase: GetCountryPlacesUseCase;
}

export class UniversityController {
  private readonly browseUniversitiesUseCase: BrowseUniversitiesUseCase;
  private readonly searchProgramsUseCase: SearchProgramsUseCase;
  private readonly searchUniversitiesUseCase: SearchUniversitiesByProgramUseCase;
  private readonly getUniversityDetailsUseCase: GetUniversityDetailsUseCase;
  private readonly getUniversityReviewsUseCase: GetUniversityReviewsUseCase;
  private readonly getCountryPlacesUseCase: GetCountryPlacesUseCase;

  constructor(deps: UniversityControllerDeps) {
    this.browseUniversitiesUseCase = deps.browseUniversitiesUseCase;
    this.searchProgramsUseCase = deps.searchProgramsUseCase;
    this.searchUniversitiesUseCase = deps.searchUniversitiesUseCase;
    this.getUniversityDetailsUseCase = deps.getUniversityDetailsUseCase;
    this.getUniversityReviewsUseCase = deps.getUniversityReviewsUseCase;
    this.getCountryPlacesUseCase = deps.getCountryPlacesUseCase;
  }

  browseUniversities = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { page, limit } = browseQuerySchema.parse(request.query);
      const result = await this.browseUniversitiesUseCase.execute(page, limit);
      response.json(result);
    } catch (error) {
      next(error);
    }
  };

  searchPrograms = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { query } = searchProgramsQuerySchema.parse(request.query);
      const items = await this.searchProgramsUseCase.execute(query);
      response.json({ items });
    } catch (error) {
      next(error);
    }
  };

  getCountries = async (
    _request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const items = await this.browseUniversitiesUseCase.executeCountries();
      response.json({ items });
    } catch (error) {
      next(error);
    }
  };

  searchUniversitiesByProgram = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { program, country } = searchUniversitiesQuerySchema.parse(request.query);
      const items = await this.searchUniversitiesUseCase.execute(program, country);
      response.json({ items });
    } catch (error) {
      next(error);
    }
  };

  getUniversityDetails = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const id = universityIdSchema.parse(request.params.id);
      const item = await this.getUniversityDetailsUseCase.execute(id);
      response.json({ item });
    } catch (error) {
      next(error);
    }
  };

  getUniversityReviews = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const id = universityIdSchema.parse(request.params.id);
      const items = await this.getUniversityReviewsUseCase.execute(id);
      response.json({ items });
    } catch (error) {
      next(error);
    }
  };

  getCountryPlaces = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const id = universityIdSchema.parse(request.params.id);
      const items = await this.getCountryPlacesUseCase.execute(id);
      response.json({ items });
    } catch (error) {
      next(error);
    }
  };
}

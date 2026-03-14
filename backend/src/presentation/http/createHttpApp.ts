import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { NotFoundError } from "../../shared/errors.js";
import { UniversityController } from "./controllers/UniversityController.js";
import { createApiRouter } from "./routes/createApiRouter.js";

export function createHttpApp(universityController: UniversityController) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.use("/api", createApiRouter(universityController));

  app.use(
    (error: unknown, _request: Request, response: Response, _next: NextFunction) => {
      if (error instanceof ZodError) {
        return response.status(400).json({
          message: "Invalid request",
          issues: error.issues
        });
      }

      if (error instanceof NotFoundError) {
        return response.status(404).json({
          message: error.message
        });
      }

      return response.status(500).json({
        message: "Internal server error"
      });
    }
  );

  return app;
}

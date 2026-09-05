import { ZodError } from "zod";

/**
 * Express middleware to validate request body using a Zod schema
 * @param {import("zod").ZodSchema} schema 
 */
export function validateBody(schema) {
  return async (req, res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return res.status(400).json({
          success: false,
          message: formattedErrors[0]?.message || "Données invalides.",
          errors: formattedErrors,
        });
      }
      next(error);
    }
  };
}

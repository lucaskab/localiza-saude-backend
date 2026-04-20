import type { FastifyInstance } from "fastify";
import {
	hasZodFastifySchemaValidationErrors,
	ResponseSerializationError,
} from "fastify-type-provider-zod";
import { ZodError } from "zod";
import { BadRequestError } from "./routes/_errors/bad-request-error";
import { UnauthorizedError } from "./routes/_errors/unauthorized-error";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
	if (error instanceof ResponseSerializationError) {
		console.error(error.cause);

		return reply.status(500).send({
			error: "ResponseSerializationError",
			message: "The response did not match the declared schema.",
			details: error.message,
		});
	}

	if (error instanceof ZodError) {
		return reply.status(400).send({
			message: "Validation error",
			errors: error.issues,
		});
	}

	if (hasZodFastifySchemaValidationErrors(error)) {
		return reply.status(400).send({
			message: "Validation error",
			errors: error.validation.map((validationError) => {
				const issue = validationError.params?.issue;
				return (
					issue || {
						path: validationError.instancePath || validationError.params?.path,
						message: validationError.message || "Validation failed",
						code: validationError.params?.code,
					}
				);
			}),
		});
	}

	if (error instanceof BadRequestError) {
		return reply.status(400).send({
			message: error.message,
		});
	}

	if (error instanceof UnauthorizedError) {
		return reply.status(401).send({
			message: error.message,
		});
	}

	console.error(error);
	// send error to some observability platform

	return reply.status(500).send({
		message: "Internal server error",
	});
};

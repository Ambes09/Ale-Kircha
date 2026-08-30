import { ZodError } from 'zod';
export function validate(schema) {
    return async (request, reply) => {
        try {
            const data = schema.parse(request.body);
            request.body = data;
        }
        catch (error) {
            if (error instanceof ZodError) {
                return reply.status(400).send({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid request data',
                        details: error.errors,
                    },
                });
            }
            throw error;
        }
    };
}
export function validateQuery(schema) {
    return async (request, reply) => {
        try {
            const data = schema.parse(request.query);
            request.query = data;
        }
        catch (error) {
            if (error instanceof ZodError) {
                return reply.status(400).send({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid query parameters',
                        details: error.errors,
                    },
                });
            }
            throw error;
        }
    };
}

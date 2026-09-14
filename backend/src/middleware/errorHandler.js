import env from '../config/env.js';

/**
 * 404 Not Found Middleware
 * Intercepts requests to undefined routes and returns structured JSON error.
 */
export function notFoundHandler(req, res, next) {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
}

/**
 * Global Error Handler Middleware
 * Catches all unhandled exceptions in the Express pipeline and returns formatted responses.
 */
// eslint-disable-next-line no-unused-vars
export function globalErrorHandler(err, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : (err.status || 500);

  console.error(`❌ [Error Handler] [${req.method} ${req.originalUrl}] ${err.message}`);
  if (env.NODE_ENV === 'development' && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'An internal server error occurred.',
    errors: err.errors || undefined,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

export default {
  notFoundHandler,
  globalErrorHandler
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Unwrap a Supabase result or throw
function must(result) {
  if (result.error) throw new HttpError(500, result.error.message);
  return result.data;
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 && !err.status ? 'Internal server error' : err.message });
}

module.exports = { HttpError, asyncHandler, must, errorHandler };

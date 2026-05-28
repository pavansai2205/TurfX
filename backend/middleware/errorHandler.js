const errorHandler = (err, req, res, next) => {
  console.error('SERVER ERROR LOG:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Handle Prisma Specific Errors
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          message: 'A duplicate record already exists in the system.',
          error: err.meta,
        });
      case 'P2003':
        return res.status(400).json({
          message: 'A relational integrity constraint failed (Foreign Key violation).',
          error: err.meta,
        });
      case 'P2025':
        return res.status(404).json({
          message: 'The requested record was not found.',
          error: err.meta,
        });
      default:
        return res.status(500).json({
          message: 'Database operation failed.',
          error: err.message,
        });
    }
  }

  // Default Error Response
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : null,
  });
};

export default errorHandler;

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error("Global error handler:", err.stack);

  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error",
  });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};

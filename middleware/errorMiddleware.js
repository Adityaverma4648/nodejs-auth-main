// errorMiddleware.js

const errorMiddleware = (err, req, res, next) => {
    console.error("🔥 Error Middleware Caught:", err);
  
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
  
    res.status(statusCode).json({
      success: false,
      message,
      // Optional: Only show stack trace in development mode
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  };
  
  module.exports = errorMiddleware;
  
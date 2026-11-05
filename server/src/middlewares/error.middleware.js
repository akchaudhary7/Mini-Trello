const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (res.headersSent) {
    return next(err);
  }

  const isDuplicateEmail = err.code === 11000 && err.keyPattern?.email;

  const statusCode = isDuplicateEmail
    ? 409
    : err.statusCode || err.status || 500;

const message = isDuplicateEmail ? "Email already exists" : process.env.NODE_ENV === "production" && statusCode >=500 ? "Internal Server Error" : err.message || "Something went wrong"

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorHandler;

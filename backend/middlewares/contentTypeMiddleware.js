const checkContentType = (req, res, next) => {
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('application/json')) {
    return res.status(415).json({
      message: 'Unsupported Media Type: Content-Type must be application/json'
    });
  }
  next();
};

module.exports = { checkContentType };

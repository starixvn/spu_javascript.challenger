
const jwt = require('jsonwebtoken');
const config =  require('../config/index.js');

const verifyTokenMiddleware = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
      const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;
      jwt.verify(tokenString, config.SECRET_KEY, (err, decoded) => {
          if (err) {
              console.error(err);
              res.status(403).json({ message: 'Token verification failed' });
          } else {
              req.user = decoded;
              next();
          }
      });
    } else {
        res.status(401).json({ message: 'Token not provided' });
    }
};

module.exports = {
    verifyTokenMiddleware
};
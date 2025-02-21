const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const { handleResponse } = require('./handleResponse');


const generateToken = (userId, role, secret, expiresIn = '1h') => {
  return new Promise((resolve, reject) => {
    const payload = {
      aud: "parkhya.in",
      user_id: userId,
      role_id: role,
    };

    const options = {
      subject: `${userId}`,
      expiresIn,
    };

    JWT.sign(payload, secret, options, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
};

const signAccessToken = (userId, role) => {
  return generateToken(userId, role, process.env.ACCESS_TOKEN_SECRET);
};

const signResetToken = (email) => {
  return new Promise((resolve, reject) => {
    const payload = { email };
    const options = { expiresIn: '1h' };

    JWT.sign(payload, process.env.ACCESS_TOKEN_SECRET, options, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
};

const encryptToken = (token) => {

  const key = crypto.createHash('sha256').update(process.env.ACCESS_TOKEN_SECRET).digest();

  const cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.from(process.env.ACCESS_TOKEN_SECRET).slice(0, 16));
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

const decryptToken = (encryptedToken) => {
  const key = crypto.createHash('sha256').update(process.env.ACCESS_TOKEN_SECRET).digest();

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(process.env.ACCESS_TOKEN_SECRET).slice(0, 16));
  let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const verifyUser = async (req, res, next) => {

  let encryptedToken = req.headers.authorization;
  if (!encryptedToken) {
    encryptedToken = req.query.token || req.body.token;
  }

  if (!encryptedToken) {
    return handleResponse(res, 401, "No token provided");
  }

  try {
    const decryptedToken = decryptToken(encryptedToken);

    const decodedToken = JWT.verify(decryptedToken, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedToken) {
      return handleResponse(res, 401, "Invalid or expired token");
    }

    req.user = decodedToken;
    next();

  } catch (err) {
    return handleResponse(res, 401, "Invalid or expired token");
  }
};

const verifyAdmin = async (req, res, next) => {
  let encryptedToken = req.headers.authorization;
  if (!encryptedToken) {
    encryptedToken = req.query.token || req.body.token;
  }

  if (!encryptedToken) {
    return handleResponse(res, 401, "No token provided");
  }

  try {
    const decryptedToken = decryptToken(encryptedToken);

    const decodedToken = JWT.verify(decryptedToken, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedToken) {
      return handleResponse(res, 401, "Invalid or expired token");
    }

    req.user = decodedToken;

    // Check if the user is an admin (role_id === 2)
    if (req.user.role_id === 2) {
      next();  // Allow the request to proceed
    } else {
      return handleResponse(res, 403, "Forbidden. You are not an admin.");
    }

  } catch (error) {
    return handleResponse(res, 401, "Unauthorized. Invalid token.");
  }
};

const verifySeller = async (req, res, next) => {
  let encryptedToken = req.headers.authorization;
  if (!encryptedToken) {
    encryptedToken = req.query.token || req.body.token;
  }

  if (!encryptedToken) {
    return handleResponse(res, 401, "No token provided");
  }

  try {
    const decryptedToken = decryptToken(encryptedToken);

    const decodedToken = JWT.verify(decryptedToken, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedToken) {
      return handleResponse(res, 401, "Invalid or expired token");
    }

    req.user = decodedToken;

    // Check if the user is a seller (role_id === 3)
    if (req.user.role_id === 3) {
      next();  // Allow the request to proceed
    } else {
      return handleResponse(res, 403, "Forbidden. You are not a seller.");
    }

  } catch (error) {
    return handleResponse(res, 401, "Unauthorized. Invalid token.");
  }
};

module.exports = {
  signAccessToken,
  signResetToken,
  verifyAdmin,
  verifyUser,
  decryptToken,
  encryptToken,
  verifySeller
};

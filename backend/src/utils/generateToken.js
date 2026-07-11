import jwt from 'jsonwebtoken';

/**
 * Generates a signed JSON Web Token (JWT) containing the user ID.
 * @param {string} id - The MongoDB User Object ID
 * @returns {string} Signed JWT token
 */
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
  }
  return jwt.sign({ id }, secret, {
    expiresIn: '30d', // JWT will expire in 30 days
  });
};

export default generateToken;

// src/middleware/auth.middleware.js
//
// verifyToken — protects any route that requires the user to be logged in.
// HOW IT WORKS:
//   1. The frontend attaches the JWT to every request as:
//        Authorization: Bearer <token>
//   2. This middleware reads that header, extracts the token string,
//      and verifies it using our JWT_SECRET.
//   3. If valid, jwt.verify() returns the decoded payload (what we put in it at login).
//      We attach that to req.user so any controller can read req.user.userId / req.user.role.
//   4. If the token is missing, malformed, or expired, we immediately return 401.
//
// USAGE in routes:
//   router.get('/some-protected-route', verifyToken, someController)

import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
  // Check that the Authorization header exists and starts with "Bearer "
  const authHeader = req.headers['authorization']

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Access denied. No token provided.',
    })
  }

  // Extract just the token part (everything after "Bearer ")
  const token = authHeader.split(' ')[1]

  try {
    // jwt.verify() throws an error if the token is invalid or expired.
    // On success it returns the decoded payload object.
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach decoded payload to the request — controllers can now read:
    //   req.user.userId  → the user's database ID
    //   req.user.role    → 'ADMIN' or 'STUDENT'
    req.user = decoded

    next() // token is valid — let the request continue to the controller
  } catch (error) {
    // TokenExpiredError or JsonWebTokenError — token is bad
    return res.status(401).json({
      message: 'Invalid or expired token. Please log in again.',
    })
  }
}

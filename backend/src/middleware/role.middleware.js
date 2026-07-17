// src/middleware/role.middleware.js
//
// Role guards — used AFTER verifyToken to further restrict access by role.
// verifyToken already confirmed the token is valid and set req.user.
// These middlewares check that req.user.role matches the required role.
//
// USAGE in routes (always chain AFTER verifyToken):
//   router.post('/exams', verifyToken, requireAdmin, createExam)
//   router.get('/my-results', verifyToken, requireStudent, getMyResults)
//
// HTTP 403 Forbidden = "I know who you are, but you don't have permission."
// (Different from 401 Unauthorized = "I don't know who you are.")

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      message: 'Access denied. This action requires an Admin account.',
    })
  }
  next()
}

export const requireStudent = (req, res, next) => {
  if (req.user?.role !== 'STUDENT') {
    return res.status(403).json({
      message: 'Access denied. This action requires a Student account.',
    })
  }
  next()
}

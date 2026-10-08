import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

export function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1]
  }
  return null
}

export async function authenticate(request) {
  const token = getTokenFromRequest(request)
  if (!token) {
    return { error: 'No token provided', status: 401 }
  }
  const decoded = verifyToken(token)
  if (!decoded) {
    return { error: 'Invalid or expired token', status: 401 }
  }
  return { userId: decoded.id }
}
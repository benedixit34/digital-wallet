import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import dotenv from "dotenv"

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: No token provided' })
    return
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ error: 'Forbidden: Invalid token' })
      return
    }
    req.user = user
    next()
  })
}


export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user) {
    res.status(403).json({ message: "You are already logged in and cannot register again." })
  }
  next()
}
// src/middlewares/auth.ts

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
    userId?: number
    userType?: 'volunteer' | 'enterprise'
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Token não fornecido' })
        return
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as unknown as {
            id: number
            type: 'volunteer' | 'enterprise'
        }
        req.userId = decoded.id
        req.userType = decoded.type
        next()
    } catch {
        res.status(401).json({ error: 'Token inválido ou expirado' })
    }
}

export const requireVolunteer = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.userType !== 'volunteer') {
    res.status(403).json({ error: 'Acesso permitido apenas para voluntários' })
    return
  }
  next()
}

export const requireEnterprise = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.userType !== 'enterprise') {
    res.status(403).json({ error: 'Acesso permitido apenas para empresas' })
    return
  }
  next()
}
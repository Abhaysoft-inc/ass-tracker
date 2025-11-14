import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'thisissecret';

// Extend Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

export const authenticateHOD = (req: Request, res: Response, next: NextFunction) => {
    authenticateToken(req, res, () => {
        console.log('HOD authentication check - user:', req.user);
        if (req.user?.type !== 'HOD') {
            console.log('HOD access denied - user type:', req.user?.type);
            return res.status(403).json({ error: 'HOD access required' });
        }
        console.log('HOD authentication successful');
        next();
    });
};

export const authenticateStudent = (req: Request, res: Response, next: NextFunction) => {
    authenticateToken(req, res, () => {
        if (req.user?.type !== 'STUDENT') {
            return res.status(403).json({ error: 'Student access required' });
        }
        next();
    });
};

export const authenticateFaculty = (req: Request, res: Response, next: NextFunction) => {
    authenticateToken(req, res, () => {
        if (req.user?.type !== 'FACULTY') {
            return res.status(403).json({ error: 'Faculty access required' });
        }
        next();
    });
};
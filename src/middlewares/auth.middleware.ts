import { Response, NextFunction } from 'express';

function authMiddleware(req: any, res: Response, next: NextFunction) {
    if (req.session.user) {
        next();
    } else res.render('index.ejs');
}

export default authMiddleware;

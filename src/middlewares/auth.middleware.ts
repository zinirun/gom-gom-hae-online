import { Response, Request, NextFunction } from 'express';

function authMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.session.user) {
        res.render('index.html');
    } else next();
}

export default authMiddleware;

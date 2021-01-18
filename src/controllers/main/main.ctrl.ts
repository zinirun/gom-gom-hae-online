import { Router, Request, Response, NextFunction } from 'express';
import authMiddleware from '../../middlewares/auth.middleware';
import Controller from '../../interfaces/controller.interface';

class MainController implements Controller {
    public path = '/';
    public router = Router();
    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, authMiddleware, this.getMain);
    }

    private getMain = (req: Request, res: Response, next: NextFunction) => {
        const { rid, uid } = req.session.user;
        res.render('index.html', {
            ch1: 'checked',
            uid,
            msg: `${uid}님, 플레이만 누르시면 됩니다!`,
        });
    };
}

export default MainController;

import { Router, Response } from 'express';
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
        this.router.get(`${this.path}logout`, authMiddleware, this.getLogout);
    }

    private getMain = (req: any, res: Response) => {
        const { rid, uid } = req.session.user;
        res.render('index.ejs', {
            ch1: rid == 1 && 'checked',
            ch2: rid == 2 && 'checked',
            ch3: rid == 3 && 'checked',
            ch4: rid == 4 && 'checked',
            ch5: rid == 5 && 'checked',
            uid,
            msg: `${uid}님, 플레이만 누르시면 됩니다!`,
        });
    };

    private getLogout = (req: any, res: Response) => {
        req.session.destroy((err) => {
            if (err) res.redirect('/');
            else
                res.render('index.ejs', {
                    msg: '로그아웃 되었습니다.',
                });
        });
    };
}

export default MainController;

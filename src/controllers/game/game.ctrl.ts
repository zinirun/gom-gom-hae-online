import { Router, Request, Response } from 'express';
import Controller from '../../interfaces/controller.interface';
import GameInstance from './game.instance';
import joinGameResult from '../../interfaces/joinGameResult.interface';

class GameController implements Controller {
    public path = '/game';
    public router = Router();
    public game;
    constructor() {
        // 게임컨트롤러에서 게임인스턴스 초기화
        this.initializeRoutes();
        this.game = new GameInstance();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}`, this.postStartGame);
        this.router.get(`${this.path}`, (_, res: Response) =>
            res.render('index.ejs', { msg: '잘못된 접근입니다. 다시 접속하세요.' }),
        );
        this.router.get(`${this.path}/winner`, (req: any, res: Response) =>
            res.render('index.ejs', { win: req.session.user.userId }),
        );
        this.router.get(`${this.path}/loser`, (req: any, res: Response) =>
            res.render('index.ejs', { lose: req.session.user.userId }),
        );
    }

    private postStartGame = async (req: any, res: Response) => {
        const uid = req.body.nickname;
        const rid = req.body.ch;
        await this.game
            .enterGame(uid, rid)
            .then(() => {
                req.session.user = {
                    uid,
                    rid,
                };
                res.render('game.ejs', {
                    userId: uid,
                    roomId: rid,
                });
            })
            .catch((error: joinGameResult) => {
                const { message } = error;
                res.render('index.ejs', {
                    msg: message,
                });
            });
    };
}

export default GameController;

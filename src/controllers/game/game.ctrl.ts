import { Router, Request, Response } from 'express';
import Controller from '../../interfaces/controller.interface';
import GameInstance from './game.instance';
import joinGameResult from '../../interfaces/joinGameResult.interface';

class GameController implements Controller {
    public path = '/game';
    public router = Router();
    private game;
    constructor() {
        // 게임컨트롤러에서 게임인스턴스 초기화
        this.initializeRoutes();
        this.game = new GameInstance();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}`, this.postStartGame);
    }

    private postStartGame = async (req: any, res: Response) => {
        const uid = req.body.nickname;
        const rid = req.body.ch;
        await this.game
            .joinGame(uid, rid)
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

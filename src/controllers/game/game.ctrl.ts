import { Router, Request, Response } from 'express';
import Controller from '../../interfaces/controller.interface';
import GameInstance from './game.instance';

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
        this.router.post(`${this.path}/`, this.postStartGame);
    }

    private postStartGame = (req: any, res: Response) => {
        const userId = req.body.nickname;
        const roomId = req.body.ch;

        if (chCheck(roomId) == 1) {
            res.render('index.html', {
                msg: '채널 인원 초과입니다.',
            });
        } else if (userId.length < 2) {
            res.render('index.html', {
                msg: '2글자 이상 입력하세요.',
            });
        } else if (userId.includes(' ')) {
            res.render('index.html', {
                msg: '공백은 사용할 수 없어요.',
            });
        } else if (!usernameValid(userId)) {
            res.render('index.html', {
                msg: '사용 중인 이름이에요.',
            });
        } else if (!roomId) {
            res.render('index.html', {
                msg: '접속할 채널을 선택하세요.',
            });
        } else {
            //ID 조건 만족 시 입장
            req.session.user = {
                uid: userId,
                rid: roomId,
                authorized: true,
            };
            res.render('game.html', {
                userId,
                roomId,
            });
        }
    };
}

export default GameController;

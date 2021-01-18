import { Router, Request, Response, NextFunction } from 'express';
import Controller from '../interfaces/controller.interface';

class GameController implements Controller {
    public path = '/process';
    public router = Router();
    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        //this.router.get(`${this.path}/`, this.getUserById);
    }

    //private getUserById = async (req: Request, res: Response, next: NextFunction) => {};
}

export default GameController;

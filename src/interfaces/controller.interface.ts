import { Router } from 'express';

interface Controller {
    path: string;
    router: Router;
    game?: any;
}

export default Controller;

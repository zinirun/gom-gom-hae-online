import 'dotenv/config';
import App from './app';
import GameController from '../controllers/game.ctrl';

const app = new App([new GameController()]);

app.listen();

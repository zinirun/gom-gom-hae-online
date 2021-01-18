import 'dotenv/config';
import App from './app';
import GameController from '../controllers/game/game.ctrl';
import MainController from '../controllers/main/main.ctrl';

const app = new App([new GameController(), new MainController()]);

app.listen();

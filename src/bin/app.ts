import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as logger from 'morgan';
import * as expressSession from 'express-session';
import * as http from 'http';
import * as helmet from 'helmet';
import * as hpp from 'hpp';
import Controller from '../interfaces/controller.interface';
import socketActions from '../controllers/game/socket.actions';

class App {
    private readonly port: number = parseInt(process.env.PORT) || 4000;
    public app: express.Application;
    private server: http.Server;
    private game: any;
    private io: SocketIO.Server;

    constructor(controllers: Controller[]) {
        this.app = express();
        this.createServer();
        this.setSockets();
        this.setViewEngine();
        this.setStatic();
        this.setMiddlewares();
        this.initializeControllers(controllers);
        this.setErrorHandler();
        this.bindSocketActions();
    }

    public listen() {
        this.server.listen(this.port, () => {
            console.log(`Server started : ${this.port}`);
        });
    }

    private bindSocketActions() {
        this.io.on('connection', (socket: any) => socketActions(socket, this.io, this.game));
    }

    private createServer() {
        this.server = http.createServer(this.app);
    }

    private setMiddlewares() {
        //this.app.use(helmet());
        //this.app.use(hpp());
        this.app.use(logger('dev'));
        this.app.use(cookieParser());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(
            expressSession({
                secret: process.env.SESSION_SECRET,
                resave: true,
                saveUninitialized: true,
            }),
        );
        this.app.use(cors());
    }

    private setSockets() {
        this.io = require('socket.io')(this.server);
    }

    private setViewEngine() {
        this.app.set('view engine', 'ejs');
        this.app.set('views', './public');
        this.app.engine('html', require('ejs').renderFile);
    }

    private setStatic() {
        this.app.use('/public', express.static(__dirname + '/../../public'));
    }

    private initializeControllers(controllers: Controller[]) {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
            if (controller.game) {
                this.game = controller.game;
            }
        });
    }

    private setErrorHandler() {
        this.app.use((req, res, _) => {
            res.status(404).render('404.ejs');
        });

        this.app.use((err, req, res, _) => {
            res.status(500).render('404.ejs');
        });
    }
}

export default App;

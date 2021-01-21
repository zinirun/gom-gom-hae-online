import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as logger from 'morgan';
import * as expressSession from 'express-session';
import * as helmet from 'helmet';
import * as hpp from 'hpp';
import Controller from '../interfaces/controller.interface';

class App {
    public app: express.Application;
    private port: number;

    constructor(controllers: Controller[]) {
        this.app = express();
        this.port = parseInt(process.env.PORT) || 4000;
        this.setViewEngine();
        this.setStatic();
        this.setMiddlewares();
        this.initializeControllers(controllers);
        this.setErrorHandler();
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`Express started at port ${this.port}`);
        });
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
        this.app.use('/public', express.static(__dirname + '/../../public'));
        this.app.use(cors());
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

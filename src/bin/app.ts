import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as logger from 'morgan';
import * as helmet from 'helmet';
import * as hpp from 'hpp';

class App {
    public app: express.Application;
    constructor() {
        this.app = express();
        this.setMiddleware();
        this.getRouting();
    }

    public listen() {
        this.app.listen(process.env.PORT, () => {
            console.log(`App listening on the port ${process.env.PORT}`);
        });
    }

    setMiddleware() {
        //this.app.use(helmet());
        //this.app.use(hpp());
        this.app.use(logger('combined'));
        this.app.use(cookieParser());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(cors());
    }

    getRouting() {
        this.app.use(require('./controllers'));
    }
}

export default App;

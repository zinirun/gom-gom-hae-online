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
        this.listenSocketActions();
    }

    public listen() {
        this.server.listen(this.port, () => {
            console.log(`Server started : ${this.port}`);
        });
    }

    private listenSocketActions() {
        this.io.on('connection', (socket: any) => {
            console.log(`[socket] connected : ${socket.id}`);

            socket.on('join-lobby', () => {
                const LOBBY = this.game.LOBBY;
                socket.join(LOBBY);
                const lobbyCount = this.io.sockets.adapter.rooms.lobby
                    ? this.io.sockets.adapter.rooms.lobby.length
                    : 1;
                const inGameUserCounts = this.game.getInGameUserCounts();
                this.io.sockets.in(LOBBY).emit('counts', inGameUserCounts, lobbyCount);
            });

            socket.on('join-game', (data: any) => {
                const { roomId, userId } = data;
                socket.join(roomId.toString());
                const remainUsers = this.game.joinSocket(parseInt(roomId), userId, socket.id);
                this.io.sockets.in(roomId.toString()).emit('newUser', userId);
                this.io.sockets.in(roomId.toString()).emit('refreshUser', remainUsers, 1);
            });

            socket.on('new-game', (data: any): void => {
                this.game.resetRoomWord(data.roomId);
            });

            socket.on('answer', async (data: any, word: string) => {
                const { roomId, userId } = data;
                await this.game
                    .pushAnswer(userId, roomId, word)
                    .then((result) => {
                        const { myCount, displayWord } = result;
                        this.io.sockets
                            .in(roomId.toString())
                            .emit('answer', userId, word, myCount, displayWord);
                    })
                    .catch((errorMsg) =>
                        this.io.sockets.in(roomId.toString()).emit('notice', userId, errorMsg),
                    );
            });

            socket.on('chat', (data: any, msg: string): void => {
                const { userId, roomId } = data;
                this.io.sockets.in(roomId.toString()).emit('chatmsg', userId, msg);
            });

            socket.on('gg', (data: any, whodie: string) => {
                const { roomId } = data;
                //const remainUsers = this.game.quitUser(roomId, whodie);
                this.io.sockets.in(roomId.toString()).emit('gameover', whodie);
            });

            socket.on('disconnect', () => {
                if (!socket.id) return;
                const exitedTargetInGame = this.game.findBySocketId(socket.id);
                if (exitedTargetInGame) {
                    const { roomId, userId } = exitedTargetInGame;
                    const remainUsers = this.game.quitUser(roomId, userId);
                    this.io.sockets.in(roomId.toString()).emit('logout', userId);
                    this.io.sockets.in(roomId.toString()).emit('keepgame', remainUsers);
                    this.io.sockets.in(roomId.toString()).emit('refreshUser', remainUsers, 0);
                    console.log(
                        `[socket] disconnected - socket.id: ${socket.id}/ roomId: ${roomId}/ userId: ${userId}`,
                    );
                }
            });
        });
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
        this.app.use('/public', express.static(__dirname + '/../../public'));
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

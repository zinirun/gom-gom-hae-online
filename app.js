var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    static = require('serve-static'),
    errorHandler = require('errorhandler'),
    expressErrorHandler = require('express-error-handler'),
    expressSession = require('express-session'),
    ejs = require('ejs'),
    fs = require('fs'),
    url = require('url'), //채팅 모듈
    cors = require('cors'); //ajax 요청시 cors 지원

var mysql = require('mysql');
var mySqlClient = mysql.createConnection({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'wjswls1',
    database: 'gom',
    debug: false
});

app.set('port', process.env.PORT || 80);
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use('/public', express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized: true
}));
app.use(cors());

var router = express.Router();

//MainPage 라우터
router.route('/').get(function (req, res) {
    console.log('mainpage 호출됨');

    if (req.session.user) {
        console.log('유저정보 존재 - 게임 이동');
        res.redirect('/process/game');
    } else {
        console.log("유저정보 없음 - 메인 이동");
        fs.readFile('./public/index.html', 'utf8', function (error, data) {
            res.send(ejs.render(data, {
                logindata: '닉네임 정하고 시작!'
            }));
        });
    }
});

//메인 로그인 라우터
router.route('/process/login').post(function (req, res) {
    console.log('로그인 라우터 호출됨');

    var paramId = req.body.nickname;

    if (req.session.user) {
        console.log('유저정보 존재 - 게임 이동');
        res.redirect('/process/game');
    } else {
        req.session.user = {
            id: paramId,
            authorized: true
        };
        res.redirect('/process/game');
    }
});

//게임 입장 라우터
router.route('/process/game/').get(function (req, res) {
    console.log('게임 입장 라우터 호출됨');
    if (req.session.user) {
        //채팅 서버 입장
        var userId = req.session.user.id;
        var roomId = 1;
        fs.readFile('./public/game.html', 'utf8', function (error, data) {
            console.log(req.session.user.id + ":id로 렌더링");
            res.send(ejs.render(data, {
                userId: userId,
                roomId: roomId
            }));
        });

    } else {
        console.log("유저정보 없음 - 메인 이동");
        res.redirect('/');
    }
});

//로그아웃 라우터
router.route('/process/logout').get(function (req, res) {
    console.log('/process/logout 호출됨');
    if (req.session.user) {
        console.log('로그아웃함');
        req.session.destroy(function (err) {
            if (err) throw err;
            console.log('세션 삭제하고 로그아웃됨');
            fs.readFile('./public/index.html', 'utf8', function (error, data) {
                res.send(ejs.render(data, {
                    logindata: '로그아웃 완료!'
                }));
            });
        });
    } else {
        console.log('로그인 상태 아님');
        res.redirect('/');
    }
});

// 라우터 끝
app.use('/', router);

// 404 에러 페이지 처리
var errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);


//웹서버 생성
http.listen(app.get('port'),
    function () {
        console.log('express server started with port ' + app.get('port'));
    }
);

io.on('connection', function (socket) {

    console.log('채팅 서버 연결됨');

    var room, user;

    socket.on('join', function (data) {
        room = data.roomId;
        user = data.userId;
        
        socket.join(room);

        console.log(user + '<-id/room->' + room + ' 채팅서버로 join함');

        io.sockets.in(room).emit('login', user);
    });

    socket.on('say', function (msg) {
        console.log(user + '님이 ' + room + '번 채팅방에 메시지 보냄: ' + msg);
        io.sockets.in(room).emit('my_message', msg);
        socket.broadcast.to(room).emit('message', msg, user);

    });

    socket.on('disconnect', function () {

    });

})
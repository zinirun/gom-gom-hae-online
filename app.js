var express = require('express');

var app = express();

var http = require('http').createServer(app);

var io = require('socket.io')(http);

var path = require('path'),
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

app.set('port', process.env.PORT || 3000);
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
app.use(cors()); //cors를 미들웨어로 사용하도록 등록

var router = express.Router();

var nowNickName;

// 라우터 시작

//MainPage 라우터
router.route('/').get(function (req, res) {
    console.log('mainpage 호출됨');

    if (req.session.user) {
        console.log('유저정보 존재 - 방 이동');
        res.redirect('/process/enter');
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
    console.log('회원가입 라우터 호출됨');
    if (req.session.user) {
        console.log('세션 유저데이터 있음 - Enter 이동');
        res.redirect('/process/enter');
    } else {
        var paramName = req.body.getNickname;
        if (paramName == '' || paramName.includes(' ') || paramName.length < 3) {
            console.log('username 공백, 빈칸 포함 - return');
            fs.readFile('./public/index.html', 'utf8', function (error, data) {
                res.send(ejs.render(data, {
                    logindata: '빈칸 사용이나 2글자 이하로는 안돼!'
                }));
            });
        } else {
            mySqlClient.query('insert into `user` set `username` = ?', [paramName], function (error, row) {
                if (row) {
                    req.session.user = {
                        id: paramName,
                        authorized: true
                    };
                    res.redirect('/process/enter');
                } else {
                    console.dir(error);
                    res.redirect('/');
                }
            });
        }
    }
});

//로그인 후 게임방 목록 입장
router.route('/process/enter').get(function (req, res) {
    if (req.session.user) {
        nickname = req.session.user.id;
        fs.readFile('./public/room.html', 'utf8', function (error, data) {
            mySqlClient.query('SELECT `title`, `secret`, `master`, `wordlimit`, `timelimit`, `id` FROM `game` WHERE `status` = 0 ORDER BY `id` DESC', function (error, rows) {
                if (error) {
                    console.log('error : ', error.message);
                    return;
                } else {
                    res.send(ejs.render(data, {
                        mynick: req.session.user.id,
                        gameList: rows
                    }));
                    return true;
                }
            });
        });
    } else {
        res.redirect('/');
    }
});

//방 만들기 Enter
router.route('/process/gomakegame').get(function (req, res) {
    if (req.session.user) {
        fs.readFile('./public/makeroom.html', 'utf8', function (error, data) {
            res.send(ejs.render(data, {}));
        });
    } else {
        res.redirect('/');
    }
});

//방 만들기 라우터
router.route('/process/makegame').post(function (req, res) {
    console.log('방만들기 라우터 호출됨');
    if (req.session.user) {
        var title = req.body.title;
        var password = req.body.password;
        var wordlimit = req.body.wordlimit;
        var timelimit = req.body.timelimit;
        var noblack = req.body.noblack;
        var secret = 0;
        if (password) secret = 1;
        if (!title) title = '심심이는 곰곰해';
        if (!noblack) noblack = 1;
        var master = req.session.user.id;

        var makeData = {
            title: title,
            secret: secret,
            password: password,
            master: master,
            wordlimit: wordlimit,
            timelimit: timelimit,
            noblack: noblack
        }

        mySqlClient.query('insert into `game` set ?', makeData, function (error, row) {
            if (row) {
                console.log('게임 생성 완료');
                mySqlClient.query('select `id` from `game` where `master` = ?', [master], function (error, row) {
                    if (row) {
                        res.redirect('/process/ready/' + row[0].id)
                    } else {
                        console.dir(error);
                        res.redirect('/');
                    }
                });

            } else {
                console.dir(error);
                res.redirect('/');
            }
        });

    } else {
        res.redirect('/');
    }
});

//준비방 입장 라우터
router.route('/process/ready/:id').get(function (req, res) {
    if (req.session.user) {
        var id = req.params.id;
        var joiner = req.session.user.id;
        nowNickName = req.session.user.id;

        console.log('param id:' + id);

        mySqlClient.query('update `game` set `joiner` = ? where `id` = ?;', [joiner, id], function (error, row) {
            if (row) {
                console.log('joiner 추가 완료');
                mySqlClient.query('select `id`, `title`, `master`, `joiner`, `chatlog` from `game` where `id` = ?', [id], function (error, row) {
                    if (row) {
                        id = row[0].id;
                        title = row[0].title;
                        master = row[0].master;
                        joiner = row[0].joiner;

                        fs.readFile('./public/ready.html', 'utf8', function (error, data) {
                            res.send(ejs.render(data, {
                                id: id,
                                title: title,
                                master: master,
                                joiner: joiner
                            }));
                        });
                    } else {
                        console.dir(error);
                        res.redirect('/');
                    }
                });
            } else {
                console.dir(error);
                res.redirect('/');
            }
        });
    } else {
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

//===== 서버 시작 =====//

//확인되지 않은 예외 처리 - 서버 프로세스 종료하지 않고 유지함
process.on('uncaughtException', function (err) {
    console.log('uncaughtException 발생함 : ' + err);
    console.log('서버 프로세스 종료하지 않고 유지함.');

    console.log(err.stack);
});

// 프로세스 종료 시에 데이터베이스 연결 해제
process.on('SIGTERM', function () {
    console.log("프로세스가 종료됩니다.");
    app.close();
});

app.on('close', function () {
    console.log("Express 서버 객체가 종료됩니다.");
    if (database.db) {
        database.db.close();
    }
});

var whoIsTyping = [];
var whoIsOn = [];

io.on('connection', function (socket) {

    var nickName = nowNickName;
    whoIsOn.push(nickName);
    socket.emit('selfData', {
        nickName: nickName
    });

    //someone who has this nickName has logged in
    //original :
    //io.emit('login', nickName);
    io.emit('login', whoIsOn);
    //basically after login, execute refreshUsers	
    //io.emit('refreshUsers', whoIsOn);

    socket.on('say', function (msg) {
        console.log('message: ' + msg);
        socket.broadcast.emit('chat message', nickName + ' :  ' + msg);
        socket.emit('mySaying', '나 :  ' + msg);
    });

    //disconnect is in socket
    socket.on('disconnect', function () {
        console.log(nickName + ' : DISCONNECTED');
        whoIsOn.splice(whoIsOn.indexOf(nickName), 1);
        io.emit('logout', {
            nickNameArr: whoIsOn,
            disconnected: nickName
        });
    });
});


//웹서버 생성
http.listen(app.get('port'),
    function () {
        console.log('express server started with port ' + app.get('port'));
    }
);

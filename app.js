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
app.use(cors());

//사전 DB 생성
let dict = fs.readFileSync('./dict/dict.txt').toString().replace(/\r/g, "").split('\n');

var userId;
var roomId = 1;

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
            res.send(ejs.render(data, {}));
        });
    }
});

//메인 로그인 라우터
router.route('/process/login').post(function (req, res) {
    console.log('로그인 라우터 호출됨');

    userId = req.body.nickname;

    if (req.session.user) {
        console.log('유저정보 존재 - 게임 이동');
        res.redirect('/process/game');
    } else {
        if (userId.length < 2) {
            fs.readFile('./public/index.html', 'utf8', function (error, data) {
                res.send(ejs.render(data, {
                    msg: '2글자 이상 입력하세요!'
                }));
            });
        } else if (userId.includes(" ")) {
            fs.readFile('./public/index.html', 'utf8', function (error, data) {
                res.send(ejs.render(data, {
                    msg: '공백은 사용할 수 없어요.'
                }));
            });
        } else if (!usernameValid(userId)) {
            fs.readFile('./public/index.html', 'utf8', function (error, data) {
                res.send(ejs.render(data, {
                    msg: '사용 중인 이름이에요.'
                }));
            });
        } else {
            req.session.user = {
                id: userId,
                authorized: true
            };
            res.redirect('/process/game');
        }
    }
});

//게임 입장 라우터
router.route('/process/game').get(function (req, res) {
    console.log('게임 입장 라우터 호출됨');
    if (req.session.user) {
        //채팅 서버 입장
        fs.readFile('./public/game.html', 'utf8', function (error, data) {
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
                    msg: '로그아웃 되었습니다.'
                }));
            });
        });
    } else {
        console.log('로그인 상태 아님');
        res.redirect('/process/game');
    }
});

// 라우터 끝
app.use('/', router);

//로그인 시 중복 이름 검사
function usernameValid(name) {
    for (var i in onUser) {
        if (onUser[i].userId == name) {
            return false;
            break;
        }
    }
    return true;
}

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

//상황에 맞는 초기화가 관건..!
var onUser = [[6], []]; //room별 user data, cnt는 length로 계산
var userWord = [[], []]; //room 별 userword data
var wordCnt = []; //room 별 word 개수 (첫번째는 3글자인지만 체크)

io.on('connection', function (socket) {

    console.log('채팅 서버 연결됨');
    var room;
    var user = userId || socket.id;

    socket.on('join', function (data) {
        room = data.roomId;

        socket.join(room);
        
        if (!userCheckDup(onUser, userId)) {
            console.log("room 유저 수: " + onUser[room].length);
            onUser[room][onUser[room].length] = user;
        }

        //for (var i in array)
        for (var i = 0; i < onUser.length; i++) {
            console.log(onUser[room][i]);
        }

        console.log(user + '<-id/room->' + room + ' 채팅서버로 join함');

        io.sockets.in(room).emit('refreshUser', onUser[room]);
    });

    //끝말잇기 답 전송
    socket.on('answer', function (msg) { 
        console.log(user + '님이 ' + room + '번 채팅방에 메시지 보냄: ' + msg);

        if (wordCnt.length < 1) {
            wordCnt[room] = 0;
        }

        var wordStatus = userWordPush(msg);
        console.log("wordStatus:" + wordStatus);
        
        //다음 단어 턴 사용자 지정, 혼자면 자신으로
        var next_user = onUser[room][1] || user;

        if (wordStatus == 0) {
            io.sockets.in(room).emit('answer', user, msg);
            io.sockets.in(room).emit('turn', next_user);
        } else {
            var warnMsg = "";

            if (wordStatus == 1) {
                warnMsg = "세 글자만 입력하세요!";
            } else if (wordStatus == 2) {
                warnMsg = "사용했던 단어에요!";
            } else if (wordStatus == 3) {
                warnMsg = "끝말이 아니에요!";
            } else if (wordStatus == 4) {
                warnMsg = "사전에 없는 말이에요!";
            }

            console.log(wordStatus + ': 단어 오류 발생, warnMsg: ' + warnMsg);
            io.sockets.in(room).emit('notice', user, warnMsg);
        }
    });

    //유저 0명일때 userWord, wordCnt 초기화 필요
    socket.on('disconnect', function () {
        console.log(user + "님 서버 연결 종료됨");
        if (!socket.id) return;
        console.log(onUser[room].length||0 + "명 접속중")
        if (onUser[room].length||0 < 1) {
            console.log("room 인원 0명 -> 단어 DB 초기화");
            word_n_cnt_reset(userWord, wordCnt);
        }
        userDelete(onUser, user);
        io.sockets.in(room).emit('refreshUser', onUser);
    });

    function word_n_cnt_reset(uw, wc) {
        for (var i in uw) {
            if (uw[i].roomId == room) {
                uw.pop();
            }
        }
        wc[room] = 0;
    }

    function userCheckDup(userlist, id) {
        var check = 0; //0: 중복X
        for(var i in onUser){
            if(onUser[room][i] == id){
                check = 1;
                break;
            }
        }
        return check;
    }

    function userDelete(array, id) {
        for(var i in array){
            if(array[room][i] == id){
                array.splice(i,1);
            }
        }
    }

    //isAnswer 통과하면 단어 추가
    //userWord[roomId][word ++]
    function userWordPush(word) {
        var stat = isAnswer(word);
        if (stat == 0) { //통과
            //단어 추가
            userWord[room][wordCnt[room]] = word;

            console.log("userWord 추가완료 : " + userWord[room][wordCnt[room]]);

            wordCnt[room]++; //단어 cnt 증가
            return stat;

        } else { //불통과
            return stat;
        }
    }

    function isAnswer(word) {
        //3글자인지 -> 썼던 말인지 -> 끝말인지 -> 사전에 있는지
        var ansCheck = 0; // 0이면 통과
        var cnt = wordCnt[room];
        console.log("wordcount: " + cnt);

        if (word.length != 3) {
            ansCheck = 1;
            return ansCheck;
        }

        if (isAnswerUsed(word) == 1) {
            ansCheck = 2;
            return ansCheck;
        }

        if (cnt > 0) { //두음법칙 적용해야함..
            if (isAnswerFinalword(word) == 1) {
                ansCheck = 3;
                return ansCheck;
            }
        }

        if (isAnswerInDict(word) == 1) {
            ansCheck = 4;
            return ansCheck;
        }

        return ansCheck;
    }

    function isAnswerUsed(word) {
        console.log("isAnswerUsed 호출");
        var check = 0; //0이면 통과
        for (var i in userWord[room]) {
            if (userWord[room][i].includes(word)) {
                check = 1;
                break;
            }
        }
        return check;
    }

    function isAnswerFinalword(word) {
        console.log("isAnswerFinalword 호출");
        var check = 1; //0이면 통과

        //신규 단어(word) 첫말 = 이전 단어 끝말 체크
        if (userWord[room][wordCnt[room] - 1].slice(-1) === word.charAt(0)) {
            check = 0;
        }

        return check;
    }

    function isAnswerInDict(word) {
        console.log("isAnswerInDict 호출");
        var check = 1; //0이면 통과
        for (var i in dict) {
            if (dict[i] == word) {
                console.log("단어사전에 포함된 단어:" + word);
                check = 0;
                break;
            }
        }

        return check;
    }
});

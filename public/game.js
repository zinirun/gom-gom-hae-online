var onUserList = [];
var prev_onUserList = [];
var curUser, turnCnt, userCnt;

var socketId = '';
var userColor = ['#ffe98a', '#ebff8a', '#b0fff4', '#e8deff', '#ffdef6'];

$(function () {
    const socket = io();

    const timeover = data.roomId == 5 ? 30000 : 12000;

    $('#m').focus();

    socket.emit('join-game', data);

    //단어 입력시
    $('#ansForm').submit(function () {
        if ($('#m').val() != '') {
            var ansData = $('#m').val();
            socket.emit('answer', data, ansData);
            $('#m').val('');
        }
        return false;
    });

    //채팅 입력시
    $('#chatForm').submit(function () {
        if ($('#c').val() != '') {
            var chatData = $('#c').val();
            socket.emit('chat', data, chatData);
            $('#c').val('');
        }
        return false;
    });

    //새로운 사용자 입장 시
    socket.on('newUser', function (newuser) {
        $('#chatlog').append(
            '<li style="color:slateblue"><b>[' + newuser + ']님이 입장하셨습니다!</b>',
        );
        $('.userchat_box').scrollTop($('.userchat_box')[0].scrollHeight);
    });

    //로그아웃 메시지 출력
    socket.on('logout', function (outuser) {
        $('#chatlog').append(
            '<li style="color:crimson"><b>[' + outuser + ']님이 퇴장하셨습니다.</b>',
        );
        $('.userchat_box').scrollTop($('.userchat_box')[0].scrollHeight);
    });

    //정답 입력 - wordchain 삽입
    socket.on('answer', function (nickname, answer, userCount, can) {
        $('#m').attr('placeholder', can);

        //5개 이상이면 첫 자식노드 1개 삭제
        if ($('#chain').children().length > 4) {
            $('#chain').children().first().remove();
        }

        //정답 입력 배경 색 사용자에 맞게 변경
        if (nickname == data.userId) {
            $('#m').css('background', userColor[userCount]);
        }

        //워드체인에 메시지(3글자) 삽입
        $('#chain').append(
            '<div style="background:' +
                userColor[(turnCnt - 1) % userCnt] +
                ';" class="userchain"><div class="answer" id="answer_' +
                nickname +
                '">' +
                answer +
                '</div><div class="usernick">' +
                nickname +
                '</div></div>',
        );

        //게임 진행(다음 턴)
        keepGame();

        if (nickname == data.userId) {
            $('.text_answer_info').css('padding', '0');
            $('.text_answer_info').html('');
        }
    });

    socket.on('winner', function (win) {
        //최종 승리자(1명) 출력, winner 라우터 이동
        if (win == data.userId) {
            socket.emit('new-game', data);
            window.location.href = '/process/winner';
        }
    });

    //gg 발생 시 나머지 user - keepgame, userlist 다시 받아옴
    socket.on('keepgame', function (remain_userlist) {
        onUserList = remain_userlist.splice();
        turnCnt = 0;
        keepGame();
    });

    // TIMER PART //

    var viewtime = timeover;
    var timebarPx = 210;

    const tick = () => {
        $('#timeBar').html((viewtime / 1000).toFixed(1));
        $('#timeBar').css('width', timebarPx + 'px');

        if (viewtime < 10) {
            socket.emit('gg', data, curUser);
            getout(curUser); //타임오버 대상 게임오버
        } else if (viewtime < 10 && curUser != data.userId) {
            if (!curUser) {
                getout(data.userId); //첫 단어 입력 안하면 게임오버처리
            }
        } else {
            viewtime -= 100;
            timebarPx -= 210 / (timeover / 100);
        }
    };

    // TIMER PART END //

    //유저 변화, 새로운 게임 시작
    function newGame() {
        socket.emit('new-game', data);
        turnCnt = 0;

        keepGame();
    }

    //턴 넘김 -> turn()
    function keepGame() {
        curUser = onUserList[turnCnt++ % userCnt] || data.userId;
        if (data.roomId != 5) {
            if (turnCnt >= 10) {
                timeover = 10000;
            }
            if (turnCnt >= 20) {
                timeover = 7000;
            }
            if (turnCnt >= 30) {
                timeover = 5000;
            }
            if (turnCnt >= 40) {
                timeover = 3000;
            }
        }

        turn(curUser);
    }

    var timer_pause = false;
    var start = setInterval(tick, 100);

    function turn(next_nickname) {
        if (!timer_pause) {
            //타이머 존재하면
            clearTimer(); //전 타이머 삭제, 새 타이머 시작 (flag)
        }

        viewtime = timeover; //reset
        timebarPx = 210;

        //내 턴
        if (data.userId == next_nickname) {
            if (timer_pause == true) {
                start = setInterval(tick, 100);
                timer_pause = false;
            }

            $('#m').attr('disabled', false);
            $('.mychat').css('animation', 'highlightMe 1s 0s infinite');
            $('#m').focus();
            $('#ans_msg').html('나의 ' + turnCnt + '번째 턴!');

            //첫 단어인 경우 안내
            if (turnCnt == 1) {
                $('#ans_msg').html('첫 단어를 입력하세요!');
            }

            $('#ans_msg').css('color', 'crimson');
        } else {
            //내 턴 아닐 때

            clearTimer();

            $('#timeBar').html('곧 나의 턴!');
            $('#timeBar').css('width', '210px');

            $('#m').attr('disabled', true);
            $('.mychat').css('animation', '');
            $('#c').focus();
            $('#ans_msg').html(next_nickname + '의 ' + turnCnt + '번째 턴!');
            $('#ans_msg').css('color', 'green');
        }

        $('.userChar').css('border-color', 'white');
        $('.userChar:nth-child(' + (((turnCnt - 1) % userCnt) + 1) + ')').css(
            'border-bottom-color',
            'crimson',
        );
    }

    function clearTimer() {
        clearInterval(start);
        timer_pause = true; //flag
    }

    //타 유저에게 게임오버 chatlog 출력
    socket.on('gameover', function (gguser) {
        $('#chatlog').append(
            '<li style="color:crimson"><b>[' +
                gguser +
                ']님 게임 오버! 첫 턴부터 게임을 이어갑니다!</b>',
        );
        $('.userchat_box').scrollTop($('.userchat_box')[0].scrollHeight);
    });

    //게임오버 - 퇴장
    function getout(gguser) {
        if (gguser == data.userId) {
            window.location.href = '/process/loser';
        }
    }

    socket.on('notice', function (nickname, message) {
        if (nickname == data.userId) {
            $('.text_answer_info').css('padding', '0.2rem 0.4rem');
            $('.text_answer_info').html(message);
        }
    });

    //유저 변화시 onUserList 업데이트
    socket.on('refreshUser', function (userlist, isNewGame) {
        refreshUserList(userlist);

        prev_onUserList = [];
        prev_onUserList = userlist.slice(); //최신화 할 userlist:prev_

        if (!listcheck(onUserList, prev_onUserList)) {
            //dupList(onUserList, prev_onUserList);
            onUserList = prev_onUserList.slice();

            userCnt = onUserList.length;

            //새 유저 들어왔을 때만 newGame 호출(gg인 경우 새 게임 X)
            if (isNewGame == 1) {
                $('#chatlog').append(
                    '<li style="color:crimson"><b>유저의 변화를 감지했습니다. 새로운 게임을 시작합니다!</b>',
                );
                $('.userchat_box').scrollTop($('.userchat_box')[0].scrollHeight);

                newGame();
            }
        }
    });

    function listcheck(now, prev) {
        for (var i in prev) {
            if (now[i] != prev[i]) {
                return false;
            }
        }
        return true;
    }

    socket.on('chatmsg', function (nickname, msg) {
        //채팅 메시지 삽입
        $('#chatlog').append('<li><b>' + nickname + '</b>: ' + msg);
        $('.userchat_box').scrollTop($('.userchat_box')[0].scrollHeight);
    });

    function refreshUserList(onUser) {
        $('#userList').empty();
        for (var i in onUser) {
            $('#userList').append(
                '<div class="userChar"style="background: ' +
                    userColor[i] +
                    '"><img class="uicon" src="/public/uicon.png" width="50px" height="50px" ><p class="username">' +
                    onUser[i] +
                    '</p></div>',
            );
        }
    }

    $('#logoutBtn').click(function (e) {
        e.preventDefault();
        socket.emit('logout'); //로그아웃 정의 필요
    });
});

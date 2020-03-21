        //when the document is ready.
        $(function () {
            //about DOM
            $('#m').focus();

            //socket io
            var socket = io();
            var fontColor = 'black';
            var nickName = '';

            $('#typeForm').submit(function () {
                //submit only if it's not empty
                if ($('#m').val() != "") {
                    socket.emit('say', $('#m').val());
                    //say event means someone transmitted chat
                    $('#m').val('');
                }
                return false;
            });

            socket.on('selfData', function (obj) {
                console.log('getting initial data from server');
                nickName = obj.nickName;
                $('#nickName').attr('placeholder', 'NickName : ' + nickName);
            });

            socket.on('chat message', function (msg) {
                $('#messages').append($('<li>').text(msg));
            });

            socket.on('login', function (nickNameArr) {
                var newbie = nickNameArr[nickNameArr.length - 1];
                editUsers(nickNameArr);
                $('#messages').append($('<li>').text(newbie + "님이 채팅방에 입장하였습니다."));
            })

            socket.on('mySaying', function (msg) {
                $('#messages').append($('<li>').text(msg));
            });

            socket.on('logout', function (received) {
                var nickNameArr = received.whoIsOn;
                var disconnected = received.disconnected;
                $('#messages').append($('<li>').text(`${disconnected}님이 나가셨습니다.`));
                editUsers(nickNameArr);
            })

            function editUsers(nickNameArr) {
                $('#whoIsInBox ul').children().each((index, item) => {
                    $(item).remove();
                });
                for (person in nickNameArr) {
                    $('#whoIsInBox ul').append($('<li>').text(nickNameArr[person]));
                }
            }
        });

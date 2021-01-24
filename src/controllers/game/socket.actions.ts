const socketActions = (socket: any, io: any, game: any) => {
    console.log(`[socket] connected : ${socket.id}`);

    socket.on('join-lobby', () => {
        const LOBBY: string = game.LOBBY;
        socket.join(LOBBY);
        const lobbyCount = game.enterLobby();
        const inGameUserCounts = game.getInGameUserCounts();
        io.sockets.in(LOBBY).emit('counts', inGameUserCounts, lobbyCount);
        console.log(`[socket] lobby joined - L:${lobbyCount} G:[${inGameUserCounts}]`);
    });

    socket.on(
        'join-game',
        async (data: any): Promise<void> => {
            return await new Promise(() => {
                const { roomId, userId } = data;
                socket.join(roomId.toString());
                const remainUsers = game.joinSocket(parseInt(roomId), userId, socket.id);
                io.sockets.in(roomId.toString()).emit('newUser', userId);
                io.sockets.in(roomId.toString()).emit('refreshUser', remainUsers, 1);

                const LOBBY: string = game.LOBBY;
                const lobbyCount = game.getLobbyCount();
                const inGameUserCounts = game.getInGameUserCounts();
                io.sockets.in(LOBBY).emit('counts', inGameUserCounts, lobbyCount);
            });
        },
    );

    socket.on('new-game', (data: any): void => {
        game.resetRoomWord(data.roomId);
    });

    socket.on('answer', async (data: any, word: string) => {
        const { roomId, userId } = data;
        await game
            .pushAnswer(userId, roomId, word)
            .then((result) => {
                const { myCount, displayWord } = result;
                io.sockets.in(roomId.toString()).emit('answer', userId, word, myCount, displayWord);
            })
            .catch((errorMsg) => io.sockets.in(roomId.toString()).emit('notice', userId, errorMsg));
    });

    socket.on('chat', (data: any, msg: string): void => {
        const { userId, roomId } = data;
        io.sockets.in(roomId.toString()).emit('chatmsg', userId, msg);
    });

    socket.on('gg', (data: any, whodie: string) => {
        const { roomId } = data;
        io.sockets.in(roomId.toString()).emit('gameover', whodie);
    });

    socket.on('disconnect', () => {
        if (!socket.id) return;
        const exitedTargetInGame = game.findBySocketId(socket.id);
        if (exitedTargetInGame) {
            const { roomId, userId } = exitedTargetInGame;
            const remainUsers = game.quitUser(roomId, userId);
            io.sockets.in(roomId.toString()).emit('logout', userId);
            io.sockets.in(roomId.toString()).emit('keepgame', remainUsers);
            io.sockets.in(roomId.toString()).emit('refreshUser', remainUsers, 0);
            console.log(
                `[socket] disconnected - socket.id: ${socket.id}/ roomId: ${roomId}/ userId: ${userId}`,
            );
        } else {
            const LOBBY: string = game.LOBBY;
            const lobbyCount = game.leaveLobby();
            const inGameUserCounts = game.getInGameUserCounts();
            io.sockets.in(LOBBY).emit('counts', inGameUserCounts, lobbyCount);
        }
    });
};

export default socketActions;

import joinGameResult from '../../interfaces/joinGameResult.interface';
import * as socketIO from 'socket.io';

class GameInstance {
    private MAX_USER = 5;
    private onUser = [];
    //private userCnt = []; //room별 user count -> onUser에 합쳐도 됨
    private userWord = []; //room 별 userword data
    private wordCnt = []; //room 별 word 개수 (첫번째는 3글자인지만 체크)
    private mainroom = 0;
    private lobbyUserCnt = 0;
    private io;

    constructor() {}

    public joinGame(userId: string, roomId: number): Promise<joinGameResult> {
        const failException = {
            success: false,
            userId,
            roomId,
        };
        return new Promise<joinGameResult>((resolve, reject) => {
            if (!this.isChannelNotFull(roomId)) {
                reject({
                    ...failException,
                    message: '채널 인원 초과입니다.',
                });
            } else if (!this.isUserIdValid(userId)) {
                reject({
                    ...failException,
                    message: '사용 중인 이름이에요.',
                });
            } else if (userId.length < 2) {
                reject({
                    ...failException,
                    message: '두 글자 이상 입력하세요.',
                });
            } else {
                resolve({
                    success: true,
                    userId,
                    roomId,
                });
            }
        });
    }

    private isChannelNotFull(roomId: number): boolean {
        if (this.onUser[roomId] && this.onUser[roomId].length >= this.MAX_USER) {
            return false;
        } else return true;
    }

    private isUserIdValid(userId: string): boolean {
        this.onUser.forEach((userOfEachRoom) =>
            userOfEachRoom.forEach((user) => user === userId && false),
        );
        return true;
    }
}

export default GameInstance;

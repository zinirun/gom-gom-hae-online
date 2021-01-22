import joinGameResult from '../../interfaces/joinGameResult.interface';
import roomUser from '../../interfaces/roomUser.interface';
import * as fs from 'fs';
import * as socketIO from 'socket.io';

class GameInstance {
    private readonly MAX_CHANNEL: number = 5;
    private readonly MAX_USER: number = 5;
    public onUsers: roomUser[][] = [];
    public onWords: string[][] = [];
    private dict;
    private dooum;

    constructor() {
        for (let i = 0; i < this.MAX_CHANNEL; i++) {
            this.onUsers.push([]);
            this.onWords.push([]);
        }
        this.dict = fs.readFileSync('./dict/dict.txt').toString().replace(/\r/g, '').split('\n');
        this.dooum = require('./dooumRule');
    }

    public enterGame(userId: string, roomId: number): Promise<joinGameResult> {
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

    public joinSocket(roomId: number, userId: string): void {
        console.log(`[socket] joined user ${userId} to room ${roomId}`);

        this.onUsers[roomId].push({
            userId,
            myCount: 0,
        });

        console.log(this.onUsers);
    }

    public resetRoomWord(roomId): void {
        this.onWords[roomId].length = 0;
    }

    public pushAnswer(roomId, word): Promise<void> {
        return new Promise((resolve, reject) => {});
    }

    private isChannelNotFull(roomId: number): boolean {
        if (this.onUsers[roomId] && this.onUsers[roomId].length >= this.MAX_USER) {
            return false;
        } else return true;
    }

    private isUserIdValid(userId: string): boolean {
        this.onUsers.forEach((userOfEachRoom) =>
            userOfEachRoom.forEach((user) => user.userId === userId && false),
        );
        return true;
    }
}

export default GameInstance;

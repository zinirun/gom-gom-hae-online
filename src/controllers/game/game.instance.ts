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

    public joinSocket(roomId: number, userId: string, socketId: string): void {
        console.log(`[socket] joined user ${userId} to room ${roomId}`);

        this.onUsers[roomId].push({
            userId,
            socketId,
            roomId,
            myCount: this.onUsers[roomId].length,
        });

        console.log(this.onUsers);
    }

    public pushAnswer(userId, roomId, word): Promise<any> {
        return new Promise((resolve, reject) => {
            const { myCount } = this.onUsers[roomId].find((u) => u.userId === userId);
            const wordStatus = this.checkAnswer(roomId, word);
            if (wordStatus === 0) {
                const roomWord = this.onWords[roomId];
                const wordCount = roomWord.length;
                const alsoWord = this.dooum(word, this.onWords, roomId, wordCount);
                let displayWord;
                if (alsoWord) {
                    displayWord = `${roomWord[wordCount - 1].slice(-1)}(${alsoWord.slice(-1)})`;
                } else {
                    displayWord = roomWord[wordCount - 1].slice(-1);
                }
                resolve({
                    myCount,
                    displayWord,
                });
            } else {
                switch (wordStatus) {
                    case 1:
                        reject('3글자만 입력하세요!');
                        break;
                    case 2:
                        reject('이미 사용한 단어에요!');
                        break;
                    case 3:
                        reject('끝말이 아니에요!');
                        break;
                    default:
                        reject('사전에 없는 말이에요!');
                }
            }
        });
    }

    public quitUser(roomId, userId): roomUser[] {
        this.onUsers[roomId] = this.onUsers[roomId].filter((u) => u.userId !== userId);
        if (this.onUsers[roomId].length <= 1) {
            this.resetRoomWord(roomId);
        }
        return this.onUsers[roomId];
    }

    public findBySocketId(socketId): roomUser | any {
        for (let roomUser of this.onUsers) {
            const target = roomUser.find((u) => u.socketId === socketId);
            if (target) {
                return target;
            }
        }
    }

    public resetRoomWord(roomId): void {
        this.onWords[roomId].length = 0;
    }

    private checkAnswer(roomId, word): number {
        let status = 0;
        const cnt = this.onWords[roomId].length;
        if (word.length !== 3) {
            status = 1;
        } else if (!this.isAnswerUsed(roomId, word)) {
            status = 2;
        } else if (cnt > 0 && !this.isAnswerFinalWord(roomId, word)) {
            status = 3;
        } else if (!this.isAnswerInDict(word)) {
            status = 4;
        }
        return status;
    }

    private isAnswerInDict(word): boolean {
        return this.dict.find((d) => d === word) ? true : false;
    }

    private isAnswerFinalWord(roomId, word): boolean {
        let status = false;
        const roomWord = this.onWords[roomId];
        const wordCount = roomWord.length;
        const alsoWord = this.dooum(word, this.onWords, roomId, wordCount);
        if (alsoWord) {
            if (alsoWord.slice(-1) === word.charAt(0)) {
                status = true;
            }
            if (roomWord[wordCount - 1].slice(-1) === word.charAt(0)) {
                status = true;
            }
        } else {
            if (roomWord[wordCount - 1].slice(-1) === word.charAt(0)) {
                status = true;
            }
        }
        return status;
    }

    private isAnswerUsed(roomId, word): boolean {
        return this.onWords[roomId].find((w) => w.includes(word)) ? true : false;
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

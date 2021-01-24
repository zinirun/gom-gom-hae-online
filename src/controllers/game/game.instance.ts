import joinGameResult from '../../interfaces/joinGameResult.interface';
import roomUser from '../../interfaces/roomUser.interface';
import dooum from './dict/dooumRule';
import * as fs from 'fs';

class GameInstance {
    public readonly LOBBY: string = 'lobby';
    private readonly MAX_CHANNEL: number = 5;
    private readonly MAX_USER: number = 5;
    public filterOnlyUserId = (roomArray): [] => roomArray.map((r) => r.userId);
    private onUsers: roomUser[][] = [];
    private onWords: string[][] = [];
    private lobbyCount: number;
    private dict;

    constructor() {
        this.lobbyCount = 0;
        for (let i = 0; i <= this.MAX_CHANNEL; i++) {
            this.onUsers.push([]);
            this.onWords.push([]);
        }
        this.dict = fs
            .readFileSync(`${__dirname}/dict/dict.txt`)
            .toString()
            .replace(/\r/g, '')
            .split('\n');
    }

    public getInGameUserCounts(): number[] {
        return this.onUsers.map((u) => u.length);
    }

    public enterLobby(): number {
        return ++this.lobbyCount;
    }

    public leaveLobby(): number {
        const count = --this.lobbyCount;
        if (count <= 0) {
            this.lobbyCount = 1;
        }
        return this.lobbyCount;
    }

    public getLobbyCount(): number {
        return this.lobbyCount;
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

    public joinSocket(roomId: number, userId: string, socketId: string): string[] {
        console.log(`[game-instance] joined user ${userId} to room ${roomId}`);

        this.onUsers[roomId].push({
            userId,
            socketId,
            roomId,
            myCount: this.onUsers[roomId].length,
        });

        return this.filterOnlyUserId(this.onUsers[roomId]);
    }

    public pushAnswer(userId, roomId, word): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const { myCount } = this.onUsers[roomId].find((u) => u.userId === userId);
            const wordStatus = await this.checkAnswer(roomId, word);
            if (wordStatus === 0) {
                this.onWords[roomId].push(word);
                const roomWord = this.onWords[roomId];
                const wordCount = roomWord.length;
                const alsoWord = dooum(word, this.onWords[roomId]);
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

    public quitUser(roomId, userId): string[] {
        this.onUsers[roomId] = this.onUsers[roomId].filter((u) => u.userId !== userId);
        if (this.onUsers[roomId].length <= 1) {
            this.resetRoomWord(roomId);
        }
        return this.filterOnlyUserId(this.onUsers[roomId]);
    }

    public findBySocketId(socketId: string): roomUser | any {
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

    private checkAnswer(roomId, word): Promise<number> {
        return new Promise<number>(async (resolve) => {
            let status = 0;
            const cnt = this.onWords[roomId].length;
            if (word.length !== 3) {
                status = 1;
            } else if (this.isAnswerUsed(roomId, word)) {
                status = 2;
            } else if (cnt > 0 && !(await this.isAnswerFinalWord(roomId, word))) {
                status = 3;
            } else if (!(await this.isAnswerInDict(word))) {
                status = 4;
            }
            resolve(status);
        });
    }

    private isAnswerInDict(word): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            resolve(this.dict.find((d) => d === word) ? true : false);
        });
    }

    private isAnswerFinalWord(roomId, word): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            let status = false;
            const roomWord = this.onWords[roomId];
            const wordCount = roomWord.length;
            const alsoWord = dooum(word, this.onWords[roomId]);
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
            resolve(status);
        });
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
        for (let users of this.onUsers) {
            for (let user of users) {
                if (user.userId === userId) return false;
            }
        }
        return true;
    }
}

export default GameInstance;

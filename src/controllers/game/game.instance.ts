class GameInstance {
    private MAX_USER = 5;
    private onUser = [];
    private userCnt = []; //room별 user count
    private userWord = []; //room 별 userword data
    private wordCnt = []; //room 별 word 개수 (첫번째는 3글자인지만 체크)
    private mainroom = 0;
    private lobbyUserCnt = 0;

    constructor() {}

    get;
}

export default GameInstance;

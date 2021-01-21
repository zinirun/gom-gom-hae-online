//채널 최대 사용자 검사
function chCheck(rId) {
    var check;

    if (onUser[rId]) {
        if (onUser[rId].length >= maxUsers) {
            check = 1; //초과 시 1 리턴
        }
    } else {
        check = 0;
    }
    return check;
}

//로그인 시 중복 이름 검사
function usernameValid(name) {
    for (var i in onUser) {
        for (var j in onUser[i]) {
            if (onUser[i][j] == name) {
                return false;
                break;
            }
        }
    }
    return true;
}
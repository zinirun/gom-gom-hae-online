function dooumRule(word, roomWord) {
    //두음법칙 적용위한 disassemble -> assemble
    let d_word = '';
    if (roomWord.length > 0) {
        const prevWord = roomWord[roomWord.length - 1];
        const prevWordFinal = prevWord.slice(-1);

        if (prevWordFinal == '라') {
            d_word = prevWord.slice(0, -1) + '나';
        }

        if (prevWordFinal == '락') {
            d_word = prevWord.slice(0, -1) + '낙';
        }

        if (prevWordFinal == '란') {
            d_word = prevWord.slice(0, -1) + '난';
        }

        if (prevWordFinal == '랄') {
            d_word = prevWord.slice(0, -1) + '날';
        }

        if (prevWordFinal == '람') {
            d_word = prevWord.slice(0, -1) + '남';
        }

        if (prevWordFinal == '랍') {
            d_word = prevWord.slice(0, -1) + '납';
        }

        if (prevWordFinal == '랑') {
            d_word = prevWord.slice(0, -1) + '낭';
        }

        if (prevWordFinal == '래') {
            d_word = prevWord.slice(0, -1) + '내';
        }

        if (prevWordFinal == '랭') {
            d_word = prevWord.slice(0, -1) + '냉';
        }

        if (prevWordFinal == '낙' || prevWordFinal == '략') {
            d_word = prevWord.slice(0, -1) + '약';
        }

        if (prevWordFinal == '냥' || prevWordFinal == '량') {
            d_word = prevWord.slice(0, -1) + '양';
        }

        if (prevWordFinal == '녀' || prevWordFinal == '려') {
            d_word = prevWord.slice(0, -1) + '여';
        }

        if (prevWordFinal == '녁' || prevWordFinal == '력') {
            d_word = prevWord.slice(0, -1) + '역';
        }

        if (prevWordFinal == '년' || prevWordFinal == '련') {
            d_word = prevWord.slice(0, -1) + '연';
        }

        if (prevWordFinal == '녈' || prevWordFinal == '렬') {
            d_word = prevWord.slice(0, -1) + '열';
        }

        if (prevWordFinal == '념' || prevWordFinal == '렴') {
            d_word = prevWord.slice(0, -1) + '염';
        }

        if (prevWordFinal == '녕' || prevWordFinal == '령') {
            d_word = prevWord.slice(0, -1) + '영';
        }

        if (prevWordFinal == '녜' || prevWordFinal == '례') {
            d_word = prevWord.slice(0, -1) + '예';
        }

        if (prevWordFinal == '렵') {
            d_word = prevWord.slice(0, -1) + '엽';
        }

        if (prevWordFinal == '로') {
            d_word = prevWord.slice(0, -1) + '노';
        }

        if (prevWordFinal == '록') {
            d_word = prevWord.slice(0, -1) + '녹';
        }

        if (prevWordFinal == '론') {
            d_word = prevWord.slice(0, -1) + '논';
        }

        if (prevWordFinal == '롱') {
            d_word = prevWord.slice(0, -1) + '농';
        }

        if (prevWordFinal == '뢰') {
            d_word = prevWord.slice(0, -1) + '뇌';
        }

        if (prevWordFinal == '뇨' || prevWordFinal == '료') {
            d_word = prevWord.slice(0, -1) + '요';
        }

        if (prevWordFinal == '뉴' || prevWordFinal == '류') {
            d_word = prevWord.slice(0, -1) + '유';
        }

        if (prevWordFinal == '뉵' || prevWordFinal == '륙') {
            d_word = prevWord.slice(0, -1) + '육';
        }

        if (prevWordFinal == '니' || prevWordFinal == '리') {
            d_word = prevWord.slice(0, -1) + '이';
        }

        if (prevWordFinal == '룡') {
            d_word = prevWord.slice(0, -1) + '용';
        }

        if (prevWordFinal == '루') {
            d_word = prevWord.slice(0, -1) + '누';
        }

        if (prevWordFinal == '륜') {
            d_word = prevWord.slice(0, -1) + '윤';
        }

        if (prevWordFinal == '률') {
            d_word = prevWord.slice(0, -1) + '율';
        }

        if (prevWordFinal == '륭') {
            d_word = prevWord.slice(0, -1) + '융';
        }

        if (prevWordFinal == '륵') {
            d_word = prevWord.slice(0, -1) + '늑';
        }

        if (prevWordFinal == '름') {
            d_word = prevWord.slice(0, -1) + '늠';
        }

        if (prevWordFinal == '릉') {
            d_word = prevWord.slice(0, -1) + '능';
        }

        if (prevWordFinal == '린') {
            d_word = prevWord.slice(0, -1) + '인';
        }

        if (prevWordFinal == '림') {
            d_word = prevWord.slice(0, -1) + '임';
        }

        if (prevWordFinal == '립') {
            d_word = prevWord.slice(0, -1) + '입';
        }
    }

    return d_word;
}

export default dooumRule;

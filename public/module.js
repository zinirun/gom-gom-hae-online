function logout(){
    if (confirm("로그아웃 하시겠어요?") == true) {
        document.location.href = "/process/logout";
    } else return;
}

function showHelp(){
    var target = document.getElementById("hide_help");
    target.style.display = 'inline-block';
}

function hideHelp(){
    var target = document.getElementById("hide_help");
    target.style.display = 'none';
}

function showMade(){
    var target = document.getElementById("hide_made");
    target.style.display = 'inline-block';
}

function hideMade(){
    var target = document.getElementById("hide_made");
    target.style.display = 'none';
}
function logout(){
    if (confirm("로그아웃 하시겠어요?") == true) {
        document.location.href = "/process/logout";
    } else return;
}
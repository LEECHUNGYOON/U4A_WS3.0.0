window.onload = () => {
    
    var sErrMsg = parent.getErrorMsg();

    var oErrArea = document.getElementById("errorMsgArea");
        oErrArea.innerHTML = sErrMsg;

        parent.setBusy('');

};


function onLogin(){

    parent.onMoveToPage("LOGIN");
    
}

var getUserName
    , sendMessage
    , socket
    , chatPrivately
    , sendPrivateMessage
    ;

(function () {

    getUserName = function getUserName() {
        var txtUserName = document.getElementById('txtUserName')
            , spanError = document.getElementById('errSpan')
            , userNameDiv = document.getElementById('fetchUserName')
            , chatAreaDiv = document.getElementById('chatArea')
            , chatTextArea = document.getElementById('chatTextArea')
            , privateChatTextArea = document.getElementById('privateChatTextArea')
            , frndsDDL = document.getElementById('onlineFriendsDDL')
            , userName = txtUserName.value
            ;

        if(userName && userName.length){
            removeClassFromElement(spanError, 'error');
            addClassToElement(spanError, 'noError');
            addClassToElement(userNameDiv, 'none');
            removeClassFromElement(chatAreaDiv, 'none');
            document.getElementById('userName').innerText = 'Welcome ' + userName;

            socket = io.connect('http://localhost:5001');
            socket.emit('joined', userName);
            socket.on('msg', function (data) {
               chatTextArea.value += data;
            });

            socket.on('existingUsers', function (data) {
                if(data && data.length){
                    var existingUsersOnline = data.split(',');
                    existingUsersOnline.forEach(function (user) {
                        if(user !== userName){
                            var option = document.createElement("option");
                            option.text = user;
                            option.value = user;
                            frndsDDL.appendChild(option);
                        }
                    });
                }
            });

            socket.on('newUser', function (data) {
                if(data && data !== userName){
                    var option = document.createElement("option");
                    chatTextArea.value += data + " joined the chat\n";
                    option.text = data;
                    option.value = data;
                    frndsDDL.appendChild(option);
                }
            });

            socket.on('removeUser', function (data) {
                if(data && data.length){
                    var userOPtions = document.querySelectorAll('#onlineFriendsDDL option');
                    userOPtions.forEach(function(o){
                        if(o.value === 'rahul'){
                            o.remove();
                        }
                    });
                }
            })
            
            socket.on('privateMsg', function (data) {
                if(data && data.length){
                    var sender = data.substring(0, data.indexOf('IntendedTo'));
                    data = data.substring(data.indexOf('IntendedTo') + 10);
                    if(frndsDDL.value === 'None'){
                        frndsDDL.value = sender;
                        chatPrivately();
                    } else if(frndsDDL.value !== sender){
                        privateChatTextArea.value = 'PRIVATE CHAT(Chatting with person shown in dropdown)';
                        frndsDDL.value = sender;
                        chatPrivately();
                    }
                    privateChatTextArea.value += '\n' + sender + ' : ' + data;
                }
            })

        } else {
            removeClassFromElement(spanError, 'noError');
            addClassToElement(spanError, 'error');
        }
    }

    sendMessage = function sendMessage() {
        var msgToSend = document.getElementById('txtChatMsg').value
            , chatTextArea = document.getElementById('chatTextArea')
            ;
        
        if(msgToSend && msgToSend.length){
            chatTextArea.value += 'You : ' + msgToSend + '\n';
            socket.emit('msg', ' : ' + msgToSend);
        }
        document.getElementById('txtChatMsg').value = '';
    }

    sendPrivateMessage = function sendPrivateMessage() {
        var msgToSend = document.getElementById('txtPrivateChatMsg').value
            , privateChatTextArea = document.getElementById('privateChatTextArea')
            , frndsDDL = document.getElementById('onlineFriendsDDL')
            ;

        if(msgToSend && msgToSend.length){
            privateChatTextArea.value += '\nYou : ' + msgToSend;
            socket.emit('privateMsg', frndsDDL.value + 'IntendedTo' + msgToSend);
        }
        document.getElementById('txtPrivateChatMsg').value = '';
    }

    chatPrivately = function chatPrivately() {
        var frndsDDL = document.getElementById('onlineFriendsDDL')
            , privateChatElements = document.querySelectorAll('.privateElement')
            ;

        if(frndsDDL.value === 'None'){
            privateChatElements.forEach(function (privateChatElem) {
                addClassToElement(privateChatElem, 'none');
            });
        } else {
            privateChatElements.forEach(function (privateChatElem) {
                removeClassFromElement(privateChatElem, 'none');
            });
        }
    }

    function addClassToElement(domElement, className) {
        if(domElement && !domElement.classList.contains(className)){
            domElement.className += ' ' + className;
        }
    }

    function removeClassFromElement(domElement, className) {
        if(domElement && domElement.classList.contains(className)){
            domElement.classList.remove(className);
        }
    }
})();
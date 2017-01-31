
$(function() {
    const socket = io();
    const name = 'USER_' + (Math.round(Math.random() * 1000));
    const messages = $("#messages");
    const message_txt = $("#message_text");
    $('.chat .nick').text(name);
    const log = console.log;

    // добавление сообщения в чат
    function msg(nick, message) {
        let m = '<div class="msg">' +
                '<span class="user">' + safe(nick) + ':</span> '
                + safe(message) +
                '</div>';
        messages
                .append(m)
                .scrollTop(messages[0].scrollHeight);
    }

    // добавление системных сообщений типа пришёл/покинул чат
    function msg_system(message) {
        let m = '<div class="msg system">' + safe(message) + '</div>';
        messages
                .append(m)
                .scrollTop(messages[0].scrollHeight);
        log('msg_system', message);
    }

    // соединение с сервером
    socket.on('connect', function () {
        log('on_connect');
        msg_system('Соединение установленно!');
        // сообщим серверу username
        socket.emit('add user', name);
    });

    // от сервера: 'message'
    socket.on('message', function (data) {
        log('on_message:', data);
        msg(data.name, data.message);
        message_txt.focus();
    });

    // посылаем новое сообщение в чат
    $("#message_btn").click(function () {
        let text = $("#message_text").val();
        if (text.length <= 0)
            return;
        message_txt.val("");
        socket.emit("new message", {message: text, name: name});
    });

    function safe(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // от cервера: 'login'
    socket.on('login', function (data) {
        let message = "Добро пожаловать в чат – " + data.name + " (всего:" + data.numUsers + ")";
        msg_system(message);
    });

    // от сервера: 'user left' 
    socket.on('user left', function (data) {
        let message = "Чат покинул: " + data.name + " (осталось:" + data.numUsers + ")";
        msg_system(message);
    });
    
});

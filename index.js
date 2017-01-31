const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;
const log = console.log;

server.listen(port, () => {
  log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.sendfile('index.html');
});

let numUsers = 0;

io.sockets.on('connection', function (socket) {
    let addedUser = false;

    // от клиента: 'new message'
    socket.on('new message', function (message) {     
        // шлём тому кто послал 'new message'
        socket.emit('message', message);
        // шлём всем остальным
        socket.broadcast.emit('message', message);        
    });

    //  от клиента: 'add user'
    socket.on('add user', function (username) {
        if (addedUser) return;

        log('add:', username);

        // запоминаем username в объекте socket для этого клиента
        socket.username = username;
        ++numUsers;
        addedUser = true;
        // сообщаем всем (кроме самого клиента)
        socket.broadcast.emit('login', {
            numUsers: numUsers,
            name: username
        });
    });

      // от клиента: 'disconnect'
    socket.on('disconnect', function () {
        if (addedUser) {
            --numUsers;
            // сообщаем всем, что клиент нас покинул
            socket.broadcast.emit('user left', {
                name: socket.username,
                numUsers: numUsers
            });
        }
  });
});
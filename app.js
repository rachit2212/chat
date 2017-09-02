
var http = require('http')
    , express = require('express')
    , app = express()
    , server = http.Server(app)
    , io = require('socket.io')(server)
    , path = require('path')
    ;

server.listen(5001, function () {
    console.log('server running on 5001')
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    socket.on('joined', function (data) {
        var activeSockets = Object.keys(io.sockets.sockets)
            , existingOnlineUsers = []
            ;
        
        socket.userName = data;
        activeSockets.forEach(function (activeSocket) {
            existingOnlineUsers.push(io.sockets.sockets[activeSocket].userName)
        });
        socket.broadcast.emit('newUser', socket.userName);
        socket.emit('existingUsers', existingOnlineUsers.toString());
    });
    socket.on('msg', function (data) {
        socket.broadcast.emit('msg', socket.userName + data + '\n');
    });
    socket.on('disconnecting', function () {
        socket.broadcast.emit('msg', socket.userName + ' left the chat\n');
        socket.broadcast.emit('removeUser', socket.userName);
    });

    socket.on('privateMsg', function (data) {
        if(data && data.length){
            var sender = data.substring(0, data.indexOf('IntendedTo'));
            data = data.replace(sender, socket.userName);
        }

        var activeSockets = Object.keys(io.sockets.sockets)
            , socketObjToSendData
            ;

        activeSockets.forEach(function (activeSocket) {
            if(io.sockets.sockets[activeSocket].userName === sender){
                socketObjToSendData = io.sockets.sockets[activeSocket];
                return;
            }
        });
        socketObjToSendData.emit('privateMsg', data);
    });
});
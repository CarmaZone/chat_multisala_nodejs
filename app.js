var express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	io = require('socket.io').listen(server),
	port = process.env.PORT || 3000;

server.listen(port);

var user;
var sala;
var list_users = [];

app.configure(function(){

	app.use(express.json());
	app.use(express.urlencoded())
	
});

// routing
app.get('/', function(req, res) {

	res.sendfile(__dirname + '/index.html');
    
});

app.post("/", function(req,res){
	user = req.body.nick;
	sala = req.body.sala;
	console.log("Nick: " + user + " - Sala: " + sala);
	res.send(true);
	
});

io.sockets.on('connection', function(socket) {

	console.log('Conectado al servidor');

	// almacenar el nombre del usuario en la sesión
         socket.username = user;
        // almacenar el nombre del usuario en la sesión
        socket.room = sala;
        // unir usuario a la sala
        socket.join(socket.room);
        // Envío de vuelta al MISMO usuario
        socket.emit('updatechat', 'SERVER', 'Bienvenido ' + socket.username);
        // Envío a todos los usuarios de la sala MENOS el emisor
        socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' se ha conectado a la sala.');

        //Recoger y listar usuarios de la sala
	update_list_users();
	io.sockets.in(socket.room).emit('updateusers', list_users);

	socket.on('sendchat', function (data) {
		// Envío a todos los usarios de una sala, INCLUIDO el emisor
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});		
		
    socket.on('disconnect', function() {
		console.log('Desconectando del servidor');

        // echo globally that this client has left
        socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' se ha desconectado');
        socket.leave(socket.room);
		
	update_list_users();
	socket.broadcast.to(socket.room).emit('updateusers', list_users);
    });
	
	
	function update_list_users(){

		var users = io.sockets.clients(socket.room);
		list_users = [];
		
		users.forEach(function(client){			
			list_users.push(client.username);		
		});
		
		
	}
});

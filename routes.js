// This file is required by app.js. It sets up event listeners
// for the two main URL endpoints of the application - /create and /chat/:id
// and listens for socket.io messages.

// Use the gravatar module, to turn email addresses into avatar images:

var gravatar = require('gravatar');
var users = [];
var rooms = [];
// Export a function, so that we can pass 
// the app and io instances from the app.js file:

module.exports = function(app,io){

	app.get('/', function(req, res){

		// Render views/home.html
		res.render('home');
	});

	// app.get('/create', function(req,res){

	// 	// Generate unique id for the room
	// 	var id = Math.round((Math.random() * 1000000));

	// 	// Redirect to the random room
	// 	res.redirect('/offer/'+id);
	// });

	// app.get('/offer/:id', function(req,res){

	// 	// Render the chant.html view
	// 	res.render('chat');
	// });

	// Initialize a new socket.io application, named 'chat'
	var chat = io.on('connection', function (socket) {
		// When the client emits the 'load' event, reply with the 
		// number of people in this chat room

		socket.on('load',function(data){

			var room = findClientsSocket(io,data);
			if(room.length === 0 ) {

				socket.emit('peopleinchat', {number: 0});
			}
			else if(room.length === 1) {

				socket.emit('peopleinchat', {
					number: 1,
					user: room[0].username,
					avatar: room[0].avatar,
					id: data
				});
			}
			else if(room.length >= 2) {

				chat.emit('tooMany', {boolean: true});
			}
		});
		socket.on('joinroom',function(data){
			console.log("joinarrive");
			var room = findroombyid(data);
			console.log(room);
			if(room!=null)
			{
				if(room.suser==null)
				{
					var user = findClientbySocket(socket);
					if(!!user)
					{
						socket.room = room.roomid;
						socket.join(room.roomid);
						room.suser = user;					
						socket.emit("startgame",{flag:'white',roomid:room.roomid,fuser:room.fuser.name,suser:user.name});
						room.fuser.socketdata.emit("startgame",{flag:'black',roomid:room.roomid,fuser:room.fuser.name,suser:user.name});
					}
				}
				socket.room = data;				
			}
			sendallroomlist();
		});
		socket.on('roomlist',function(){
			console.log("roomlist");
			var roomlist = [];
			for (let index = 0; index < rooms.length; index++) {
				const element = rooms[index];
				if(!!element.suser)
					roomlist.push({roomid:element.roomid,fuser:element.fuser.name,suser:element.suser.name});
				else
					roomlist.push({roomid:element.roomid,fuser:element.fuser.name,suser:null});
			}
			for (let index = 0; index < users.length; index++) {
				const element = users[index];
				element.socketdata.emit('roomlist',{roomlist:roomlist});
			}
			

		});
		socket.on('createroom',function(data){
			console.log("createarrive");
			var user = findClientbySocket(socket);
			var id = Math.round((Math.random() * 1000000));
			if(user!=null)
			{
				socket.room = id;
				socket.join(id);
				rooms.push({roomflag:true,fuser:user,suser:null,roomid:id});
				socket.emit("create",{room:{fuser:user.name,suser:null,roomid:id}});
			}
			sendallroomlist();
			

		});

		// When the client emits 'login', save his name and avatar,
		// and add them to the room
		socket.on('login', function(data) {
			socket.userId = data.user;
			users.push({name:data.user,avatar:data.avatar,socketdata:socket});
			socket.emit('loginok',{name:data.user,socketid:socket.id});			
			sendalluserlist();
			sendallroomlist();			
			// Only two people per room are allowed
			// if (room.length < 2) {

			// 	// Use the socket object to store data. Each client gets
			// 	// their own unique socket object

			// 	socket.username = data.user;
			// 	socket.room = data.id;
			// 	socket.avatar = gravatar.url(data.avatar, {s: '140', r: 'x', d: 'mm'});

			// 	// Tell the person what he should use for an avatar
			// 	socket.emit('img', socket.avatar);


			// 	// Add the client to the room
			// 	socket.join(data.id);

			// 	if (room.length == 1) {

			// 		var usernames = [],
			// 			avatars = [];

			// 		usernames.push(room[0].username);
			// 		usernames.push(socket.username);

			// 		avatars.push(room[0].avatar);
			// 		avatars.push(socket.avatar);

			// 		// Send the startChat event to all the people in the
			// 		// room, along with a list of people that are in it.

			// 		chat.in(data.id).emit('startChat', {
			// 			boolean: true,
			// 			id: data.id,
			// 			users: usernames,
			// 			avatars: avatars
			// 		});
			// 	}
			// }
			// else {
			// 	socket.emit('tooMany', {boolean: true});
			// }
		});

		// Somebody left the chat
		socket.on('disconnect', function() {
			console.log('disconnect');

			// Notify the other person in the chat room
			// that his partner has left
			for (let index = 0; index < rooms.length; index++) {
				const element = rooms[index];
				if(element.roomid == socket.room)
				{
					rooms.splice(index,1);
				}
			}
			var user = findClientbySocket(socket);
			if(user != null)
			{
				for (let index = 0; index < users.length; index++) {
					const element = users[index];
					if(element.name == user.name)
					{
						users.splice(index,1);
					}
				}
			}
			socket.broadcast.to(socket.room).emit('leaveroom', {
				boolean: true,
				room: socket.room
			});

			// leave the room
			socket.leave(socket.room);
		});
		socket.on('leaveroom', function() {
			console.log('leaveroom');
			// Notify the other person in the chat room
			// that his partner has left
			for (let index = 0; index < rooms.length; index++) {
				const element = rooms[index];
				if(element.roomid == socket.room)
				{
					rooms[index].roomflag = false;
				}
			}
			var user = findClientbySocket(socket);
			socket.broadcast.to(socket.room).emit('leaveroom', {
				boolean: true,
				room: socket.room
			});
			socket.emit('leaveroom', {
				boolean: true,
				room: socket.room
			});
			sendallroomlist();
		});


		// Handle the sending of messages
		socket.on('msg', function(data){

			// When the server receives a message, it sends it to the other person in the room.
			socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user, img: data.img});
		});

		socket.on('move', function(data){
			console.log('move');
			socket.broadcast.to(socket.room).emit('movestate', data);
		});
		socket.on('win', function(data){
			console.log('move');
			socket.broadcast.to(socket.room).emit('win', data);
		});
		socket.on('chessboard', function(data){
			console.log('chessboard');
			socket.broadcast.to(socket.room).emit('chessboard', data);
		});
		socket.on('updatemove', function(data){
			console.log('updatemove');
			socket.broadcast.to(socket.room).emit('updatemove', data);
		});
		socket.on('pageload', function(data){
			socket.broadcast.to(socket.room).emit('gameload', data);
		});
	});
};

function sendallroomlist()
{
	var roomlist = [];
	for (let index = 0; index < rooms.length; index++) {
		const element = rooms[index];
		if(element.roomflag == true)
		{
			if(!!element.suser)
				roomlist.push({roomid:element.roomid,fuser:element.fuser.name,suser:element.suser.name});
			else
				roomlist.push({roomid:element.roomid,fuser:element.fuser.name,suser:null});
		}
	}
	for (let index = 0; index < users.length; index++) {
		const element = users[index];
		element.socketdata.emit('roomlist',{roomlist:roomlist});
	}
}
function sendalluserlist()
{
	var userlist = [];
	for (let index = 0; index < users.length; index++) {
		const element = users[index];
		userlist.push({name:element.name,socketid:element.socketdata.id});
	}
	for (let index = 0; index < users.length; index++) {
		const element = users[index];
		element.socketdata.emit('userlist',{userlist:userlist});
	}
}
function findClientbySocket(socket)
{
	for (let index = 0; index < users.length; index++) {
		if(users[index].socketdata.id == socket.id)
			return users[index];
	}
	return null;
}

function findroombyid(roomid)
{
	for (let index = 0; index < rooms.length; index++) {
		if(rooms[index].roomid==roomid)
			return rooms[index];
	}
	return null;
}

function findClientsSocket(io,roomId, namespace) {
	var res = [],
		ns = io.of(namespace ||"/");    // the default namespace is "/"

	if (ns) {
		for (var id in ns.connected) {
			if(roomId) {
				var index = ns.connected[id].rooms.indexOf(roomId) ;
				if(index !== -1) {
					res.push(ns.connected[id]);
				}
			}
			else {
				res.push(ns.connected[id]);
			}
		}
	}
	return res;
}



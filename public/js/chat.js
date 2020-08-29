// This file is executed in the browser, when people visit /chat/<random id>

$(function(){

	// getting the id of the room from the url
	var socket = io();
	var socketid;
	var roomid=0;
	// variables which hold the data for each person
	var name = "",
		email = "",
		img = "",
		friend = "";

	// cache some jQuery objects
	var section = $(".section"),
		// footer = $("footer"),
		footer = $(".chess-container"),
		onConnect = $(".connected"),
		usersection = $("#userlist"),
		roomsection = $("#roomlist"),
		inviteSomebody = $(".invite-textfield"),
		personInside = $(".personinside"),
		chatScreen = $(".chatscreen"),
		left = $(".left"),
		noMessages = $(".nomessages"),
		tooManyPeople = $(".toomanypeople");
		roomitem = $(".roomitem");
		createbutton = $("#createbutton");
		backbutton = $("#back-btn");
	// some more jquery objects
	var chatNickname = $(".nickname-chat"),
		leftNickname = $(".nickname-left"),
		loginForm = $(".loginForm"),
		yourName = $("#yourName"),
		yourEmail = $("#yourEmail"),
		hisName = $("#hisName"),
		hisEmail = $("#hisEmail"),
		chatForm = $("#chatform"),
		textarea = $("#message"),
		messageTimeSent = $(".timesent"),
		chats = $(".chats");

	// these variables hold images
	var ownerImage = $("#ownerImage"),
		leftImage = $("#leftImage"),
		noMessagesImage = $("#noMessagesImage");

	$("#gamehistorydiv").hide();
	// on connection to server get the id of person's room
	socket.on('connect', function(){

		section.children().css('display','none');
		$("#gamebody").css('display','none');
		onConnect.css('display','block');
		loginForm.on('submit', function(e){

			e.preventDefault();

			name = $.trim(yourName.val());
			
			if(name.length < 1){
				alert("Please enter a nick name longer than 1 character!");
				return;
			}

			email = yourEmail.val();

			if(!isValid(email)) {
				alert("Please enter a valid email!");
			}
			else {

				showMessage("inviteSomebody");

				// call the server-side function 'login' and send user's parameters
				socket.emit('login', {user: name, avatar: email});
			}
		
		});
		backbutton.on('click',function(e)
		{
			socket.emit('leaveroom', id);
			roomid = 0;
		});
		
		createbutton.on('click',function(e)
		{
			if(roomid==0)
			{
				createbutton.attr('disabled', 'disabled');
				socket.emit('createroom', socketid);
				$("#loobydiv").hide();
				$("#gamehistorydiv").show();
			}
		});
		roomitem.on('click',function(e)
		{
			if(roomid==0)
			{
				id = $(this).attr("dataid");
				roomid = $(this).attr("dataid");
				socket.emit('joinroom', parseInt(id));
			}
		});
		
	});
	socket.on('create', function(data){
		id = data.roomid;
		roomid = data.roomid;
		footer.fadeIn(1200);
		createbutton.attr('disabled', 'disabled');
		// footer.fadeIn(1200);
		// $('.chess-container #game_wrap').attr("rotated", "true");
		// $('#game').css('transform', 'rotate(180deg)');
		// $('#game .box').css('transform', 'rotate(180deg)');
		// 	// socket.emit('pageload', 'load');
		// }
		// else {
		// 	showMessage("heStartedChatWithNoMessages",data);
		// }

		// chatNickname.text(friend);
	});
	socket.on('startgame', function(data){
		createbutton.attr('disabled', 'disabled');
		$("#loobydiv").hide();
		$("#gamehistorydiv").show();
		id = data.roomid;
		roomid = data.roomid;
		footer.fadeIn(1200);

	// 	setTimeout(function() {
	// 		$('#result').css('color', '#000');
	// 		$('#result').html('Game Start!');
	// 		$('#result').removeClass('hide');
	// 		$('#game').css('opacity', '0.5');
	//    }, 1000);

		if(data.fuser == name)
		{
			// $('.chess-container #game_wrap').attr("rotated", "true");
			$('.chess-container #game_wrap').attr("flag", "black");
			$('.chess-container #game').attr("flag", "black");
			
			// $('#game').css('transform', 'rotate(180deg)');
			// $('#game .box').css('transform', 'rotate(180deg)');
		}
		else{
			$('.chess-container #game_wrap').attr("flag", "white");
			$('.chess-container #game').attr("flag", "white");
			// $('#game').css('transform', 'rotate(180deg)');
			// $('#game .box').css('transform', 'rotate(180deg)');
		}
	});
	// save the gravatar url
	socket.on('img', function(data){
		img = data;
	});	
	socket.on('loginok', function(data){
		onConnect.css('display','none');
		$("#gamebody").css('display','block');
		socketid = data.id;
	});	
	// receive the names and avatars of all people in the chat room

	// Other useful 

	// socket.on('startChat', function(data){
	// 	if(data.boolean && data.id == id) {

	// 		chats.empty();

	// 		if(name === data.users[0]) {

	// 			showMessage("youStartedChatWithNoMessages",data);
	// 			socket.emit('pageload', 'load');
	// 		}
	// 		else {
	// 			showMessage("heStartedChatWithNoMessages",data);
	// 		}

	// 		chatNickname.text(friend);
	// 	}
	// });

	socket.on('leaveroom',function(data){
		if(data.boolean && id==data.room){
			$("#loobydiv").show();
			$("#gamehistorydiv").hide();
			footer.fadeOut(1200);
			roomid=0;
		}

	});

	// socket.on('tooMany', function(data){

	// 	if(data.boolean && name.length === 0) {

	// 		showMessage('tooManyPeople');
	// 	}
	// });

	// socket.on('receive', function(data){

	// 	showMessage('chatStarted');

	// 	if(data.msg.trim().length) {
	// 		createChatMessage(data.msg, data.user, data.img, moment());
	// 		scrollToBottom();
	// 	}
	// });

	textarea.keypress(function(e){

		// Submit the form on enter

		if(e.which == 13) {
			e.preventDefault();
			chatForm.trigger('submit');
		}

	});

	chatForm.on('submit', function(e){

		e.preventDefault();

		// Create a new chat message and display it directly

		showMessage("chatStarted");

		if(textarea.val().trim().length) {
			createChatMessage(textarea.val(), name, img, moment());
			scrollToBottom();

			// Send the message to the other person in the chat
			socket.emit('msg', {msg: textarea.val(), user: name, img: img});

		}
		// Empty the textarea
		textarea.val("");
	});


	socket.on('movestate', function(data){
		$('.chess-container #game_wrap').html(data);
		if($('.chess-container #game_wrap').attr("rotated") == "true") {
			$('.chess-container #game').css('transform', 'rotate(180deg)');
			$('.chess-container #game .box').css('transform', 'rotate(180deg)');
		}else{
			// console.log('sdf');
			$('.chess-container #game').css('transform', 'rotate(0deg)');
			$('.chess-container #game .box').css('transform', 'rotate(0deg)');
		}
	});

	// socket.on('gameload', function(data){
	// 	// Play Custom Style.
	// 	$('.chess-container #game_wrap').attr("rotated", "true");
	// 	$('#game').css('transform', 'rotate(180deg)');
	// 	$('#game .box').css('transform', 'rotate(180deg)');
	// });

	socket.on('roomlist',function(data){
		// document.getElementById('gamesList').innerHTML = '';
        // myGames.forEach(function(game) {
        //   $('#gamesList').append($('<button>')
        //                 .text('#'+ game)
        //                 .on('click', function() {
        //                   socket.emit('resumegame',  game);
        //                 }));
        // });
		// console.log(data);
		roomsection.html("");
		roomsection.innerHTML = '';
		var temphtml = "";
		var roomlist = data.roomlist;
		console.log(roomlist);
		for (let index = 0; index < roomlist.length; index++) {
			if(roomlist[index].suser == null)
			{
				roomsection.append($('<tr class = "roomitem" dataid='+roomlist[index].roomid+'></tr>')
				.html('<td>'+roomlist[index].fuser+'</td><td>1000</td><td>Waiting...</td>')
				.on('click', function() {
				socket.emit('joinroom',  roomlist[index].roomid);
				}));
			}
			else
			{
				roomsection.append($('<tr class = "roomitem" dataid='+roomlist[index].roomid+' disabled></tr>')
				.html('<td>'+roomlist[index].fuser+'</td><td>1000</td><td>'+roomlist[index].fuser+' VS '+roomlist[index].suser+'</td>')
				.on('click', function() {
				socket.emit('joinroom',  roomlist[index].roomid);
				}));
			}
			// temphtml +='<div class = "col-3 roomitem" dataid='+roomlist[index].roomid+'>'+roomlist[index].fuser+'<br>'+roomlist[index].suser+'</div>';
		}
		// roomsection.html(temphtml);		
	});
	// socket.on('userlist',function(data){
	// 	console.log(name);
	// 	console.log(userlist);
	// 	var temphtml = '<ul class="userlist">';
	// 	var userlist = data.userlist;
	// 	for (let index = 0; index <userlist.length; index++) {
	// 		if(name!=userlist[index].name)
	// 			temphtml +='<li class = "col-3" dataid='+userlist[index].socketid+'>'+userlist[index].name+'</li>';			
	// 	}
	// 	temphtml+='</ul>'
	// 	usersection.html(temphtml);
	// });
	// Update the relative time stamps on the chat messages every minute
	setInterval(function(){

		messageTimeSent.each(function(){
			var each = moment($(this).data('time'));
			$(this).text(each.fromNow());
		});

	},60000);

	// Function that creates a new chat message

	function createChatMessage(msg,user,imgg,now){

		var who = '';

		if(user===name) {
			who = 'me';
		}
		else {
			who = 'you';
		}

		var li = $(
			'<li class=' + who + '>'+
				'<div class="image">' +
					'<img src=' + imgg + ' />' +
					'<b></b>' +
					'<i class="timesent" data-time=' + now + '></i> ' +
				'</div>' +
				'<p></p>' +
			'</li>');

		// use the 'text' method to escape malicious user input
		li.find('p').text(msg);
		li.find('b').text(user);

		chats.append(li);

		messageTimeSent = $(".timesent");
		messageTimeSent.last().text(now.fromNow());
	}

	function scrollToBottom(){
		$("html, body").animate({ scrollTop: $(document).height()-$(window).height() },1000);
	}

	function isValid(thatemail) {

		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(thatemail);
	}

	function showMessage(status,data){

		if(status === "connected"){

			section.children().css('display', 'none');
			onConnect.fadeIn(1200);
		}

		else if(status === "inviteSomebody"){

			// Set the invite link content
			$("#link").text(window.location.href);

			onConnect.fadeOut(1200, function(){
				// inviteSomebody.fadeIn(1200);
			});
		}

		else if(status === "personinchat"){

			onConnect.css("display", "none");
			personInside.fadeIn(1200);

			chatNickname.text(data.user);
			ownerImage.attr("src",data.avatar);
		}

		else if(status === "youStartedChatWithNoMessages") {

			left.fadeOut(1200, function() {
				inviteSomebody.fadeOut(1200,function(){
					noMessages.fadeIn(1200);
					footer.fadeIn(1200);
				});
			});

			friend = data.users[1];
			noMessagesImage.attr("src",data.avatars[1]);
		}

		else if(status === "heStartedChatWithNoMessages") {

			personInside.fadeOut(1200,function(){
				noMessages.fadeIn(1200);
				footer.fadeIn(1200);
			});

			friend = data.users[0];
			noMessagesImage.attr("src",data.avatars[0]);
		}

		else if(status === "chatStarted"){

			section.children().css('display','none');
			chatScreen.css('display','block');
		}

		else if(status === "somebodyLeft"){

			leftImage.attr("src",data.avatar);
			leftNickname.text(data.user);

			section.children().css('display','none');
			footer.css('display', 'none');
			left.fadeIn(1200);
		}

		else if(status === "tooManyPeople") {

			section.children().css('display', 'none');
			tooManyPeople.fadeIn(1200);
		}
	}

});

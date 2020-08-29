angular.module('myApp', []).controller('GameController', ['$scope', function($scope) {
	
	//Draw the board game
    $scope.size = 16;
    $scope.widths = [];

    //Draw board
    for(var i = 0; i < $scope.size; i++) { 
        $scope.widths.push(i);
    }
}]);
// document.addEventListener("dragstart", function( event ) {
// 	dragged = event.target;
// 	event.dataTransfer.setDragImage(dragged, 11111110, 10);
// }, false);
$(document).ready(function() { 
	var  mySound = new sound("../sound/move.mp3");
	var socket = io(); 
    var themes = [
        {
            name: 'CLASSIC',
            boardBorderColor: '#c3c3c3',
            lightBoxColor: '#dfdfdd',
            darkBoxColor: '#86a666',
            optionColor: '#000',
            optionHoverColor: '#999'
        },
        {   
            name: 'WOOD',
            boardBorderColor: '#803E04',
            lightBoxColor: '#FFCE9E',
            darkBoxColor: '#D18B47',
            optionColor: '#803E04',
            optionHoverColor: '#311B0B'
        },
        {
            name: 'OCEAN',
            boardBorderColor: '#023850',
            lightBoxColor: '#fff',
            darkBoxColor: '#0A85AE',
            optionColor: '#023850',
            optionHoverColor: '#3385ff'
        },
        {
            name: 'FOREST',
            boardBorderColor: '#005900',
            lightBoxColor: '#CAC782',
            darkBoxColor: '#008C00',
            optionColor: '#005900',
            optionHoverColor: '#0c0'
        },
        {
            name: 'BLOOD',
            boardBorderColor: '#f3f3f3',
            lightBoxColor: '#f3f3f3',
            darkBoxColor: '#f00',
            optionColor: '#f00',
            optionHoverColor: '#f99'
        }
    ];
    
    var colors = [
        {
            name: 'BLACK',
            color: '#000'
        }, 
        {
            name: 'GREEN',
            color: '#030'
        }, 
        {
            name: 'BLUE',
            color: '#036'
        }, 
        {
            name: 'PINK',
            color: '#606'
        }, 
        {
            name: 'BROWN',
            color: '#630'
        }
    ];
    
    var colorOption = 0;
    var themeOption = 0;
    var moveflag = 'black';
    //Change theme
    $('#theme-option').on('click', function() {
        themeOption === themes.length - 1 ? themeOption = 0 : themeOption++;
        
        setTheme();
    });
    
    //Set up theme
    var setTheme = function() {
        var theme = themes[themeOption];
        
        $('#theme-option').html(theme.name);
        
        $('#board').css('border-color', theme.boardBorderColor);
        // $('.light-box').css('background', theme.lightBoxColor);
        // $('.dark-box').css('background', theme.darkBoxColor);
        
        $('.option-nav').css('color', theme.optionColor);
        
        //Option button effect
        $('#option').css('color', theme.optionColor);
        $('#option').hover(
            function() {
                $(this).css('color', theme.optionHoverColor);
            }, function() {
                $(this).css('color', theme.optionColor);
            }
        );
        
        //Undo button effect
        $('#undo-btn').css('color', theme.optionColor);
        $('#undo-btn').hover(
            function() {
                $(this).css('color', theme.optionHoverColor);
            }, function() {
                $(this).css('color', theme.optionColor);
            }
        );
        
        //Option Menu effect
        $('#option-menu').css('color', theme.optionColor);
        $('.button').css('color', theme.optionColor);
        $('.button').hover(
            function() {
                $(this).css('color', theme.optionHoverColor);
            }, function() {
                $(this).css('color', theme.optionColor);
            }
        );
    }
    
    //Change color
    $('#color-option').on('click', function() {
       colorOption === colors.length - 1 ? colorOption = 0 : colorOption++;
        
        setColor();
	});
	$('img').on('dragstart', function (event) {
	var emptyImage = document.createElement('img');
	// Set the src to be a 0x0 gif
	emptyImage.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
	event.dataTransfer.setDragImage(emptyImage, 0, 0);
	});
    socket.on('leaveroom',function(data){
		resetGame();

	});
	socket.on('win',function(data){
		showWinner(data);

	});

	socket.on('chessboard',function(data){
		mySound.play();
		console.log("chessarrive");
		var boxdata = $('#game .box');
		var chessdata=data;
		console.log(data);
		for (let index = 0; index < boxdata.length; index++) {
			const element = boxdata[index];
			var flag = chessdata[255-index];
			switch(flag)
			{
				case 'p':
					setPiece($(element), 'white', 'pawn');
					break;
				case 'r':
					setPiece($(element), 'white', 'rook');
					break;
				case 'q':
					setPiece($(element), 'white', 'queen');
					chessdata+="q";
					break;
				case 'k':
					setPiece($(element), 'white', 'king');
					break;
				case 's':
					setPiece($(element), 'white', 'knight');
					break;
				case 'h':
					setPiece($(element), 'white', 'bknight');
					break;
				case 'b':
					setPiece($(element), 'white', 'bishop');
					break;
				case 'P':
					setPiece($(element), 'black', 'pawn');
					break;
				case 'R':
					setPiece($(element), 'black', 'rook');
					break;
				case 'Q':
					setPiece($(element), 'black', 'queen');
					break;
				case 'K':
					setPiece($(element), 'black', 'king');
					break;
				case 'S':
					setPiece($(element), 'black', 'knight');
					break;
				case 'H':
					setPiece($(element), 'black', 'bknight');
					break;
				case 'B':
					setPiece($(element), 'black', 'bishop');
					break;
				case '0':		
					deleteBox($(element));	
			}

		}
		switchPlayer();
	});

	socket.on('updatemove',function(data){
		console.log("updatemovearrive");
		var move = {
			previous: {},
			current: {}
	   }

	   move.previous.piece = data.piece;
	  
	   if(data.From == 'new')
	   {
		move.previous.box = 'new';
	   }
	   else
	   {
		var idlist = data.From.split("-");
		move.previous.box = "box-"+(15-parseInt(idlist[1])).toString()+"-"+(15-parseInt(idlist[2])).toString();
	   }
	   move.current.piece = data.capture;	   
	   var idlist = data.To.split("-");
	   move.current.box = "box-"+(15-parseInt(idlist[1])).toString()+"-"+(15-parseInt(idlist[2])).toString();

	   historyMoves.push( move );
	   
	   showHistory();

	});

	socket.on('startgame',function(data){
		console.log(data.flag);
		resetGame(data.flag);

	});
    //Set up color for chess pieces
    var setColor = function() {
        var color = colors[colorOption];
        
        $('#color-option').html(color.name);
        
        $('.box').css('color', color['color']);
        
        $('#pawn-promotion-option').css('color', color['color']);
        
        $('#player').css('color', color['color']);
    }
	 
	 //=====GLOBAL VARIABLES=========//

	//Chess pieces
	var schessPieces = {
		 'white': {
			  'king': '&#9812;',
			  'queen': '&#9813;',
			  'rook': '&#9814;',
			  'bishop': '&#9815;',
			  'knight': '&#9816;',
			  'pawn': '&#9817;',
			  'bknight': '&#1fa50;'
		 },
		 'black': {
			  'king': '&#9818;',
			  'queen': '&#9819;',
			  'rook': '&#9820;',
			  'bishop': '&#9821;',
			  'knight': '&#9822;',
			  'pawn': '&#9823;',
			  'bknight': '&#1fa53;'
		 }
	};
	var chessPieces = {
		//  'white': {
		// 	  'king': '&#9812;',
		// 	  'queen': '&#9813;',
		// 	  'rook': '&#9814;',
		// 	  'bishop': '&#9815;',
		// 	  'knight': '&#9816;',
		// 	  'pawn': '&#9817;',
		// 	  'bknight': '&#1fa50;'
		//  },
		//  'black': {
		// 	  'king': '&#9818;',
		// 	  'queen': '&#9819;',
		// 	  'rook': '&#9820;',
		// 	  'bishop': '&#9821;',
		// 	  'knight': '&#9822;',
		// 	  'pawn': '&#9823;',
		// 	  'bknight': '&#1fa53;'
		//  }
		
	   'white': {
			'king': 'white-king.png',
			'queen': 'white-queen.png',
			'rook': 'white-tower.png',
			'bishop': 'white-bishop.png',
			'knight': 'white-horse-right.png',
			'pawn': 'white-pawn.png',
			'bknight': 'white-horse-left.png'
	   },
	   'black': {
			'king': 'black-king.png',
			'queen': 'black-queen.png',
			'rook': 'black-tower.png',
			'bishop': 'black-bishop.png',
			'knight': 'black-horse-right.png',
			'pawn': 'black-pawn.png',
			'bknight': 'black-horse-left.png'
	   }
	};

	var player = 'black'; //First player

	//Selected chess piece to move
	var select = {
		 canMove: false, //Ready to move of not
		 piece: '',      //Color, type of the piece
		 box: ''         //Position of the piece
	}

	//Game's history (pieces + positions)
	var historyMoves = [];

	//Position and color of pawn promotion
	var promotion = {};

	//Set up board game
	$(function() {		 
		$('#player').html(schessPieces.black.king);

		 //Set up color for boxes, chess pieces
		 for(var i = 0; i < 16; i++) {
			  for(var j = 0; j < 16; j++) {
					var box = $('#box-' + i + '-' + j);
					if((i + j) % 2 !== 0) {
						 box.addClass('light-box');
					} else {
						 box.addClass('dark-box');
					}
					// setNewBoard(box, i, j); //Set up all chess pieces
			  }
		 }
		 setColor();
		 setTheme();
	});

	//==============CLICK EVENTS==================//

	$(function() {
		 //Option menu
	 	$('#option').on('click', function() {
		  	if($('#option-menu').hasClass('hide')) {
				$('#game').css('opacity', '0.3');
				$('#option-menu').removeClass('hide');
		  	} else {
				$('#game').css('opacity', '1');
				$('#option-menu').addClass('hide');
	 	 	}
	 	});

		 //Back button
		 //Return to game
	 	$('#back-btn').on('click', function() {
			  $('#option-menu').addClass('hide');
			  $('#game').css('opacity', '1');
	 	});
			
		 //Undo button 
		 $('#undo-btn').on('click', function() {
			  if(historyMoves.length === 0) {
					return;
			  }

			  var move = historyMoves.pop();

			  var previous = move.previous;        
			  setPiece($('#' + previous.box), previous.piece.split('-')[0], previous.piece.split('-')[1]);

			  var current = move.current;
			  if(current.piece === '') {
					var currentBox = $('#' + current.box);
					currentBox.html('');
					currentBox.attr('piece', '');
					currentBox.removeClass('placed');
			  } else {
					setPiece($('#' + current.box), current.piece.split('-')[0], current.piece.split('-')[1]);
			  }

			  //Reset all changes
			  $('.box').removeClass('selected');
			  $('.box').removeClass('suggest');

			  switchPlayer();

			  select = { canMove: false, piece: '', box: '' };
		 });

		 //Pawn promotion event
		 $('#pawn-promotion-option .option').on('click', function() {

			  var newType = $(this).attr('id');
			  promotion.box.html(chessPieces[promotion.color][newType]);
			  promotion.box.addClass('placed');
			  promotion.box.attr('piece', promotion.color + '-' + newType);

			  $('#pawn-promotion-option').addClass('hide');
			  $('#game').css('opacity', '1');

			  promotion = {};
		 });

		 //Reset game
		 $('#restart-btn').on('click', function() {
			  resetGame(); 
		 });

		 //Restart when game over
		 $('#result').on('click', function() {
			  resetGame($('.chess-container #game_wrap').attr("flag"));
		 });		 
		 //Box click event
		//  $('#board').on('click', '.box', function() {
		// 	checkmovepiece($(this));
		// });
	});
	var checkmovepiece = function(checkbox)
	{
		console.log("checkarrive");
		if($('#game').attr("flag") != moveflag)
		{
			return;
		}
		 if($(this).hasClass('selected')) { //Undo to select new box
		   $(this).removeClass('selected');

		   $('.box').removeClass('suggest');
		   select = { canMove: false, piece: '', box: '' };
		   return;
		 }

		 //Select new box
		 if(!select.canMove) {
			 console.log("select");
		   //Check the right color to play
				selectPiece(checkbox);
		 }

		 //Set up new destination for selected box
		 else if(select.canMove) { 
		   var selectedPieceInfo = select.piece.split('-');
		   var color = selectedPieceInfo[0];
		   var type = selectedPieceInfo[1];
		   console.log(color);
		   console.log(checkbox);
		   console.log(checkbox.attr('piece'));
		   //Select new piece to move if 2 colors are the same
		   if(checkbox.attr('piece').indexOf(color) >= 0) {
				$('#' + select.box).removeClass('selected');
				$('.box').removeClass('suggest');
				//Select a piece to move
				selectPiece(checkbox);
				return;
		   }

		   //Can move if it is valid
		   if(checkbox.hasClass('suggest')) { 

				//Save move in history
				var move = {
					 previous: {},
					 current: {}
				}

				move.previous.piece = select.piece;
				move.previous.box = select.box;

				move.current.piece = checkbox.attr('piece');
				move.current.box = checkbox.attr('id');


				socket.emit('updatemove', {user:$('#game').attr("flag"),From:select.box,To:move.current.box,piece:select.piece,capture:move.current.piece});
				historyMoves.push( move );
				showHistory();
				
				console.log(searchking);
				var searchking = checkbox.attr('piece').split('-');
				if(searchking[1]=='king')
				{
					socket.emit('win',searchking[0] );
					showWinner(player);
				}
				//Move selected piece successfully
				setPiece(checkbox, color, type);

				//Delete moved box
				deleteBox($('#' + select.box));

				$('.box').removeClass('suggest');

				select = { canMove: false, piece: '', box: '' };
				
				//Switch player
				switchPlayer();
				sendboarddata();
		   }

		//    var container = $('.chess-container #game_wrap').html();
		//    socket.emit('move', container);
		 }
	}
	//Get piece and position of the selected piece
	var selectPiece = function(box) {
		 box.addClass('selected');
		 select.box = box.attr('id');
		 select.piece = box.attr('piece');
		 select.canMove = true;

		 suggestNextMoves(getNextMoves(select.piece, select.box));
	}

	//CALCULATE VALID MOVES=======//

	//Returns possible moves of the selected piece
	var getNextMoves = function(selectedPiece, selectedBox) {
		 var selectedPieceInfo = selectedPiece.split('-');
		 var color = selectedPieceInfo[0];
		 var type = selectedPieceInfo[1];

		 var id = selectedBox.split('-');
		 var i = parseInt(id[1]);
		 var j = parseInt(id[2]);

		 var nextMoves = [];

		 switch(type) {
			  	case 'pawn':
						var moves1 = [
							[1, 1], [1, -1], [-1, 1], [-1, -1]
						];
					var moves2 = [
							[0, 1], [0, -1], [1, 0], [-1, 0]
					];
					nextMoves = getPawnMoves(i, j, color, moves1)
									.concat(getPawnMoves(i, j, color, moves2));
					break;
				case 'king':
						var moves1 = [
							[1, 1], [1, -1], [-1, 1], [-1, -1]
						];
					var moves2 = [
							[0, 1], [0, -1], [1, 0], [-1, 0]
					];
					nextMoves = getKingMoves(i, j, color, moves1)
									.concat(getKingMoves(i, j, color, moves2));									
					// if(color === 'black') {
					// 	 var moves = [
					// 		[0, 1], [0, -1], [1, 0], [-1, 0],[0, 2], [0, -2], [2, 0], [-2, 0],[1, 1], [1, -1], [-1, 1], [-1, -1], [2, 2], [2, -2], [-2, 2], [-2, -2]
					// 	 ];
					// } else {
					// 	 var moves = [
					// 		[0, 1], [0, -1], [1, 0], [-1, 0],[0, 2], [0, -2], [2, 0], [-2, 0],[1, 1], [1, -1], [-1, 1], [-1, -1], [2, 2], [2, -2], [-2, 2], [-2, -2]
					// 	 ];
					// }
					// nextMoves = getPawnMoves(i, j, color, moves);
					break;
			  case 'rook':
					var moves = [
						 [0, 1], [0, -1], [1, 0], [-1, 0]
					];
					nextMoves = getQueenMoves(i, j, color, moves);
					break;
			  case 'knight':
					var moves = [
						 [-1, -2], [-2, -1], [1, -2], [-2, 1],
						 [2, -1], [-1, 2], [2, 1], [1, 2]
					];
					nextMoves = getKnightMoves(i, j, color, moves);
					break;
			case 'bknight':
				var moves = [
						[-2, -3], [-3, -2], [2, -3], [-3, 2],
						[3, -2], [-2, 3], [3, 2], [2, 3]
				];
				nextMoves = getKnightMoves(i, j, color, moves);
				break;				
			  case 'bishop':
					var moves = [
						 [1, 1], [1, -1], [-1, 1], [-1, -1]
					];
					nextMoves = getQueenMoves(i, j, color, moves);
					break;
			  case 'queen':
					var moves1 = [
						 [1, 1], [1, -1], [-1, 1], [-1, -1]
					];
					var moves2 = [
						 [0, 1], [0, -1], [1, 0], [-1, 0]
					];
					nextMoves = getQueenMoves(i, j, color, moves1)
									.concat(getQueenMoves(i, j, color, moves2));
					break;
			  default: 
					break;
		 }
		 return nextMoves;
	}

	//Calculate next moves for pawn pieces
	var getPawnMoves = function(i, j, color, moves) {
		var nextMoves = [];
		for(var move of moves) {
			 var tI = i + move[0];
			 var tJ = j + move[1];
			 var count = 0;
			 var sugg = true;
			 while(sugg &&count<2  && !outOfBounds(tI, tJ)) {
				   var box = $('#box-' + tI + '-' + tJ);
				   if(box.hasClass('placed')) {
						if(box.attr('piece').indexOf(color) >= 0) {
							 sugg = false;
						} else
						{ 
							if(count==0 && (   (move[1]==1 && move[0]==1)||(move[1]==1 && move[0]==-1)||(move[1]==-1 && move[0]==1)||(move[1]=-1 && move[0]==-1)     )   ){
								console.log("capturearrive");
								console.log(move[0]);
								console.log(move[1]);
								nextMoves.push([tI, tJ]);
								sugg = false;
							}
							else
							{
								sugg = false;
							}
						}
				   }
				   if(sugg == true) {
						nextMoves.push([tI, tJ]);
						tI += move[0];
						tJ += move[1];
				   }
				   count++;
			 }
		}
		return nextMoves;
   }
   var getKingMoves = function(i, j, color, moves) {
	var nextMoves = [];
	for(var move of moves) {
		 var tI = i + move[0];
		 var tJ = j + move[1];
		 var count = 0;
		 var sugg = true;
		 while(sugg &&count<2  && !outOfBounds(tI, tJ)) {
			   var box = $('#box-' + tI + '-' + tJ);
			   if(box.hasClass('placed')) {
					if(box.attr('piece').indexOf(color) >= 0) {
						 sugg = false;
					} else if(count==0){
						 nextMoves.push([tI, tJ]);
						 sugg = false;
					}
					else
					{
						sugg = false;
					}
			   }
			   if(sugg) {
					nextMoves.push([tI, tJ]);
					tI += move[0];
					tJ += move[1];
			   }
			   count++;
		 }
	}
	return nextMoves;
}
	// var getPawnMoves = function(i, j, color, moves) {
	// 	var nextMoves = [];
	// 	 for(var move of moves) {
	// 		  var tI = i + move[0];
	// 		  var tJ = j + move[1];
	// 		  if(!outOfBounds(tI, tJ)) {
	// 				var box = $('#box-' + tI + '-' + tJ);
	// 				if(box.hasClass('placed')) {
	// 					if(move[0]!=0&&move[1]!=0)
	// 						nextMoves.push([tI, tJ]);
	// 				}
	// 				else
	// 				{
	// 					nextMoves.push([tI, tJ]);
	// 				}
	// 		  }
	// 	 }
	// 	 return nextMoves;
	// 	//  var nextMoves = [];
	// 	//  for(var index = 0; index < moves.length; index++) {
	// 	// 	  var tI = i + moves[index][0];
	// 	// 	  var tJ = j + moves[index][1];
	// 	// 	  if( !outOfBounds(tI, tJ) ) {
	// 				// var box = $('#box-' + tI + '-' + tJ);

	// 				// if(index === 0) { //First line
	// 				// 	 if(!box.hasClass('placed')) {
	// 				// 		  nextMoves.push([tI, tJ]);
	// 				// 	 } else {
	// 				// 		  index++;
	// 				// 	 }
	// 				// } else if(index === 1) { //First line
	// 				// 	 if( ((color === 'black' && j < 7) ||
	// 				// 			 (color === 'white' && j >9)) &&
	// 				// 		  !box.hasClass('placed')) {
	// 				// 		  nextMoves.push([tI, tJ]);
	// 				// 	 }
	// 				// } else if(index > 1) { //Other lines
	// 				// 	 if(box.attr('piece') !== '' && box.attr('piece').indexOf(color) < 0) {
	// 				// 		  nextMoves.push([tI, tJ]);
	// 				// 	 }
	// 				// }
	// 	// 	  }
	// 	//  }
	// 	//  return nextMoves;
	// }

	//Calculate next move of rook, bishop and queen pieces
	var getQueenMoves = function(i, j, color, moves) {
		 var nextMoves = [];
		 for(var move of moves) {
			  var tI = i + move[0];
			  var tJ = j + move[1];
			  var count = 0;
			  var sugg = true;
			  while(sugg &&count<7  && !outOfBounds(tI, tJ)) {
					var box = $('#box-' + tI + '-' + tJ);
					if(box.hasClass('placed')) {
						 if(box.attr('piece').indexOf(color) >= 0) {
							  sugg = false;
						 } else {
							  nextMoves.push([tI, tJ]);
							  sugg = false;
						 }
					}
					if(sugg) {
						 nextMoves.push([tI, tJ]);
						 tI += move[0];
						 tJ += move[1];
					}
					count++;
			  }
		 }
		 return nextMoves;
	}

	//Calculate next moves for knight or king pieces
	var getKnightMoves = function(i, j, color, moves) {
		 var nextMoves = [];
		 for(var move of moves) {
			  var tI = i + move[0];
			  var tJ = j + move[1];
			  if( !outOfBounds(tI, tJ) ) {
					var box = $('#box-' + tI + '-' + tJ);
					if(!box.hasClass('placed') || box.attr('piece').indexOf(color) < 0) {
						 nextMoves.push([tI, tJ]);
					}
			  }
		 }
		 return nextMoves;
	}
	//Calculate next moves for bknight
	var getbKnightMoves = function(i, j, color, moves) {
		 var nextMoves = [];
		 for(var move of moves) {
			  var tI = i + move[0];
			  var tJ = j + move[1];
			  if( !outOfBounds(tI, tJ) ) {
					var box = $('#box-' + tI + '-' + tJ);
					if(!box.hasClass('placed') || box.attr('piece').indexOf(color) < 0) {
						 nextMoves.push([tI, tJ]);
					}
			  }
		 }
		 return nextMoves;
	}

	//Check if position i, j is in the board game
	var outOfBounds = function(i, j) {
		 return ( i < 0 || i >= 16 || j < 0 || j >= 16 );
	}

	//Show possible moves by add suggestion to boxes
	var suggestNextMoves = function(nextMoves) {
		 for(var move of nextMoves) {
			  var box = $('#box-' + move[0] + '-' + move[1]);
			  box.addClass('suggest');
		 }
	}

	//=============================================//

	//Set up piece for clicked box
	var setPiece = function(box, color, type) {

		//  //Check end game (if king is defeated)
		//  if(box.attr('piece').indexOf('king') >= 0) {
		// 	  showWinner(player);

		// 	  box.html("<img src='../img/chess/"+chessPieces[color][type]+"'>");
		// 	  box.addClass('placed');
		// 	  box.attr('piece', color + '-' + type);

		// 	  return;
		//  }

		 //Check if pawn reached the last line
		 var j = parseInt(box.attr('id').charAt(6));
		 if(type === 'pawn') {
			  if( (player === 'black' && j === 15) ||
					(player === 'white' && j === 0)) {
					$('#game').css('opacity', '0.5');

					var option = $('#pawn-promotion-option');
					option.removeClass('hide');
					option.find('#queen').html(schessPieces[player].queen);
					option.find('#rook').html(schessPieces[player].rook);
					option.find('#knight').html(schessPieces[player].knight);
					option.find('#bknight').html(schessPieces[player].bknight);
					option.find('#bishop').html(schessPieces[player].bishop);

					promotion = { box: box, color: color };

					return;
			  }
		 }

		 box.html("<img draggable='true' ondragstart='drag(event)' src='../img/chess/"+chessPieces[color][type]+"'>");
		 box.addClass('placed');
		 box.attr('piece', color + '-' + type);
	}

	//Delete selected element
	var deleteBox = function(box) {
		 box.removeClass('placed');
		 box.removeClass('selected');
		 box.removeClass('suggest');
		 box.html('');
		 box.attr('piece', '');
	}

	//Default board state
	var setNewBoard = function(box, i, j, playflag = 'black') {
		if(playflag == 'white')
		{
			if(j === 15) {
				if(i === 0 || i === 7||i === 8 || i === 15) {
						setPiece(box, 'white', 'rook');
				} else if(i === 1 || i === 14) {
						setPiece(box, 'white', 'bknight');
				}else if(i === 6||i === 4||i === 9) {
						setPiece(box, 'white', 'knight');
				} else if(i === 2 || i === 5||i === 10 || i === 13) {
						setPiece(box, 'white', 'bishop');
				} else if(i === 3||i === 11) {
						setPiece(box, 'white', 'queen');
				} else if(i === 12) {
						setPiece(box, 'white', 'king');
				}
			} else if(j === 14) {
				setPiece(box, 'white', 'pawn');
			} else if(j === 1) {
				setPiece(box, 'black', 'pawn');
			} else if(j === 0) {
				if(i === 0 || i === 7||i === 8 || i === 15) {
						setPiece(box, 'black', 'rook');
				} else if(i === 1 || i === 14) {
						setPiece(box, 'black', 'bknight');
				}else if(i === 12||i === 6||i === 9) {
					setPiece(box, 'black', 'knight');
				} else if(i === 2 || i === 5||i === 10 || i === 13) {
						setPiece(box, 'black', 'bishop');
				} else if(i === 3||i === 11) {
						setPiece(box, 'black', 'queen');
				} else if(i === 4) {
						setPiece(box, 'black', 'king');
				}
			}
		}
		else
		{
			if(j === 15) {
				if(i === 0 || i === 7||i === 8 || i === 15) {
						setPiece(box, 'black', 'rook');
				} else if(i === 1 || i === 14) {
						setPiece(box, 'black', 'bknight');
				}else if(i === 6||i === 4||i === 9) {
						setPiece(box, 'black', 'knight');
				} else if(i === 2 || i === 5||i === 10 || i === 13) {
						setPiece(box, 'black', 'bishop');
				} else if(i === 3||i === 11) {
						setPiece(box, 'black', 'queen');
				} else if(i === 12) {
						setPiece(box, 'black', 'king');
				}
			} else if(j === 14) {
				setPiece(box, 'black', 'pawn');
			} else if(j === 1) {
				setPiece(box, 'white', 'pawn');
			} else if(j === 0) {
				if(i === 0 || i === 7||i === 8 || i === 15) {
						setPiece(box, 'white', 'rook');
				} else if(i === 1 || i === 14) {
						setPiece(box, 'white', 'bknight');
				}else if(i === 12||i === 6||i === 9) {
					setPiece(box, 'white', 'knight');
				} else if(i === 2 || i === 5||i === 10 || i === 13) {
						setPiece(box, 'white', 'bishop');
				} else if(i === 3||i === 11) {
						setPiece(box, 'white', 'queen');
				} else if(i === 4) {
						setPiece(box, 'white', 'king');
				}
			}
		}
	}

	//Switch player
	var switchPlayer = function() {
		// if($('.chess-container #game').attr("flag")=="white")
		// {
		// 	$('.chess-container #game').attr("flag", "black");
		// }
		// else
		// {
		// 	$('.chess-container #game').attr("flag", "white");
		// }
		 if(moveflag === 'black') {
			  $('#player').html(schessPieces.white.king);
			  moveflag = 'white';
		 } else {
			  $('#player').html(schessPieces.black.king);
			  moveflag = 'black';
		 }
	}

	//Restart game
	var resetGame = function(playerflag = 'black') {
		 console.log(playerflag);
		 deleteBox($('.box'));
		 $('#player').html(schessPieces.black.king);
		 $('#result').addClass('hide');
		 $('#option-menu').addClass('hide');
		 $('#game').css('opacity', '1');

		 //Set up color for boxes, chess pieces
		 for(var i = 0; i < 16; i++) {
			  for(var j = 0; j < 16; j++) {
					var box = $('#box-' + i + '-' + j);
					setNewBoard(box, i, j,playerflag);
			  }
		 }
		 player = playerflag;
		 moveflag = 'black';
		 //Set global variables to default
		//  player = playerflag;
		 select = {
			  canMove: false,
			  piece: '',
			  box: ''
		 };
		 console.log(player);
		 var option = $('#addboxlist');
		 option.find('#addpawn').attr('piece',playerflag+'-pawn');
		 option.find('#addrook').attr('piece',playerflag+'-rook');
		 option.find('#addqueen').attr('piece',playerflag+'-queen');
		 option.find('#addking').attr('piece',playerflag+'-king');
		 option.find('#addknight').attr('piece',playerflag+'-knight');
		 option.find('#addbknight').attr('piece',playerflag+'-bknight');
		 option.find('#addbishop').attr('piece',playerflag+'-bishop');


		 option.find('#addpawn').html("<img draggable='true' ondragstart='drag(event)' src='../img/chess/"+chessPieces[playerflag].pawn+"'>");
		 option.find('#addrook').html("<img draggable='true' ondragstart='drag(event)' src='../img/chess/"+chessPieces[playerflag].rook+"'>");
		 option.find('#addqueen').html("<img draggable='true' ondragstart='drag(event)' src='../img/chess/"+chessPieces[playerflag].queen+"'>");
		 option.find('#addking').html("<img draggable='true' ondragstart='drag(event)' src='../img/chess/"+chessPieces[playerflag].king+"'>");
		 option.find('#addknight').html("<img draggable='true' ondragstart='drag(event)' src='../img/chess/"+chessPieces[playerflag].knight+"'>");
		 option.find('#addbknight').html("<img draggable='true' ondragstart='drag(event)' src='../img/chess/"+chessPieces[playerflag].bknight+"'>");
		 option.find('#addbishop').html("<img draggable='true' ondragstart='drag(event)' src='../img/chess/"+chessPieces[playerflag].bishop+"'>");

		 historyMoves = [];
		 promotion = {};
		 $("#gamehistorylist").html("");
	}
	var showHistory = function()
	{
		var historysection = $("#gamehistorylist");
		historysection.html("");
		for (let index = 0; index < historyMoves.length; index++) {
			const element = historyMoves[index];

			var move = {
				previous: {},
				current: {}
		   }
		   if(element.previous.box == 'new')
		   {
			var tolist = element.current.box.split('-');
			 historysection.append($('<tr class = "historyitem"></tr>')
				 .html('<td>'+element.previous.piece+'</td><td> new </td><td>'+showchar(parseInt(tolist[1]))+' '+(16-parseInt(tolist[2])).toString()+'</td><td>'+element.current.piece+'</td>')
				 );			
		   }
		   else
		   {
		   var fromlist = element.previous.box.split('-');
		   var tolist = element.current.box.split('-');
		   var temp = 'a'+parseInt(fromlist[1]);
		   console.log(temp);
			historysection.append($('<tr class = "historyitem"></tr>')
				.html('<td>'+element.previous.piece+'</td><td>'+showchar(parseInt(fromlist[1]))+' '+(16-parseInt(fromlist[2])).toString()+'</td><td>'+showchar(parseInt(tolist[1]))+' '+(16-parseInt(tolist[2])).toString()+'</td><td>'+element.current.piece+'</td>')
				);			
		   }
		}
	}
	var showchar = function(num)
	{
		switch(num)
		{
			case 0:
				return 'A';
			case 1:
				return 'B';
			case 2:
				return 'C';
			case 3:
				return 'D';
			case 4:
				return 'E';								
			case 5:
				return 'F';
			case 6:
				return 'G';
			case 7:
				return 'H';
			case 8:
				return 'I';
			case 9:
				return 'J';
			case 10:
				return 'K';
			case 11:
				return 'L';
			case 12:
				return 'M';
			case 13:
				return 'N';
			case 14:
				return 'O';
			case 15:
				return 'P';												
			}
	}
	//Announce the winner
	var showWinner = function(winner) {

		 historyMoves = [];
		 promotion = {};

		 setTimeout(function() {
			  if(winner === 'DRAW') { //Game is draw
					$('#result').css('color', '#000');
					$('#result').html(winner);
			  } else { //There is a winner
					$('#result').css('color', winner + '');
					$('#result').html(schessPieces[winner].king + ' wins!');
			  }
			  $('#result').removeClass('hide');
			  $('#game').css('opacity', '0.5');
		 }, 1000);
	}

	allowDrop = function(ev) {

		ev.preventDefault();
	}
	  
	drag = function(ev) {
		var emptyImage = document.createElement('img');
		emptyImage.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  		ev.dataTransfer.setDragImage(emptyImage, 0, 0);
		console.log(ev.target);
		if($('#game').attr("flag") != moveflag)
		{
			return false;
		}
		if(!$(ev.target).is('img'))
			return false;

		var listpiece = $(ev.target).parent().attr('piece').split('-');
		if(listpiece[0]!=player)
		{
			ev.dataTransfer.setData("text", null);
			return;
		}
		else{
			checkmovepiece($(ev.target).parent());
			ev.dataTransfer.setData("text", $(ev.target).parent().attr('id'));
		}
	}
	
	drop = function(ev) {
		console.log("drop");
		console.log(ev.target);
		ev.preventDefault();
		if($('#game').attr("flag") != moveflag)
		{
			return;
		}
		// if($('#game').attr("flag") != $('#game_wrap').attr("flag"))
		// {
		// 	return;
		// }
		var dataid = ev.dataTransfer.getData("text");
		if(dataid == null)
			return;
		var data = document.getElementById(dataid);

		if($(data).hasClass('ng-scope'))
		{
			var listpiece = $(data).attr('piece').split('-');
			console.log(player);
			if(listpiece[0]==player)
			{
				if($(ev.target).is('img'))
				{
					// var listpiece = $(ev.target).parent().attr('piece').split('-');
					// console.log(listpiece);
					// if(listpiece[0]==player)
					console.log("droparrive");
						checkmovepiece($(ev.target).parent());
				}
				else
				{
					console.log("droparrive");
					// var listpiece = $(ev.target).attr('piece').split('-');
					// console.log(listpiece);
					// if(listpiece[0]==player)
					// 	checkmovepiece($(ev.target));
					checkmovepiece($(ev.target));
				}
			}
		}
		else if($(data).hasClass('addpiece'))
		{
			if(!$(ev.target).is('img'))
			{
				$(ev.target).html($(data).first().html());
				$(ev.target).attr('piece',$(data).first().attr('piece'));
				switchPlayer();
				// var container = $('.chess-container #game_wrap').html();
				// socket.emit('move', container);
				sendboarddata();



				var move = {
					previous: {},
					current: {}
			   }

			   move.previous.piece = $(data).first().attr('piece');
			   move.previous.box = 'new';

			   move.current.piece = $(ev.target).attr('piece');
			   move.current.box = $(ev.target).attr('id');


			   socket.emit('updatemove', {user:$('#game').attr("flag"),From:'new',To:move.current.box,piece:select.piece,capture:""});
			   historyMoves.push( move );
			   showHistory();
				// socket.emit('updatemove', {user:$('#game').attr("flag"),From:'new',To:$(ev.target).attr('id'),piece:$(data).first().attr('piece'),capture:$(ev.target).attr('piece')});
			}
			else
			{




				var move = {
					previous: {},
					current: {}
			   }

			   move.previous.piece = $(data).first().attr('piece');
			   move.previous.box = 'new';

			   move.current.piece = $(ev.target).parent().attr('piece');
			   move.current.box = $(ev.target).parent().attr('id');


			   socket.emit('updatemove', {user:$('#game').attr("flag"),From:'new',To:move.current.box,piece:select.piece,capture:move.current.piece});
			   historyMoves.push( move );
			   showHistory();
			   $(ev.target).parent().attr('piece',$(data).first().attr('piece'));
			   $(ev.target).parent().html($(data).first().html());
			   switchPlayer();
			   // var container = $('.chess-container #game_wrap').html();
			   // socket.emit('move', container);
			   sendboarddata();
			}
		}
		mySound.play();		
	}
	sendboarddata = function()
	{
		var boxdata = $('#game .box');
		var chessdata="";
		for (let index = 0; index < boxdata.length; index++) {
			const element = boxdata[index];
			var attr = $(element).attr('piece');
			if (typeof attr !== typeof undefined && attr !== false&& attr != "") {
				switch(attr)
				{
					case 'white-pawn':
						chessdata+="p";
						break;
					case 'white-rook':
						chessdata+="r";
						break;
					case 'white-queen':
						chessdata+="q";
						break;
					case 'white-king':
						chessdata+="k";
						break;
					case 'white-knight':
						chessdata+="s";
						break;
					case 'white-bknight':
						chessdata+="h";
						break;
					case 'white-bishop':
						chessdata+="b";
						break;
					case 'black-pawn':
						chessdata+="P";
						break;
					case 'black-rook':
						chessdata+="R";
						break;
					case 'black-queen':
						chessdata+="Q";
						break;
					case 'black-king':
						chessdata+="K";
						break;
					case 'black-knight':
						chessdata+="S";
						break;
					case 'black-bknight':
						chessdata+="H";
						break;
					case 'black-bishop':
						chessdata+="B";
						break;						
				}
			}
			else
			{
				chessdata+="0";
			}

		}
		console.log(chessdata);
		socket.emit('chessboard', chessdata);
	}  
	function sound(src) {
		this.sound = document.createElement("audio");
		this.sound.src = src;
		this.sound.setAttribute("preload", "auto");
		this.sound.setAttribute("controls", "none");
		this.sound.style.display = "none";
		document.body.appendChild(this.sound);
		this.play = function(){
			this.sound.play();
		}
		this.stop = function(){
			this.sound.pause();
		}    
	}
});

var groupManager = function(api_key, app_name, group_number) {
//	store the group number
	this.group_number = group_number;
//	reference to our messages collection...
	this.messagesRef = new DataMcFly(api_key, app_name, "messages");

//	reference to our group collection...
	this.groupRef = new DataMcFly(api_key, app_name, "group");
	
	this.group_members = [];
};
groupManager.prototype.start = function(){
//	list group members if any
	var _this = this;

	this.groupRef.on("value", function( data ){
		if( data.count() ){		
			data.forEach( function( snapshot ){
				var member = snapshot.value();
				_this.group_members[member._id] = member;				
			});
		}
		_this.displayGroup();
	});
//	listen for new members being added
	this.groupRef.on("added", function( snapshot ){
		var member = snapshot.value();
console.log( member );		
		_this.group_members[member._id] = member;
		_this.displayGroup();
	});

//	save new group member to our app
	$("#group_form").submit( function(e){
		var member = {
			'groupNumber': this.group_number,
			'name':$("#name").val(),
			'number':$("#phone").val()
		};
console.log( member );
		this.groupRef.push( member );
		$("#name").val('');
		$("#phone").val('');
		return false;
	});

//	listen for members being removed
	$('div').on('click','a.delete', function(e){
		var _id = e.target.id;
		_this.groupRef.remove(_id);
		return false;
	});

	this.groupRef.on("removed", function( snapshot ){
		var member = snapshot.value();
		_this.group_members[member._id] = undefined;
		_this.displayGroup();
	});

//	list any existing chat message
	this.messagesRef.on('value', function (data) {
		if( data.count() ){
			data.forEach( function(message){				
				_this.displayChatMessage(message.value() );
			});
		}
	});		
//	listen for incoming chat messages
	this.messagesRef.on('added', function (data) {
		var message = data.value();
		_this.displayChatMessage( message );
	});

//	listen for outgoing chat messages	
	// When the user presses enter on the message input, write the message to firebase.
	$('#msg_form').submit( function(e){
		var d = new Date();
		var date = d.toLocaleString();
		var message = {
				"tstamp": date,
				"fromName": "Admin",
				"fromNumber": "",
				"message": $('#messageInput').val(),
				"fromCity": "",
				"fromState": "",
				"fromCountry": "",
				"groupNumber": _this.group_number
		}
		_this.messagesRef.push( message );
		$('#messageInput').val('');
		return false;
	});
};

//	Display group members
groupManager.prototype.displayGroup = function(){
	$('#group_wrapper').html('');
	for (var i in this.group_members ) {	
		var member = this.group_members[i];
		if( member != undefined ){
			var html = '';
			html = '<span>'+member.name+' ( ' + member.phone + ' )</span> <a href="#delete" class="delete" id="' + member._id+'">[remove]</a>';
			$('<div/>').prepend( html ).appendTo($('#group_wrapper'));
		}
	}	
};

//	Display chat messages
groupManager.prototype.displayChatMessage = function( message ){
	var _this = this;
	$('<li/>')
		.attr("id",message._id)
		.text(message.message)
		.prepend(
			$("<strong class='example-chat-username' />").text(message.fromName+': ')
			).appendTo( $('#messagesDiv') );
	$('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
};


/*
groupManager.prototype = {
	chats: [], // collection of chats in progress

	getChat: function(fromNumber) {
		// finds or creates a chat from a particular recipient
		var foundChat = null;

		// search existing chats
		for (c = 0; c < this.chats.length; c++) {
			if (this.chats[c].from == fromNumber) {
				foundChat = this.chats[c];
			}
		}

		// no existing chat found, so create a new one
		if (foundChat == null) {
			foundChat = new chat( this.datamcflyRef );
			foundChat.init(fromNumber);
			foundChat.displayTemplate();
			this.chats.push(foundChat);
		}

		return foundChat;
	},
	updateChats: function() {
		var _this = this;
		this.datamcflyRef.once('value', function (data) {
			data.forEach( function(message){					
				var row = message.value();
				_this.getChat( row.fromNumber ).addMessage(
					row.textMessage,
					row.tstamp,
					row.direction
				);
			});
		});
		this.datamcflyRef.on('added', function (data) {
			var row = data.value();
			_this.getChat( row.fromNumber ).addMessage(
				row.textMessage,
				row.tstamp,
				row.direction
			);
		});
	}
};

var chat = function(datamcflyRef) {
	this.datamcflyRef = datamcflyRef;
};
chat.prototype = {
	// represents a chat window, renders messages to the screen
	init: function(name) {
		this.from = name; // name of person the chat is from
		// div id names
		this.chatName = 'chat-' + this.from;
		this.buttonName = 'submit-' + this.from;
		this.textName = 'reply-' + this.from;
	},
	replyMessage: function(message) {
		// this is called when you click the reply button
		// calls the controller to send a Twilio SMS and update our Data McFly app
		var _this = this;
		$.ajax({
			type: "POST",
			url: "/reply",
			data: {
				'To': this.from,
				'Body': message,
				'From': this.from
			},
			dataType: "json",
			success: function(data) {
				// your message was sent
			}
		});
	},
	displayTemplate: function() {
		// draw the html for a chat window
		var content = '<div class="chatName">Chat with ' + this.from + '</div> \
		<div class="messages" id="' + this.chatName + '"></div> \
		<div class="messageForm"><textarea id="' + this.textName + '"></textarea><button id="' + this.buttonName + '">Reply</button></div> \
	  </div>';
		// wrap the template	
		content = '<div class="chatWindow" id="' + this.tmplName + '">' + content + '</div>';
		// Add it to the screen
		$('#templateContainer').append(content);
		var _this = this;
		// handler for reply button
		$('#' + this.buttonName).click(function() {
			_this.replyMessage($('#' + _this.textName).val());
			$('#' + _this.textName).val('');
		});
	},
	addMessage: function(message, tstamp, direction) {
		// add a message to this chat
		$('#' + this.chatName).append("<div class='message_" + direction + "'>" + message + "<div class='tstamp'>" + tstamp + "</div></div>");
	}
};
*/
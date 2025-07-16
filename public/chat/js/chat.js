const msgerForm 		= get(".msger-inputarea");
const msgerInput 		= get(".msger-input");
const msgerChat 		= get(".msger-chat");
const sendBtn 			= document.getElementById("sendBtn");
const fileBtn 			= document.getElementById("fileBtn");
const responseFinishBtn = document.getElementById("responseFinishBtn");

// Icons made by Freepik from www.flaticon.com
const PERSON_IMG 	= '';
var bot_name  		= '';
var person_name 	= '';
var project_id 		= '';
var server 			= '';
var receiver_id 	= '';
var replied_msg_id	= '';
var replied_file_id = '';
var modalOpened		= false;
var haveNew			= true;
var chatIsOpen		= false; // the chat is loaded but the user hevent click on chat modal yet
const http 			= window.location.protocol;
const URL  			= window.location.href;
const domain 		= 'diamta.com';
const serverbase 	= URL.includes( 'localhost' ) ? http + '//localhost/diamta/projects/public/index.php/projects' :  http + '//' + 
 domain + '/projects/public/index.php/projects';
const chatFileDir 	= URL.includes( 'localhost' ) ? http + '//localhost/diamta/projects/public/uploads/files/chat' : http + '//' +  domain +  '/projects/public/uploads/files/chat'; 
var lastLoaded		= '';
// console.log( "http: " + http );
// console.log( "serverbase: " + serverbase );

sendBtn.addEventListener( "click", event => {

	event.preventDefault();

	const msgText = msgerInput.value;
	if ( !msgText && !files ) 
		return;
// alert( msgText );
	// appendMessage( person_name, PERSON_IMG, "right", msgText );
	
	msgerInput.value = "";

	// Automatic reply
	// botResponse();

	// Save messages
	if( msgText )
		saveMessage( msgText, project_id, receiver_id );
	
	// Save files
	const uploadImages = () => {
		// var files = event.target.files;
        // files = Object.values(files);
		var count_files = 0;
		for ( let i = 0; i < files.length; i++ ) {
			saveFile( files[i] );
        }
		closeChatFilesPreview();
	}
console.log( files );	
	if ( files )
		uploadImages();


});

responseFinishBtn.addEventListener( "click", event => {
	// alert( responseFinish );
	responseFinish();
})

// save a chat message
function saveMessage( message_text, project_id, receiver_id ){
	const xhttp = new XMLHttpRequest();
	xhttp.onload = function() {
		const result = this.responseText;
		responseFinish();
	}
	const server = serverbase + "/saveMessage";
// alert( server );
	const params = "project_id=" + project_id + "&receiver_id=" + receiver_id + "&message_text=" + message_text + "&replied_msg_id=" + replied_msg_id + "&replied_file_id=" + replied_file_id;
	xhttp.open( "POST", server );
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send( params );
}

function saveFile( file ){
	const data = new FormData();
	data.append( 'files[]', file );
	data.append( 'replied_msg_id', replied_msg_id );
	data.append( 'replied_file_id', replied_file_id );

	const server = serverbase + "/saveFile/" + project_id + "/" + receiver_id;
	jQuery.ajax({
        type: 'POST',
        url: server, 
        enctype: "multipart/form-data",
        data: data,
        processData: false,
        contentType: false,
        cache: false,
        success: function(response) {
            jQuery("#uploader").val(null); // empty the file input
            jQuery( '#previewer' ).attr( 'src', '' ); // reset the previewer
            jQuery("#previewer").hide();
            // jQuery("#count_images").html( 0 );
			responseFinish();
        },
        error: function(request, textStatus, errorThrown) {
                alert(errorThrown);
                jQuery( '#anim01' ).hide();
        }
    });
}

const responseMessage = ( msg, msgid, type, displayname, fileSrc ) => {
// alert( type );
	document.getElementById( 'chatMsgMenu' ).style.display = 'block'; 		// display the responce div
	document.getElementById( 'chatMsgUserId' ).innerHTML = displayname; 	// display the user name
	if( type == 'file' ){
		replied_file_id = msgid;
		const html = '<img src="' + fileSrc + '" class="chatFilesPreviewClass">';
		document.getElementById( 'chatMsgResponse' ).innerHTML = html;
	}
	else{
		replied_msg_id = msgid;
		document.getElementById( 'chatMsgResponse' ).innerHTML = msg;
	}
}

const responseFinish = () =>{
	document.getElementById( 'chatMsgMenu' ).style.display = 'none';
	document.getElementById( 'chatMsgUserId' ).innerHTML = '';
	replied_msg_id	= "";
	replied_file_id = "";
}

const deleteMessage = ( msgid, type ) => {
	const rep = confirm( 'Do you want to delete this message' );
	if( !rep )
		return;
	
	const xhttp = new XMLHttpRequest();
	xhttp.onload = function() {
		var result = this.responseText;
		console.log( result );

		var messages = JSON.stringify( result );
		var messages = JSON.parse( result );
// console.log( typeof messages );

		msgerChat.innerHTML = '';
		loadMessages( messages );
	}
	const deleteMessageURL = serverbase + "/message/delete/" + msgid;
	const deleteFileURL = serverbase + "/file/delete/" + msgid;
	const server = type == 'message' ? deleteMessageURL : deleteFileURL;
	xhttp.open( "POST", server );
	xhttp.setRequestHeader( "Content-type", "application/x-www-form-urlencoded" );
	xhttp.send();
}

function getMsgMenu( type, cancelable, msgid, displayname, userid, msg, fileSrc, readbyreceiver ){	// message button for cancelation, modification, ...
	// alert( msg );
	
	// read
	var read = '';
	if( readbyreceiver === true ) 
		read = '<span style="color:green">read</span>';
	else if( readbyreceiver === false )
		read = '<span style="color:silver">not read</span>';
	
	// cancel
	var cancel = '';
	
	if( cancelable )
		cancel = '<a title=\'delete\' style="cursor:pointer; color:red;" onclick="deleteMessage( ' + msgid + ', \'' + type + '\' );" >&nbsp;x</a>';
	
	// reply
	msg = msg.replace(/'/g, "&lsquo;");
	var respond = '<a title=\'reply\' style="cursor:pointer; color:blue;" onclick="responseMessage( \'' + msg + '\', ' + msgid + ', \'' + type + '\', \'' + displayname + '\', \'' + fileSrc + '\' );">&nbsp;reply</a>';
	
	const html = '<div style="font-size:11px; ">' + read + ' ' + respond + ' ' + cancel + '</div>';
	return html;
}

async function appendMessage( displayname, img, side, msg, time, cancelable, msgid, msgreceiverid, readbyreceiver ){
	const type	  = 'message';
	const fileSrc = '';
	const msgmenu = getMsgMenu( type, cancelable, msgid, displayname, msgreceiverid, msg, fileSrc, readbyreceiver );
	const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${displayname}</div>
          <div class="msg-info-time">${time}</div>
        </div>

        <div class="msg-text" style="white-space: pre-wrap;">${msg}</div>
		
      </div>
	  ${msgmenu}
    </div>`;
	// document.getElementById( 'curentTime' ).innerHTML = time;
	await msgerChat.insertAdjacentHTML( "beforeend", msgHTML );
	// msgerChat.innerHTML = msgHTML;
	var divMessagelength = length
	msgerChat.scrollTop += 50000;
}

// Append text message that reply to image or text message
async function appendMessageReply( repliedDisplayName, repliedMessage, displayName, person_img, side, msg, time, cancelable, msgid, msgreceiverid, replyToType, replyTo_FileSrc, replyTo_fileExt, replyTo_fileName, replyTo_fileSize, readbyreceiver ){
	const type	  		= 'message';
	replyTo_fileSize 	= parseFloat( replyTo_fileSize ).toFixed(2);
	const noSrc 		= '';
	const msgmenu 		= getMsgMenu( type, cancelable, msgid, displayName, msgreceiverid, msg, noSrc, readbyreceiver );
// console.log( msgmenu );	
	const fileSrc		= ( imgExt.includes( replyTo_fileExt ) ) ? replyTo_FileSrc : getFileScr( replyTo_fileExt );
	
	const contentHTML 	= ( replyToType == 'file' ) ? "<a href='" + replyTo_FileSrc + "' download><img src='" + fileSrc + "' style='max-width:200px;' ></a><br><a href='" + replyTo_FileSrc + "' download>" + replyTo_fileName + "</a><br>" + replyTo_fileSize + " mo" : repliedMessage;
	const msgHTML 		= `
    <div class="msg ${side}-msg">
      <div class="msg-bubble">
		<div class="msg-info" style='display:block'>
          <div class="msg-info-name">${repliedDisplayName}</div>
		  <div class="msg-text" style="white-space: pre-wrap;"><br>${contentHTML}</div>
        </div>
		<span>---------------------------</span>
        <div class="msg-info">
          <div class="msg-info-name">${displayName}</div>
          <div class="msg-info-time">${time}</div>
        </div>

        <div class="msg-text" style="white-space: pre-wrap;">${msg}</div>
		
      </div>
	  ${msgmenu}
    </div>
  `;
	// document.getElementById( 'curentTime' ).innerHTML = time;
	await msgerChat.insertAdjacentHTML( "beforeend", msgHTML );
	// msgerChat.innerHTML = msgHTML;
	msgerChat.scrollTop += 50000;
}


async function appendFile( displayname, person_img, message_side, fileName, fileURL, fileSize, fileExt, message_time, cancelable, msgid, msgreceiverid, readbyreceiver ){
	const type		= "file";
	fileSize			= parseFloat( fileSize ).toFixed(2);
	const fileSrc	= ( imgExt.includes( fileExt ) ) ? fileURL : getFileScr( fileExt );
	const msgmenu 	= getMsgMenu( type, cancelable, msgid, displayname, msgreceiverid, fileName, fileSrc, readbyreceiver );
	const imgHTML 	= `
    <div class="msg ${message_side}-msg">

    <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${displayname}</div>
          <div class="msg-info-time">${message_time}</div>
        </div>
        <div class="msg-text"><a href='${fileURL}' download><img style='max-width:200px;' src='${fileSrc}'></a><br><a href='${fileURL}' download>${fileName}</a> <br> ${fileSize} mo</div>
      </div>
	  ${msgmenu}
    </div>
  `;
	// document.getElementById( 'curentTime' ).innerHTML = time;
	await msgerChat.insertAdjacentHTML( "beforeend", imgHTML );
	
	msgerChat.scrollTop += 50000;

}

// Append text message that reply to image or text message
async function appendFileReply( repliedDisplayName, repliedMessage, displayName, person_img, side, fileName, fileSrc, fileExt, fileSize, time, cancelable, msgid, msgreceiverid, replyTo_Type, replyTo_FileSrc, replyTo_fileExt, replyTo_fileName, replyTo_fileSize, readbyreceiver ){
	const type	  		= 'file';
	const noSrc 		= '';
	const fileSrc01		= ( imgExt.includes( replyTo_fileExt ) ) ? replyTo_FileSrc : getFileScr( replyTo_fileExt );
	const fileSrc02		= ( imgExt.includes( fileExt ) ) ? fileSrc : getFileScr( fileExt );
	const msgmenu 		= getMsgMenu( type, cancelable, msgid, displayName, msgreceiverid, fileName, fileSrc02, readbyreceiver );
	fileSize			= parseFloat( fileSize ).toFixed(2);
	replyTo_fileSize 	= parseFloat( replyTo_fileSize ).toFixed(2);
	
	const contentHTML01 = ( replyTo_Type == 'file' ) ? "<a href='" + replyTo_FileSrc + "' download><img src='" + fileSrc01 + "' style='max-width:200px;' ></a><br><a href='" + replyTo_FileSrc + "' download>" + replyTo_fileName + "</a><br>" + replyTo_fileSize + " mo" : repliedMessage;
	
	const contentHTML02 = "<a href='" + fileSrc02 + "' download><img src='" + fileSrc02 + "' style='max-width:200px;' ></a><br><a href='" + replyTo_FileSrc + "' download>" + fileName + "</a><br>" + fileSize + " mo";
	
	const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-bubble">
		<div class="msg-info" style='display:block'>
          <div class="msg-info-name">${repliedDisplayName}</div>
		  <div class="msg-text" style="white-space: pre-wrap;"><br>${contentHTML01}</div>
        </div>
		<span>---------------------------</span>
        <div class="msg-info">
          <div class="msg-info-name">${displayName}</div>
          <div class="msg-info-time">${time}</div>
        </div>
		<div>${contentHTML02}</div>
      </div>
	  ${msgmenu}
    </div>`;
	
	// document.getElementById( 'curentTime' ).innerHTML = time;
	await msgerChat.insertAdjacentHTML( "beforeend", msgHTML );
	// msgerChat.innerHTML = msgHTML;
	msgerChat.scrollTop += 50000;
}

// Get messages and load them in the chat box
function getMessage(){
// console.log( 'Setinterval' );	
	const xhttp = new XMLHttpRequest();
	xhttp.onload = function() {
		var result = this.responseText;

		if( result != '0' && lastLoaded != result ){	// Todo: '0' must be an int
console.log( 'Has new message' );
// console.log( result );
			msgerChat.innerHTML = '';
			// var messages = JSON.stringify( result );
			var messages = JSON.parse( result );

			loadMessages( messages );
			lastLoaded = result;

			haveNew = true;

			if( modalOpened )
				setMessagesRead( project_id );
		}
		else{
			haveNew = false;
console.log( 'No new message' );
		}
	}
	const server = serverbase + "/getMessages/" + project_id;
	xhttp.open( "POST", server );
	xhttp.setRequestHeader( "Content-type", "Content-type: application/json" );
	xhttp.send();
}
// get the messages
const interval = setInterval( getMessage, 2500 );

// set messages as read
function setMessagesRead( project_id ){	
	const xhttp = new XMLHttpRequest();
	xhttp.onload = function() {
		var result = this.responseText;
console.log( 'setMessagesRead:' + result );
	}
	const server = serverbase + "/setMessagesRead/" + project_id;
	xhttp.open( "POST", server );
	xhttp.setRequestHeader( "Content-type", "Content-type: application/json" );
	xhttp.send();		
}

// load mesages in the chat box
async function loadMessages( messages ){
	var count 		 = 0;
	var count_unread = 0;
	for( var key01 in messages ){
		if ( messages.hasOwnProperty( key01 ) ) {

			for( var key02 in messages[ key01 ] ){
				const message = messages[ key01 ];
				if ( message.hasOwnProperty( key02 ) ) {
					// get messages data;
					const username 			= message.name;		// current user
					// const msgreceivername 	= message.msgusername;
					const msgusername 		= message.messageUserName;
					const msguserid 		= message.messageUserId;
					const msgreceiverid 	= message.messageReceiverId;
					const person_img 		= PERSON_IMG;
					const message_side 		= message.side;
					const message_text 		= message.message;
					const message_time 		= message.displayDate;
					const type 				= message.type;
					const viewed 			= message.viewed;
					const cancelable		= message.canbedeleted == '1' ? true : false;
					const msgid				= message.messageId;
					var displayname 		= ( userid == msguserid ) ? 'You' : msgusername.split( ' ' )[0];
					if( !viewed && message.isReceiver )   
						count_unread++;
					
					var readbyreceiver = '';
					if( userid == msguserid && viewed )
						readbyreceiver = true;
					else if( userid == msguserid && !viewed )
						readbyreceiver = false;
						
					// display messages data
					if( type == 'text' ){ 				// display a text message
						const repliedMessage 		= message.repliedMessage;
						const category 				= repliedMessage.category;
						
						if( category == null || category == 'A' ){	// not amessage reply

							await appendMessage( displayname, person_img, message_side, message_text, message_time, cancelable, msgid, msgreceiverid, readbyreceiver );
							
						}
						else if( category == 'B' ||  category == 'C' ){		// display a text message replying to a message
							const repliedDisplayName 	= repliedMessage.name.split( ' ' )[0] ;
							displayname 		= ( userid == msguserid ) ? 'You replied' : msgusername.split( ' ' )[0] + ' replied';
							var replyToType  			= '';
							var replyTo_FileSrc			= '';
							var replyTo_fileExt 		= '';
							var replyTo_fileName		= '';
							var replyTo_fileSize		= '';
							var repliedMsg				= '';
							if( category == 'C' ){
								replyToType 		= 'file';
								replyTo_FileSrc		= chatFileDir + "/" + repliedMessage.replied_fileSrc;
								replyTo_fileExt 	= repliedMessage.replied_fileExt;
								replyTo_fileName 	= repliedMessage.replied_fileName;
								replyTo_fileSize	= repliedMessage.replied_fileSize;
							}
							else{
								replyToType = 'message';
								repliedMsg	= repliedMessage.replied_message;
							}
							
							await appendMessageReply( repliedDisplayName, repliedMsg, displayname, person_img, message_side, message_text, message_time, cancelable, msgid, msgreceiverid, replyToType, replyTo_FileSrc, replyTo_fileExt, replyTo_fileName, replyTo_fileSize, readbyreceiver );
						}
					}
					else{ 	 				// display image message
						const fileName 	= message.fileName; // original name
						const path 		= message.path; 	// name on the server
						const fileSize 	= parseFloat( message.size ).toFixed(2);
						const fileExt  	= message.fileExtension;
						const fileURL  	= chatFileDir + "/" + path;  
						
						const repliedFile 		= message.repliedFile;
						const category 			= repliedFile.category;	

						if( category == null || category == 'A' ){	// not a message reply
							displayname 		= ( userid == msguserid ) ? 'You' : msgusername.split( ' ' )[0];
							await appendFile( displayname, person_img, message_side, fileName, fileURL, fileSize, fileExt, message_time, cancelable, msgid, msgreceiverid, readbyreceiver );	
							
						}
						else if( category == 'D' || category == 'E' ){		// File replying to a text file

							const repliedDisplayName = repliedFile.name;
							displayname 			= ( userid == msguserid ) ? 'You reply' : msgusername.split( ' ' )[0] + ' replied';
							// displayname				= 'You replied';
							var replyToType  		= '';
							var replyTo_FileSrc		= '';
							var replyTo_fileExt 	= '';
							var replyTo_fileName	= '';
							var replyTo_fileSize	= '';
							var repliedMsg  		= repliedFile.replied_message;
							if( category == 'E' ){

								replyToType 		= 'file';
								replyTo_FileSrc		= chatFileDir + "/" + repliedFile.replied_fileSrc;
								replyTo_fileExt 	= repliedFile.replied_fileExt;
								replyTo_fileName 	= repliedFile.replied_fileName;
								replyTo_fileSize	= repliedFile.replied_fileSize;
							}
							else{

								replyToType = 'message';
								repliedMsg	= repliedFile.replied_message; 
							}
							await appendFileReply( repliedDisplayName, repliedMsg, displayname, person_img, message_side, fileName, fileURL, fileExt, fileSize, message_time, cancelable, msgid, msgreceiverid, replyToType, replyTo_FileSrc, replyTo_fileExt, replyTo_fileName, replyTo_fileSize, readbyreceiver );
						}
					}
					count++;
					break;
				}
			}
		}
    }
	// Update all projects message as read
	document.getElementById( 'countMessages' ).innerHTML = count_unread + ' new';
}

// Utils
function get(selector, root = document) {
  return root.querySelector(selector);
}

function formatDate(date) {
  const h = "0" + date.getHours();
  const m = "0" + date.getMinutes();

  return `${h.slice(-2)}:${m.slice(-2)}`;
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
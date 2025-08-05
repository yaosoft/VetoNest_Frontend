
const base_api_url	= 'http://localhost/vetonest_backend/public/index.php/api/'; // dev
// helper: Fetch data definition
async function fetchData( url, data, method, spiner ) {
		if( !isOnline ){
			message.error( 'No network!' );
			return false;
		}
		
		// if( spiner )
			// setSpiner( 'block' )

		const response = await fetch( url, {
			method: method, // *GET, POST, PUT, DELETE, etc.
			// mode: "no-cors", // no-cors, *cors, same-origin
			headers: {
				"Content-Type": "application/json",
				// 'Content-Type': 'application/x-www-form-urlencoded',
			},
			...( method == 'POST' && { body: JSON.stringify( data ), } )
		});
		// setTimeout( setSpiner, 2000, 'none' );
// alert( response.status );
		if( response.status != 200 )
			return false;
		
		if( response.status == 200 ){
			return response.json(); // parses JSON response into native JavaScript objects
			// if( method == 'GET' )
				// return response.json(); // parses JSON response into native JavaScript objects
			
			// if( method == 'POST' )
				// return true;

		}
}

const regexEmailValidation = /^[a-zA-Z0-9. _-]+@[a-zA-Z0-9. -]+\.[a-zA-Z]{2,4}$/; 
const registration = async ( subscribeEmail, subscribePassword ) => {
		
		// event.preventDefault();
		
		// spin
		//setSubscribeSpin( 'block' );

		if( !subscribeEmail ){
			message.error( 'Email address is missing.' );
			setSubscribeSpin( 'none' );
			return
		}

		if( !regexEmailValidation.test( subscribeEmail ) ) {
			message.error( 'Email address is not valide.' );
			setSubscribeSpin( 'none' );
			return
		}
		// validation registration password
		if( !subscribePassword ){
			message.error( 'Type a password please.' );
			setSubscribeSpin( 'none' );
			return
		}
		if( isValidPassword( subscribePassword ) !== true ) {
			message.error( 'Password must have 6 to 100 characters, upper and lower case letters and at least one number.', [6] );
			setSubscribeSpin( 'none' );
			return
		}

		// Post
		// const base_api_url	= 'http://localhost/diamta/projects/public/index.php/api/'; 
		// const base_api_url		= 'https://diamta.com/projects/public/index.php/api/'
		// const base_api_url	= 'https://backend.workinvitation.com/api/'
		
		const signupApiURL 		= base_api_url + 'user/registration';
		const method = 'POST';
		const subscribeData = {
			password: 	subscribePassword,
			email: 		subscribeEmail
		};

		const userId = await postData( signupApiURL, subscribeData, method );
		if( !userId ){
			// setSubscribeSpin( 'none' );
			// message.error( 'User already exists' );
			// setSubscribeSpin( 'none' );
			alert( 'User already exists' );
			return
		}

		if( userEmail ){
			// const resp = await updateUserProjectStatus( userId, userEmail );

			// if( !resp ){
			//	alert( 'error' );
			//}
		}

		// goto validation
		// const validationPath	= '/login';
		
		// navigate( validationPath );
	}

registration( 'foo', 'bar');
import React, { useState, useEffect, useContext } from "react";


const Title = ( params ) => {
	const [ title, setTitle ] = useState( null );
	
// console.log( 'title >>>>>>>>>>>>>> ', title );
	useEffect(() => {
		const title = params.title !== "undefined" ? params.title : '';
		setTitle( title );
		
		document.title = title 
	}, [params]);
  
	return (
		<div className="stickTitle titleStyle">
			{ title }
		</div>
	);
};

export default Title;
 
			
			
			
			
			
			

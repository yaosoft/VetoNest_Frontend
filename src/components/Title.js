import React, { useState, useEffect, useContext } from "react";

const Title = ( params ) => {
	const [ title, setTitle ] = useState( '' );
	
	useEffect(() => {
		// Better handling of undefined or null title
		let newTitle = '';
		if (params.title && params.title !== "undefined" && params.title !== 'undefined') {
			newTitle = params.title;
		}
		setTitle( newTitle );
		document.title = newTitle || 'VetoNest';
	}, [params.title]); // Only depend on title, not the whole params object
	
	return (
		<div className="stickTitle titleStyle">
			{title}
		</div>
	);
};

export default Title;
			
			
			
			
			
			

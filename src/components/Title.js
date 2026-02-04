import React, { useState, useEffect, useContext } from "react";


const Title = ( params ) => {
	const title = params.title;
// console.log( 'title >>>>>>>>>>>>>> ', title );
	 useEffect(() => {
		document.title = title !== "undefined" ? title : '';
	  }, [title]);
  
	return (
		<div className="stickTitle titleStyle">
			{ title }
		</div>
	);
};

export default Title;
 
			
			
			
			
			
			

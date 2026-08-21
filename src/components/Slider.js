import React, { useState, useEffect, useContext } from "react";

import { Carousel } from "antd";

const contentStyle = {
  margin: 0,
  height: '160px',
  color: '#fff',
  lineHeight: '160px',
  textAlign: 'center',
  background: '#364d79',
};
const divStyle = ( myImage ) => ({
    backgroundImage: 		"url(" + myImage + ")",
    backgroundSize: 		"cover",
    backgroundPosition: 	"center",
    height: 				"290px", 
	borderRadius:			"25px",
	
});
const Slider = () => {
	
	return (
		<>
			<Carousel 
				arrows   		= { true }
				dots   			= { false }
				infinite 		= { false }
				autoplay		= {{ dotDuration: true }} 
				autoplaySpeed	= { 15000 }
				fade    		= { true }
				infinite		= { true }
				style			= {{  
					width: 			'100%', 
					paddingTop: 	'10px', 
				}}
			>
			  <div style={contentStyle}>
				<div style={ divStyle( '/img/slider/01.jpg' ) }  ></div>
			  </div>
			  <div style={contentStyle}>
				<div style={ divStyle( '/img/slider/03.jpg' ) }  ></div>
			  </div>
			  <div style={contentStyle}>
				<div style={ divStyle( '/img/slider/07.jpg' ) }  ></div>
			  </div>
			  <div style={contentStyle}>
				<div style={ divStyle( '/img/slider/09.jpg' ) }  ></div>
			  </div>
			</Carousel>
			
		</>
	);
};

export default Slider;

import React, { useState, useEffect, useContext } from "react";
// import { Modal } from 'react-responsive-modal';

import { Form, Input, Select } from 'antd';

const Title = ( params ) => {

	const title = params.title;
	
	return (
		<div className="row marginTopBottom10 back_re">
			<div className="col-md-12">
				<div className="title">
					<h2 className="textAlignCenter">{ title }</h2>
				</div>
			</div>
		</div>
	);
};

export default Title;
 
			
			
			
			
			
			

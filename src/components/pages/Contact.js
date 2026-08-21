import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useLocation  } from 'react-router-dom';
import { Space, Spin, Button, notification, message, Popconfirm, Radio, Flex, DatePicker, Upload } from 'antd';
import {
	RadiusBottomleftOutlined,
	RadiusBottomrightOutlined,
	RadiusUpleftOutlined,
	RadiusUprightOutlined,
	LoadingOutlined,
	InboxOutlined, 
	QuestionCircleOutlined
} from '@ant-design/icons';
import { Form, Input, Select } from 'antd';

import Header from '../Header';
import Footer from '../Footer';

import { SiteContext } from '../../context/site';

import Title from '../Title';

const Contacts = () => {
	const navigate = useNavigate();

	
	
	return (
		<>
			<Header />
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<Title title = { 'Blog' } />
			<div className="back_re">
      </div>

      <div className="contact">
         <div className="container">
            <div className="row">
               <div className="col-md-6">
					La page demandée n'a pas été trouvée.
               </div>
               
            </div>
         </div>
      </div>
			<Footer />
		</>
	);
};

export default Contacts;
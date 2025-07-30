import React, { useState, useEffect, useContext } from "react";
// import { Modal } from 'react-responsive-modal';

import { useNavigate, Link, useLocation  } from 'react-router-dom';
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import { Space, Modal, Spin, Button, notification, message, Popconfirm } from 'antd';
import { Form, Input, Select } from 'antd';
import {
	RadiusBottomleftOutlined,
	RadiusBottomrightOutlined,
	RadiusUpleftOutlined,
	RadiusUprightOutlined,
	LoadingOutlined
} from '@ant-design/icons';

import InputCode from "../InputCode";

import  "./inputCode.css";

import Header from '../Header';
import Footer from '../Footer';
// import ModalEmailValidate from '../ModalEmailValidate';

import LanguageSelector from '../LanguageSelector';
import Title from '../Title';

const Profile = ( params ) => {
	// context
	const { 
		logIn, 
		setUser, 
		getUser,
		isValidPassword 
	} = useContext( AuthContext );
	const { 
		siteName,
		siteEmail,
		siteUrl,
		siteDomain,
		siteDomainName,
		listLanguages,
		getProfile,
		updateLanguagePreference,
		defaultLanguageId,
		defaultLanguage,
		languageSetup
	} = useContext( SiteContext );

	const user = getUser();

	const [ languages, setLanguages ] = useState( [] );
	const [ selectedLanguageId, setSelectedLanguageId ] = useState( user ? user.languageId : defaultLanguageId ); 
	
	useEffect( () => {
		// get all language
		const getAllLanguage = async() => {
			const languages = await listLanguages();
			setLanguages( languages );
		}
		getAllLanguage();
		

	}, [user] );
	 
	 // form
	 const [form] = Form.useForm();
	 return (
		<>

		<Header />
			
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			
			<Title title = { 'Profile' } />
        
			<div className="login-form-bg h-100">
				<div className="container h-100">
					<div className="row justify-content-center h-100">
						<div className="col-xl-6">
							<div className="form-input-content">
								<p className='fontWeight'>Account type:</p>
								{ user.profileTypeId == 1 ?
								  <span>Propriétaire</span>
								  :
								  <span>Vétérinaire</span>
								}
							</div>
						</div>
					</div>
					<div className="row justify-content-center h-100">
						<div className="col-xl-6">
							<div className="form-input-content">
								<p className='fontWeight'>Preferences:</p>
								Select your language:<br/>
									<LanguageSelector 
										toPersist 	= { true } 
										flag 		= { false }
										context		= { false }
									/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div>&nbsp;</div>
			<Footer />
		</>
	);
};

export default Profile;

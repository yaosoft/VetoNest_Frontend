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
import Slider from '../Slider';
import Contact from '../Contact';

import { SiteContext } from '../../context/site';
import Title from '../Title';

const Home = () => {
	const navigate = useNavigate();
	const { 
		siteName,
		siteEmail,
		siteUrl,
		siteDomain,
		siteDomainName,
		defaultLanguageId,
		defaultLanguage,
		languageSetup,
		homeTitle,
		contactTitle
	} = useContext( SiteContext );
	
		
	
	// Spiner
	const [ loginSpin, setLoginSpin ] = useState( 'none' );

	const handleClickBtnSignUp = () => {
		navigate( '/inscription') 
	}
	
	useEffect( () => {
		// get all language
		languageSetup( defaultLanguageId );
	}, [] );

	
	const [form] = Form.useForm();
	return (
		<>
	<Header />
		<p>&nbsp;</p>
		<p>&nbsp;</p>
		<p>&nbsp;</p>
		<p>&nbsp;</p>
		
		<div 
			className= 'row backgroundYellow padding10 textAlignCenter myh2 justify-content-center'
			style={{
				paddingTop: '3px',
				paddingBottom: '3px',
				marginTop: '10px',
				fontSize: '24px',
				color: '#000',
				marginBottom: '10px',
				marginTop: '20px',
			}}
		>
			Bienvenue sur VetoNest.com
		</div>
		<div 
			className = 'row marginBottom20 justify-content-center' 
		>
			<div className='col-md-4'>
				<Slider />
			</div>
			<div 
						className='col-md-4'
						style={{
							marginTop: '10px',
						}}
					>
						<div
							style={{
								padding: '30px',
								height: '288px'
							}}
							className='backgroundOlive colorBlack borderRadius25'
						>
							<div
								className="smallTitleBlack"
							>
								Obtenez un rendez-vous
							</div>
							<p></p>
							<div className="smallTitleGreen textJustifyCenter">
								Trouvez un vétérinaire ou établissement veterinaire pour une consultation en ligne ou à domicile.
							</div>
							
							<p></p>
							<p></p>
							<p></p>
								<button 
									style={{ border: 'none', height: '45px' }}
									type="button" 
									className="btn btn-warning borderRadius18"
									onClick = { e => handleClickBtnSignUp( e ) }
								>
									&nbsp;&nbsp;
									<span 
										id=""
										style={{ fontSize: '13px' }}
									>
										Créer un compte gratuitement
									</span>
									&nbsp;<span><i className="fa fa-arrow-right"></i></span>
									&nbsp;&nbsp;
							   </button>
					   </div>
					</div>
					<div 
						className='col-md-4'
						style={{
							marginTop: '10px',
						}}
					>
						<div
							style={{
								padding: '30px',
								height: '288px'
							}}
							className='backgroundOlive colorBlack borderRadius25'
						>
							<div
								className="smallTitleBlack"
							>
								Espace vétérinaire
							</div>
							<p></p>
							<div className="smallTitleGreen textJustifyCenter">
								Organisez vos consultations et managez vos rendez-vous en toute sécurité sur notre plateforme.
							</div>							
							
							<p></p>
							<p></p>
							<p></p>
							<button 
								style={{ border: 'none', height: '45px' }}
								type="button" 
								className="btn btn-warning borderRadius18"
								onClick = { e => handleClickBtnSignUp( e ) }
							>
								&nbsp;&nbsp;
								<span 
									id=""
									style={{ fontSize: '13px' }}
								>
									Créer un compte gratuitement
								</span>
								&nbsp;<span><i className="fa fa-arrow-right"></i></span>
								&nbsp;&nbsp;
						   </button>
						</div>
					</div>
		</div>
	  <Title title = { homeTitle } />
	  <span className="homeTitle displayNone" >Des prise de rendez-vous en ligne rapide avec des vétérinaires de confiance</span>
	  
	  <div  className="blog">
         <div className="container">
            <div className="row">
               <div className="col-md-4">
                  <div className="blog_box">
                     <div 
						className="blog_room borderRadius25 backgroundOlive"
						
					 >
						<div className="marginBottom10" >
							<div className="smallTitleGreen marginBottom10">
								Des soins vétérinaires, facilement et rapidement
							</div>
							<div className="row">
								<div className="col-md-3">
									<i style={{ fontSize: "76px", color: "green" }} className="fa fa-calendar backgroundYellow padding10"></i>
								</div>
								<div className="col-md-9 textJustifyCenter paddingLeft20">
									Reservez des consultations vidéo ou en presentiel et revevez des rappels pour ne jamain les manquer.
								</div>
							</div>

							<div className="row justify-content-center marginTop20">
								<Link className="read_more" href="#" to="/blog"> Read More</Link>
							</div>
						</div>
                     </div>
                  </div>
               </div>
               <div className="col-md-4">
                  <div className="blog_box">
                     <div 
						className="blog_room borderRadius25 backgroundOlive"
						
					 >
						<div className="marginBottom10" >
							<div className="smallTitleGreen marginBottom10">
								Des spécialisations variées
							</div>
							<div className="row">
								<div className="col-md-3">
									<i style={{ fontSize: "76px", color: "gray" }} className="fa fa-search-minus backgroundYellow padding10"></i>
								</div>
								<div className="col-md-9 textJustifyCenter paddingLeft20">
									Trouvez rapidement et facilment des vétérinaires avec les critaires et les spécialisations dont vous avez besoin. 
								</div>
							</div>

							<div className="row justify-content-center marginTop20">
								<Link className="read_more" href="#" to="/blog"> Read More</Link>
							</div>
						</div>
                     </div>
                  </div>
               </div>
			   <div className="col-md-4">
                  <div className="blog_box">
                     <div 
						className="blog_room borderRadius25 backgroundOlive"
					 >
						<div className="marginBottom10" >
							<div className="smallTitleGreen marginBottom10">
								Evaluations et avis pour des vétérinaires de confiance
							</div>
							<div className="row">
								<div className="col-md-3">
									<i style={{ fontSize: "76px" }} className="fa fa-comments-o backgroundYellow padding10"></i>
								</div>
								<div className="col-md-9 textJustifyCenter paddingLeft20">
									 N'hésitez pas à laisser une évaluation ou un commentaire si vous avez été satisfait ou non d'une consultation.
								</div>
							</div>

							<div className="row justify-content-center marginTop20">
								<Link className="read_more" href="#" to="/blog"> Read More</Link>
							</div>
						</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
	<Title title = { contactTitle } />
	  <span className="contactTitle displayNone" >Contact us</span>
      <Contact/>

			<Footer />
		</>
	);
};

export default Home;

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
		contactTitle,
		blogTitle,
		getAContent
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
<div className="sticky-stack">
  <Header />
  <Title title={homeTitle} />
</div>
<div className="page-content" >		
			
			<div 
				className = 'row marginBottom30 justify-content-center marginLeftRight2percent ' 
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
								<i className='fa fa-paw marginTop10'></i>&nbsp;
								<span id="cmp_vetonest.com_BXJ8ERfKvZ">Obtenez un rendez-vous</span>
							</div>
							<p></p>
							<div className="smallBlack18px">
								<span id="cmp_vetonest.com_MKotGJOfeW">Trouvez un vétérinaire ou établissement veterinaire pour une consultation en ligne ou à domicile.</span>
							</div>
							
							<p></p>
							<p></p>
								<button 
									style={{ border: 'none', height: '45px', backgroundColor:'#ffde59' }}
									type="button" 
									className="btn btn-warning borderRadius18 width100per100"
									onClick = { e => handleClickBtnSignUp( e ) }
								>
									&nbsp;&nbsp;
									<span 
										id="cmp_vetonest.com_akGLBBj4Qy"
										style={{ fontSize: '20px', color:'blue' }}
									>
										Créer Votre Compte Gratuitement
									</span>
									&nbsp;&nbsp;<span><i className="fa fa-arrow-right"></i></span>
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
								<i className='fa fa-user-md'></i>&nbsp;
								<span id='cmp_vetonest.com_ID3p1AsYLZ'>Espace vétérinaire</span>
							</div>
							<p></p>
							<div className="smallBlack18px">
								<span id='cmp_vetonest.com_ykeRjJbUrW'>Organisez vos consultations et managez vos rendez-vous en toute sécurité sur notre plateforme.</span>
							</div>	
							<p></p>
							<p></p>
							<button 
								style={{ border: 'none', height: '45px', backgroundColor: '#ffde59' }} 
								className="btn btn-warning borderRadius18 width100per100"
								onClick = { e => handleClickBtnSignUp( e ) }
							>
								&nbsp;&nbsp;
								
								<span 
									id="cmp_vetonest.com_A2RSyIKqjD"
									style={{ fontSize: '20px', color:'blue' }}
								>
									Créer Votre Compte Gratuitement
								</span>
								&nbsp;&nbsp;<span><i className="fa fa-arrow-right"></i></span>
								&nbsp;&nbsp;
						   </button>
						</div>
					</div>
		</div>
	  
	  <span className="homeTitle displayNone" id='cmp_vetonest.com_4SWWu0qB7u'>Des prise de rendez-vous en ligne rapide avec des vétérinaires de confiance</span>
	  
	  <div  className="blog" style={{ backgroundImage: 'none' }}>
         <div className="container">
            <div className="row">
               <div className="col-md-4">
                  <div className="blog_box">
                     <div 
						className="blog_room borderRadius25 backgroundOlive"
					 >
						<div className="marginBottom10" >
							<div className="row">
								<div className="col-md-3">
									<i style={{ fontSize: "60px", color: "green" }} className="fa fa-calendar backgroundYellow padding10"></i>
								</div>
								<div className="col-md-9 paddingLeft20 smallBlack">
									<div className="marginBottom10">
										<span className="smallTitleGreen" id="cmp_vetonest.com_RBfWlnWwIx">Des soins vétérinaires, facilement et rapidement</span>
									</div>
									<span id="cmp_vetonest.com_vCRQSWdWmq" className="smallBlack14px">Reservez des consultations vidéo ou en presentiel et revevez des rappels pour ne jamain les manquer.</span>
								</div>
							</div>

							<div className="row justify-content-center marginTop20">
								<Link className="read_more" href="#" to="/blog" id="cmp_vetonest.com_LTFugXQBPX"> Read More</Link>
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
							<div className="row">
								<div className="col-md-3">
									<i style={{ fontSize: "60px", color: "#0a6e6d" }} className="fa fa-search-minus backgroundYellow padding10"></i>
								</div>
								<div className="col-md-9 paddingLeft20 smallBlack">
									<div className="marginBottom10">
										<span className="smallTitleGreen" id="cmp_vetonest.com_FDoCpodpkQ">
											Des spécialisations variées
										</span>
									</div>
									<span id="cmp_vetonest.com_PO9KcsJPJS" className="smallBlack14px">
										Trouvez rapidement et facilment des vétérinaires avec les critaires et les spécialisations dont vous avez besoin. 
									</span>
								</div>
							</div>

							<div className="row justify-content-center marginTop20">
								<Link className="read_more cmp_vetonest.com_LTFugXQBPX" href="#" to="/blog"> Read More</Link>
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
							<div className="row">
								<div className="col-md-3">
									<i style={{ fontSize: "60px" }} className="fa fa-comments-o backgroundYellow padding10"></i>
								</div>
								<div className="col-md-9 paddingLeft20 smallBlack">
									<div className="marginBottom10">
										<span className="smallTitleGreen" id="cmp_vetonest.com_mSKO4iSv3r">
											Evaluations et avis pour des vétérinaires de confiance
										</span>
									</div>
									 <span className="smallBlack14px" id="cmp_vetonest.com_DZLPDoMdV2">
										N'hésitez pas à laisser une évaluation ou un commentaire si vous avez été satisfait ou non d'une consultation.
									</span>
									 
								</div>
							</div>

							<div className="row justify-content-center marginTop20">
								<Link className="read_more cmp_vetonest.com_LTFugXQBPX" href="#" to="/blog"> Read More</Link>
							</div>
						</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
	{ blogTitle } 
	 <span className="blogTitle displayNone" >Blog</span>
	  <div  className="blog" style={{ padding: '0px 6% 0px 6%' }}>
         <div className="container">
			<div className="row">
               <div className="col-md-12">
                  <div className="titlepage">
					 <p>&nbsp;</p>
                     <h2 id='cmp_vetonest.com_8UmzWzhoWs'>Infos utiles</h2>
                     <p id='cmp_vetonest.com_va7NoAL6ih'>avant la consultation</p>
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-md-4">
                  <div className="blog_box">
                     <div className="blog_img">
                        <figure><img src="./img/blog/1.jpg" alt="#"/></figure>
                     </div>
                     <div className="blog_room">
                        <h3 id="cmp_vetonest.com_c2jJsvy1m8">Qu'est ce qu'un vétérinaire NAC</h3>
                        <p id="cmp_vetonest.com_qedCtwT5Oj" style={{ textAlign: "left" }}>Un vétérinaire NAC est un professionnel de la santé animale spécialisé dans les Nouveaux Animaux de Compagnie (NAC). </p>
						<br/>
						<p><Link className="read_more cmp_vetonest.com_LTFugXQBPX" href="#" to="/blog"> Read More</Link></p>
                     </div>
                  </div>
               </div>
               <div className="col-md-4">
                  <div className="blog_box">
                     <div className="blog_img">
                        <figure><img src="./img/blog/2.jpg" alt="#"/></figure>
                     </div>
                     <div className="blog_room">
                        <h3 id="cmp_vetonest.com_0B9rHyfFGb">Pourquoi choisir un veterinaire à domicile</h3>
                        <p id="cmp_vetonest.com_y2lifRBysc" style={{ textAlign: "left" }}>Le vétérinaire à domicile peut être le vétérinaire traitant habituel de votre chien ou chat, et peut parfois même assurer les urgences. </p>
						
						<p><Link className="read_more cmp_vetonest.com_LTFugXQBPX" href="#" to="/import-export"> Read More</Link></p>
                     </div>
                  </div>
               </div>
               <div className="col-md-4">
                  <div className="blog_box">
                     <div className="blog_img">
                        <figure><img src="./img/blog/3.jpg" alt="#"/></figure>
                     </div>
                     <div className="blog_room">
                        <h3 id="cmp_vetonest.com_9dPtYUzVDa">Motifs de consultation</h3>
                        <p style={{ textAlign: "left" }} id="cmp_vetonest.com_VxdOZQo0dk">
						Il est important de consulter un vétérinaire si vous observez des changements dans le comportement, l'appétit, ou l'état de santé général de votre animal. </p>
						<br/>
						<p><Link className="read_more cmp_vetonest.com_LTFugXQBPX" href="#" to="/import-export"> Read More</Link></p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
	<br/>
	 { contactTitle } 
	  <span className="contactTitle displayNone" id="cmp_vetonest.com_SOJVt74LSV" >Contact us</span>
      <Contact/>
</div>
			<Footer />
		</>
	);
};

export default Home;

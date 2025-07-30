import React, { useState, useEffect, useContext } from "react";

import { SiteContext } from '../context/site';
import { Form, Select, Input } from 'antd';
import { message } from 'antd';

const SearchBox = () => {
	const [form] = Form.useForm();
	
	const { 
		siteDomainName,
		siteContent,
		siteLanguage,
		setSiteContent,
		getSiteContent,
		searchInputVeto,
		searchInputVetoType,
		searchInputLocation,
	} = useContext( SiteContext );
	

	// veto / etablissement
	const [ vetoError, setVetoError ] = useState( '' );
	const [ veto, setVeto ] = useState( '' );
	const handleChangeVeto = ( e ) => {
		const data = e.target.value;
		console.log( data )
	}
	
	// veto / etablissement type
	const [ vetoTypeError, setVetoTypeError ] = useState( '' );
	const [ vetoType, setVetoType ] 		  = useState( '' );
	const handleChangeVetoType = ( e ) => {
		const data = e.target.value;
		console.log( data )
	}

	// location / etablissement type
	const [ locationError, setLocationError ] 	= useState( '' );
	const [ location, setLocationType ] 		= useState( '' );
	const handleChangeLocation = ( e ) => {
		const data = e.target.value;
		console.log( data )
	}	
	
	// const [ searchInputVeto, setSearchInputVeto ] = useState( '' );

	useEffect( () => {

	}, [] );
	
	return (
		<>
		<Form 
			className=""
			form = {form}
		>
			<div className="search_box row" >
			   <div className="col-11" >
				   <div className="search" style={{ backgroundColor: '#FFDE59' }}>
					 <div className= "select_area" style={{ width:"30%" }}>
					   <i className="fa fa-map-marker-alt map_icon"></i>
					   <i className="fa fa-search search_icon" style={{ fontSize: '2em', color: '#000' }}></i>
					   <div className="text">
							<Form.Item
													name  = "veto"
													rules = {[
														{
															message: vetoError,
															validator: ( value ) => {
																if ( vetoError ) {
																	return Promise.reject( vetoError );
																} 
																else {
																	return Promise.resolve();
																}
															}
														}
													]}
												>

													<Input 
														id="vetoInput"
														className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
														placeholder={ searchInputVeto }
														type="text" 
														name="signInMail"
														value={ veto }
														onChange = { e => handleChangeVeto(e)}
														
													/>
							</Form.Item>
							
							
												<span 
													id="cmp_vetonest.com_6MUu5pTZNM"
													className="searchInputVeto displayNone"
												>
													Nom ou établissement vétérinaire
												</span>
					   </div>
					 </div>
					 <div className="line"></div>
					 <div className= "select_area" style={{ width:"30%" }}>
					   <i className="fa fa-map-marker-alt map_icon"></i>
					   &nbsp;&nbsp;<i className="fa fa-map-signs" style={{ fontSize: '2em', color: '#000' }}></i>
					   <div className="text">
					   <Form.Item
													name  = "vetoType"
													rules = {[
														{
															message: vetoTypeError,
															validator: ( value ) => {
																if ( vetoTypeError ) {
																	return Promise.reject( vetoTypeError );
																} 
																else {
																	return Promise.resolve();
																}
															}
														}
													]}
												>

													<Input 
														id="vetoTypeInput"
														className="backgroundYellow  borderRadius18 borderNone height40" 
														placeholder={ searchInputVetoType }
														type="text" 
														name="signInMail"
														value={ vetoType }
														onChange = { e => handleChangeVetoType(e)}
														
													/>
							</Form.Item>
							
							
												<span 
													id="cmp_vetonest.com_8MTgkmDbBM"
													className="searchInputVetoType displayNone"
												>
													Spécialité ou Type d'établissement
												</span>
					   </div>
					 </div>
					 <div className="line"></div>
					 <div className= "select_area" style={{ width:"20%" }}>
					   <i className="fa fa-map-marker-alt map_icon"></i>
					   &nbsp;&nbsp;<i className="fa fa-map-marker" style={{ fontSize: '2.3em', color: '#000' }}></i>
					   <div className="text">
					   <Form.Item
													name  = "location"
													rules = {[
														{
															message: locationError,
															validator: ( value ) => {
																if ( locationError ) {
																	return Promise.reject( locationError );
																} 
																else {
																	return Promise.resolve();
																}
															}
														}
													]}
												>

													<Input 
														id="locationInput"
														className="backgroundYellow  borderRadius18 borderNone height40" 
														placeholder={ searchInputLocation }
														type="text" 
														name="signInMail"
														value={ location }
														onChange = { e => handleChangeLocation(e)}
														
													/>
							</Form.Item>
							
							
												<span 
													id="cmp_vetonest.com_a5m4GtOdzA"
													className="searchInputLocation displayNone"
												>
													Lieu
												</span>
					   </div>
					 </div>
					</div> 
				</div> 
				<div className="col-1 backgroundOlive borderRightRadius25 searchButtonDiv searchButtonDivsearchButtonDiv"
					style={{ marginLeft: '-2%' }}
				> 
					<span 
						id="cmp_vetonest.com_ukiF7lBsd1"
						style={{ fontSize: '13px' }}
					>
						Recherche
					</span>
					&nbsp;<span><i className="fa fa-arrow-right"></i></span>
				</div> 
			</div> 
		</Form>
		</>
	);
};
export default SearchBox;
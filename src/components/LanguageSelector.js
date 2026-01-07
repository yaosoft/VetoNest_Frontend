import React, { useState, useEffect, useContext } from "react";

import { useNavigate, Link, useLocation  } from 'react-router-dom';
import { AuthContext } from "../context/AuthProvider";
import { SiteContext } from "../context/site";

import { Form, Select } from 'antd';
import { message } from 'antd';

const LanguageSelector = ( params ) => {
	// context
	const { 
		getUser,
		setUser,
	} = useContext( AuthContext );
	const { 
		languageList,
		getProfile,
		updateLanguagePreference,
		defaultLanguageId,
		defaultLanguage,
		languageSetup,
		languageFlag,
		selectedLanguageId, 
		setSelectedLanguageId,
		language_french,
		language_english,
		language_spanish,
		language_german,
		language_italian,
		language_estonian,
		getAContent
	} = useContext( SiteContext );

	// params
	var user 			= getUser();
	const toPersist 	= params.toPersist;
	const flag 			= params.flag;
	const context 		= params.context;
// 
	const [ selected, setSelected ] = useState( defaultLanguageId ); 

// alert( user.languageId );

	const handleChangeLanguages = async ( languageId ) => {
		
		if( user === null ){
console.log(languageId);		
			await setSelectedLanguageId( languageId );
			await languageSetup( languageId );

			return
		}

		const languagePreferenceData = {
			userId: 	user.userId,
			languageId: languageId
		}

		if( toPersist === true ){ // persist the laanguage preference
			const rep = await updateLanguagePreference( languagePreferenceData )
			if( rep !== true ){
				message.success( getAContent( 'cmp_vetonest.com_La48Qm72Rp' ) );
			}
			else{
				message.error( "cmp_vetonest.com_La48Qm72Rp" );
			}
		}
		

		await setSelectedLanguageId( languageId ); // update the listbox via context
		// await setSelected( languageId ) 			 // update the listbox
		
		await languageSetup( languageId ); // Update flag and user locale

	}
	
	const [ languages, setLanguages ] = useState( [] );
	const BuildLanguagesList = () => {
		return (
			<Select
			  onChange={(e) => handleChangeLanguages(e)}
			  value={context ? selectedLanguageId : selected}
			  getPopupContainer={(triggerNode) => triggerNode.parentElement}
			  placement="bottomRight"
			>
				{ languages.map( ( option ) => (
					<Select.Option 
						key		= { option.id } 
						value	= { option.id }
					>
						{ eval( option.tagClass ) }
					</Select.Option>
				))}
			</Select>
		)
	}

	useEffect( () => {
		// get all language
		const getAllLanguage = async() => {
			const languages = await languageList();
			setLanguages( languages );
		}
		getAllLanguage();

 
		if( user === null )
			setSelected( defaultLanguageId )
		else
			setSelected( user.languageId ? user.languageId : defaultLanguageId )

	}, [user] );
	 
	return (
		<div className="languageSelector">
			{ flag === true &&
				<img src= { languageFlag } className='flag'/> 
			}
			<BuildLanguagesList/>
		</div>
	);
};

export default LanguageSelector;

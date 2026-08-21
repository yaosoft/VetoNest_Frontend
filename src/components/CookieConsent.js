import React, { useState, useEffect, useContext } from "react";
import { Button, Modal, Switch, Checkbox, Space, Divider } from "antd";
import { SiteContext } from "../context/site";

const CookieConsent = () => {
	const { getAContent } = useContext(SiteContext);
	
	const [visible, setVisible] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const [preferences, setPreferences] = useState({
		necessary: true, // Always true, cannot be disabled
		functional: false,
		analytics: false,
		marketing: false
	});

	// Check if user has already given consent
	useEffect(() => {
		const consentGiven = localStorage.getItem('cookieConsent');
		const consentPreferences = localStorage.getItem('cookiePreferences');
		
		if (!consentGiven) {
			// Show banner after a short delay
			setTimeout(() => setVisible(true), 1000);
		} else if (consentPreferences) {
			try {
				const savedPrefs = JSON.parse(consentPreferences);
				setPreferences(savedPrefs);
				applyCookiePreferences(savedPrefs);
			} catch (e) {
				console.error('Error parsing cookie preferences:', e);
			}
		}
	}, []);

	// Apply cookie preferences based on user choices
	const applyCookiePreferences = (prefs) => {
		// Google Analytics (example)
		if (prefs.analytics && !window.ga) {
			// Load Google Analytics script
			const script = document.createElement('script');
			script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
			script.async = true;
			document.head.appendChild(script);
			
			window.dataLayer = window.dataLayer || [];
			window.gtag = function() { window.dataLayer.push(arguments); };
			window.gtag('js', new Date());
			window.gtag('config', 'GA_MEASUREMENT_ID');
		}
		
		// Store preferences in localStorage for other scripts to read
		localStorage.setItem('cookiePreferences', JSON.stringify(prefs));
	};

	const handleAcceptAll = () => {
		const allAccepted = {
			necessary: true,
			functional: true,
			analytics: true,
			marketing: true
		};
		setPreferences(allAccepted);
		applyCookiePreferences(allAccepted);
		localStorage.setItem('cookieConsent', 'true');
		localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
		setVisible(false);
	};

	const handleAcceptSelected = () => {
		applyCookiePreferences(preferences);
		localStorage.setItem('cookieConsent', 'true');
		localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
		setVisible(false);
	};

	const handleRejectAll = () => {
		const allRejected = {
			necessary: true,
			functional: false,
			analytics: false,
			marketing: false
		};
		setPreferences(allRejected);
		applyCookiePreferences(allRejected);
		localStorage.setItem('cookieConsent', 'true');
		localStorage.setItem('cookiePreferences', JSON.stringify(allRejected));
		setVisible(false);
	};

	const handlePreferenceChange = (key, value) => {
		setPreferences(prev => ({ ...prev, [key]: value }));
	};

	if (!visible) return null;

	return (
		<div style={{
			position: 'fixed',
			bottom: 0,
			left: 0,
			right: 0,
			zIndex: 9999,
			backgroundColor: 'rgba(0, 0, 0, 0.8)',
			padding: '20px',
			backdropFilter: 'blur(5px)'
		}}>
			<div style={{
				maxWidth: '1200px',
				margin: '0 auto',
				backgroundColor: '#fff',
				borderRadius: '16px',
				boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
				overflow: 'hidden'
			}}>
				{!showDetails ? (
					// Simple banner view
					<div style={{ padding: '24px' }}>
						<div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
							<div style={{ flex: 1 }}>
								<h3 style={{ marginBottom: '8px', color: '#333' }}>
									🍪 {getAContent('cmp_vetonest.com_Cookie_Title', 'Nous respectons votre vie privée')}
								</h3>
								<p style={{ margin: 0, color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
									{getAContent('cmp_vetonest.com_Cookie_Message', 
										'Nous utilisons des cookies pour améliorer votre expérience, personnaliser le contenu et analyser notre trafic. '
									)}
									<Button 
										type="link" 
										style={{ padding: 0, height: 'auto', color: '#FFDE59' }}
										onClick={() => setShowDetails(true)}
									>
										{getAContent('cmp_vetonest.com_Cookie_Personalize', 'Personnaliser')}
									</Button>
								</p>
							</div>
							<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
								<Button 
									onClick={handleRejectAll}
									style={{ borderColor: '#ddd', color: '#666' }}
								>
									{getAContent('cmp_vetonest.com_Cookie_Reject', 'Rejeter')}
								</Button>
								<Button 
									onClick={handleAcceptSelected}
									style={{ borderColor: '#FFDE59', color: '#333' }}
								>
									{getAContent('cmp_vetonest.com_Cookie_AcceptSelected', 'Accepter la sélection')}
								</Button>
								<Button 
									type="primary"
									onClick={handleAcceptAll}
									style={{ backgroundColor: '#FFDE59', borderColor: '#FFDE59', color: '#333', fontWeight: 600 }}
								>
									{getAContent('cmp_vetonest.com_Cookie_AcceptAll', 'Tout accepter')}
								</Button>
							</div>
						</div>
					</div>
				) : (
					// Detailed preferences view
					<div style={{ padding: '24px' }}>
						<h3 style={{ marginBottom: '16px', color: '#333' }}>
							🍪 {getAContent('cmp_vetonest.com_Cookie_Preferences_Title', 'Préférences des cookies')}
						</h3>
						<p style={{ marginBottom: '24px', color: '#666', fontSize: '14px' }}>
							{getAContent('cmp_vetonest.com_Cookie_Preferences_Message', 
								'Vous pouvez choisir quels types de cookies vous souhaitez accepter. Les cookies nécessaires sont toujours activés car ils assurent le bon fonctionnement du site.'
							)}
						</p>
						
						{/* Necessary Cookies - Always required */}
						<div style={{ 
							marginBottom: '16px', 
							padding: '12px',
							backgroundColor: '#f9f9f9',
							borderRadius: '8px',
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							flexWrap: 'wrap',
							gap: '12px'
						}}>
							<div>
								<strong style={{ color: '#333' }}>
									{getAContent('cmp_vetonest.com_Cookie_Necessary', 'Cookies nécessaires')}
								</strong>
								<p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>
									{getAContent('cmp_vetonest.com_Cookie_Necessary_Desc', 'Essentiels pour la navigation et les fonctionnalités de base')}
								</p>
							</div>
							<Switch checked={true} disabled />
						</div>
						
						{/* Functional Cookies */}
						<div style={{ 
							marginBottom: '16px', 
							padding: '12px',
							backgroundColor: '#f9f9f9',
							borderRadius: '8px',
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							flexWrap: 'wrap',
							gap: '12px'
						}}>
							<div>
								<strong style={{ color: '#333' }}>
									{getAContent('cmp_vetonest.com_Cookie_Functional', 'Cookies fonctionnels')}
								</strong>
								<p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>
									{getAContent('cmp_vetonest.com_Cookie_Functional_Desc', 'Améliorent l\'expérience (préférences de langue, etc.)')}
								</p>
							</div>
							<Switch 
								checked={preferences.functional}
								onChange={(checked) => handlePreferenceChange('functional', checked)}
							/>
						</div>
						
						{/* Analytics Cookies */}
						<div style={{ 
							marginBottom: '16px', 
							padding: '12px',
							backgroundColor: '#f9f9f9',
							borderRadius: '8px',
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							flexWrap: 'wrap',
							gap: '12px'
						}}>
							<div>
								<strong style={{ color: '#333' }}>
									{getAContent('cmp_vetonest.com_Cookie_Analytics', 'Cookies analytiques')}
								</strong>
								<p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>
									{getAContent('cmp_vetonest.com_Cookie_Analytics_Desc', 'Nous aident à améliorer le site (Google Analytics, etc.)')}
								</p>
							</div>
							<Switch 
								checked={preferences.analytics}
								onChange={(checked) => handlePreferenceChange('analytics', checked)}
							/>
						</div>
						
						{/* Marketing Cookies */}
						<div style={{ 
							marginBottom: '24px', 
							padding: '12px',
							backgroundColor: '#f9f9f9',
							borderRadius: '8px',
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							flexWrap: 'wrap',
							gap: '12px'
						}}>
							<div>
								<strong style={{ color: '#333' }}>
									{getAContent('cmp_vetonest.com_Cookie_Marketing', 'Cookies marketing')}
								</strong>
								<p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>
									{getAContent('cmp_vetonest.com_Cookie_Marketing_Desc', 'Utilisés pour le ciblage publicitaire')}
								</p>
							</div>
							<Switch 
								checked={preferences.marketing}
								onChange={(checked) => handlePreferenceChange('marketing', checked)}
							/>
						</div>
						
						<Divider />
						
						<div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
							<Button onClick={() => setShowDetails(false)}>
								{getAContent('cmp_vetonest.com_Cookie_Back', 'Retour')}
							</Button>
							<div style={{ display: 'flex', gap: '12px' }}>
								<Button onClick={handleRejectAll}>
									{getAContent('cmp_vetonest.com_Cookie_RejectAll', 'Tout refuser')}
								</Button>
								<Button 
									type="primary"
									onClick={handleAcceptSelected}
									style={{ backgroundColor: '#FFDE59', borderColor: '#FFDE59', color: '#333', fontWeight: 600 }}
								>
									{getAContent('cmp_vetonest.com_Cookie_SavePreferences', 'Enregistrer mes préférences')}
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default CookieConsent;
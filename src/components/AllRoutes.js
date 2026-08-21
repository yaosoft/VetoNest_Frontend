import React, { useState, useEffect } from "react";

import Home from './pages/Home';
import About from './pages/About';
import ImportExport from './pages/ImportExport';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import PasswordForgot from './pages/PasswordForgot';
import PasswordForgotReset from './pages/PasswordForgotReset';
import Etablissement from './pages/Etablissement';
import VetProfile from './pages/VetProfile';
import VetListing from './pages/VetListing';
import Usage from './pages/Usage';
import Consultation from './pages/Consultation';
import ConsultationListPetOwner from './pages/ConsultationListPetOwner';
import ConsultationListVet from './pages/ConsultationListVet';
import MyPets from './pages/MyPets';
import VetInvitationSignup from './pages/VetInvitationSignup';
// New imports
import LegalNotices from './pages/LegalNotices';
import Disclaimer from './pages/Disclaimer';
import TermsOfUse from './pages/TermsOfUse';
import CookiePolicy from './pages/CookiePolicy';
import AdminVetManagement from './admin/AdminVetManagement';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminRouteGuard from './admin/AdminRouteGuard';
import VetEarnings from './pages/VetEarnings'
import ConsultationRules from './pages/ConsultationRules';

const AllRoutes = {

	routes: [
		{	// Home
			element:  <Home />,
			path: '',
		},
		{	// Home
			element:  <Home />,
			path: 'accueil',
		},
		{	// About
			element:  <About />,
			path: 'about',
		},
		{	// ImportExport
			element:  <ImportExport />,
			path: 'import-export',
		},
		{	// Blog
			element:  <Blog />,
			path: 'blog',
		},
		{	// Contact
			element:  <Contact />,
			path: 'contact',
		},
		{	// Signup
			element:  <SignUp />,
			path: '/inscription',
		},
		{	// Sign in
			element:  <SignIn />,
			path: '/connexion',
		},
		{	// Invited vet: create account (landing page from invitation link)
			element:  <VetInvitationSignup />,
			path: '/inscription-veterinaire',
		},
		{	// Profile
			element:  <Profile />,
			path: '/profile',
		},
		{	// password forgot
			element:  <PasswordForgot />,
			path: '/mot-de-passe-oublie',
		},
		{	// password forgot | reset
			element:  <PasswordForgotReset />,
			path: '/mot-de-passe-oublie/reset/:code/:userId',
		},
		{	// etablissement
			element:  <Etablissement />,
			path: '/etablissement',
		},
		{	// vet profile page
			element:  <VetProfile />,
			path: '/vet-profile',
		},
		{	// vet listing page
			element:  <VetListing />,
			path: '/vet-listing',
		},
		{	// vet listing page
			element:  <VetListing />,
			path: '/clinic-listing',
		},
		{	// usage
			element:  <Usage />,
			path: '/vet-usage',
		},		
		{	// consultation
			element:  <Consultation />,
			path: '/consultation',
		},
		{	// consultation / creation
			element:  <Consultation />,
			path: '/consultation/creation',
		},
		{	// consultation / list
			element:  <ConsultationListPetOwner />,
			path: '/consultation/list',
		},
		{	// consultation / list
			element:  <ConsultationListVet />,
			path: '/consultation/vet/list',
		},
		{	// my pets
			element:  <MyPets />,
			path: '/my-pets',
		},
		// New legal routes
		{	// Mentions légales
			element: <LegalNotices />,
			path: '/mentions-legales',
		},
		{	// Disclaimer médical
			element: <Disclaimer />,
			path: '/disclaimer',
		},
		{	// Conditions générales d'utilisation
			element: <TermsOfUse />,
			path: '/conditions-utilisation',
		},
		{	// Cookie Policy
			element: <CookiePolicy />,
			path: '/coolie-policy',
		},
		{
		  path: "/consultation/rules",
		  element: <ConsultationRules />,
		},
		{	// Admin
			element: <AdminVetManagement />,
			path: '/admin/vets',
		},		
		{	// Not found page
			element: <NotFound 
				params={{ 
					path:	'/*',
				}}
			/>,
			path: '/*',
		},
		// Admin routes (protected)
		{
		  path: '/admin/login',
		  element: <AdminLogin />
		},
		{
		  path: "/consultation/vet/earnings",
		  element: <VetEarnings />
		},
		{
		  path: '/admin/dashboard',
		  element: (
			<AdminRouteGuard>
			  <AdminDashboard />
			</AdminRouteGuard>
		  )
		},
		{
		  path: '/admin/vets',
		  element: (
			<AdminRouteGuard>
			  <AdminVetManagement />
			</AdminRouteGuard>
		  )
		}
	],
	
}

export default AllRoutes;
import React, { useState, useEffect } from "react";

import Home from './pages/Home';
import About from './pages/About';
import ImportExport from './pages/ImportExport';
import Expertise from './pages/Expertise';
import Contact from './pages/Contact';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import PasswordForgot from './pages/PasswordForgot';
import PasswordForgotReset from './pages/PasswordForgotReset';

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
		{	// Expertise
			element:  <Expertise />,
			path: 'expertise',
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
		{	// Not found page
			element: <NotFound 
				params={{ 
					path:	'/*',
				}}
			/>,
			path: '/*',
		},
	],
}

export default AllRoutes;

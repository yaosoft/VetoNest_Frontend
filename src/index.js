// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from "./reportWebVitals";
import { AuthProvider } from "./context/AuthProvider";
import { SiteProvider } from "./context/site";
import { LanguagesProvider } from "./context/languages";

import Loader from './components/Loader';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
	<React.StrictMode>
		<AuthProvider>
			<SiteProvider>
					<div>
						<App />
					</div>
			</SiteProvider>
		</AuthProvider>
	</React.StrictMode>
);


reportWebVitals();
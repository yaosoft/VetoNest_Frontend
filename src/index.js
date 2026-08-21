// index.js
import './process-shim'; // must be first
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from "./reportWebVitals";
import { AuthProvider } from "./context/AuthProvider";
import { SiteProvider } from "./context/site";
import { ConsultationRulesProvider } from "./context/ConsultationRulesContext";
import { LanguagesProvider } from "./context/languages";
import { SocketProvider } from './context/SocketProvider';
import Loader from './components/Loader';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
	<React.StrictMode>
		<AuthProvider>
			<SiteProvider>
				<ConsultationRulesProvider>
					<SocketProvider>
						<div>
							<App />
						</div>
					</SocketProvider>
				</ConsultationRulesProvider>
			</SiteProvider>
		</AuthProvider>
	</React.StrictMode>
);


reportWebVitals();
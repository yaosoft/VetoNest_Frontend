import React from "react";
import AllRoutes from "./components/AllRoutes";


import {
	RouterProvider,
	createBrowserRouter,
	Routes,
	Route,
} from "react-router-dom";

const allRoutes = AllRoutes.routes;
const router 	= createBrowserRouter( allRoutes );

function App() {
	return (
		<>
				<div className='App'>
					<RouterProvider router={router} />
				</div>
		</>
	)
}
  
export default App;
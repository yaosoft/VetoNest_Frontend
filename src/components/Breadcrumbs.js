import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useLocation  } from 'react-router-dom';



const Breadcrumbs = ( params ) => {
// console.log( params );
	return (
		<>
		 <div class="row page-titles mx-0">
                <div class="col p-md-0">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="javascript:void(0)">Apps</a></li>
                        <li class="breadcrumb-item active"><a href="javascript:void(0)">Email</a></li>
                    </ol>
                </div>
            </div>
		</>
	);
};

export default Breadcrumbs;

import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useLocation  } from 'react-router-dom';

import Header from '../Header';
import Footer from '../Footer';

const About = () => {
	const navigate = useNavigate();
	
	return (
		<>
			<Header />
			<p>&nbsp;</p>
			<p>&nbsp;</p>
		<div>	
				<div className="back_re">
         <div className="container">
            <div className="row">
               <div className="col-md-12">
                  <div className="title">
                     <h2>About Us</h2>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="about">
         <div className="container-fluid">
            <div className="row">
               <div className="col-md-5">
                  <div className="titlepage">
                    
                     <p className="margin_0" style={{ textAlign: 'justify' }}>CECILIA GROUP LLC simplifies the supply chain for companies of all sizes with an extensive database of factories worldwide and a solid understanding of the international trade sector and its various stakeholders.
Specializing in international trade management, we offer you the opportunity to outsource your import-export activities to experienced professionals.
<p>&nbsp;</p>
Outsourcing your import-export activities involves delegating the tasks of importing and exporting goods to us. This includes managing international trade processes, customs formalities, and regulatory compliance.
<p>&nbsp;</p>
Operate with us will reduce costs, improves efficiency, and allows companies to focus on their core business and sales. This also saves on labor costs, training expenses, and overhead associated with managing import-export operations. Outsourcing also allows companies to focus on their core business rather than complex import-export activities.
<p>&nbsp;</p>
Our goal is to streamline your import-export processes, reduce lead times, and improve your overall efficiency.  We adapt to market changes and our clients' requirements. Companies benefit from access to specialized knowledge and expertise in international trade, customs, and logistics.
<br/>
We are a supplier specialized of items such as:
- Biomedical Equipment<br/>
- Pharmaceuticals<br/>
- Construction Equipment<br/>
- Electronics<br/>
- Apparel<br/>
- Clothes
<p>&nbsp;</p>
CECILIA GROUP LLC is a Washington DC limited liability company registered on September 16, 2022.
Contact us today to learn more about our services. Trust our commitment to excellence.</p>
                     <Link to="/Contact" style={{ cursor: 'pointer' }} className="read_more"> Contact Us</Link>
                  </div>
               </div>
               <div className="col-md-7">
                  <div className="about_img" style={{ marginTop: '20px' }}>
                     <figure><img src="./img/about.png" alt="#"/></figure>
                  </div>
               </div>
            </div>
         </div>
      </div>
	</div>

			<Footer />
		</>
	);
};

export default About;
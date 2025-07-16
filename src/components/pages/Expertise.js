import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useLocation  } from 'react-router-dom';

import Header from '../Header';
import Footer from '../Footer';

const Expertise = () => {
	const navigate = useNavigate();
	
	return (
		<>
			<Header />
			<p>&nbsp;</p>
			<p>&nbsp;</p>
<div className="back_re">
         <div className="container">
            <div className="row">
               <div className="col-md-12">
                  <div className="title">
                      <h2>Expertise</h2>
                  </div>
               </div>
            </div>
         </div>
      </div>
      <div  className="blog">
         <div className="container">
            <div className="row">
               <div className="col-md-12">
                  <div className="titlepage">
                     <p style={{ textAlign: 'justify' }}>Celia Group navigates the complexities of international trade by providing assistance in areas such as compliance, logistics, and market research. We help them optimize their import/export operations and comply with regulations.
<br/><br/>
Our expertise covers assisting companies with import/export regulations, including customs procedures, documentation, and tariff optimization.
We help optimize international supply chains, including freight forwarding, customs clearance, and warehousing.
We provide information on target markets, identify potential opportunities, and assess market viability.
<br/><br/>
Companies can collaborate with us throughout the customs clearance process, ensuring proper documentation and regulatory compliance.
As consultants, we help define the correct Harmonized System (HS) codes for products. These codes are important for customs duty calculations and compliance. We advise on Incoterms (International Trade Terms), which define the responsibilities and risks associated with international trade. </p>
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-md-4">
                  <div className="blog_box">
                     <div className="blog_img">
                        <figure><img src="./img/blog1.jpg" alt="#"/></figure>
                     </div>
                     <div className="blog_room">
                        <h3>Wholesale Trading</h3>
                        <p style={{textAlign: 'justify'}}>Sourcing products from around the world through our extensive network of manufacturers is our mission. We connect manufacturers with businesses that sell products to consumers. </p>
						<p>&nbsp;</p>
						<p><Link className="read_more" to="/contact"> Contact Us</Link></p>
                     </div>
                  </div>
               </div>
               <div className="col-md-4">
                  <div className="blog_box">
                     <div className="blog_img">
                        <figure><img src="./img/blog2.jpg" alt="#"/></figure>
                     </div>
                     <div className="blog_room">
                        <h3>Supply Chain Logistics</h3>
                        <p>We plan, implement and control the transportation and storage of your products. We manage the entire supply chain, from origin to consumption, based on your needs. </p>
						<p>&nbsp;</p>
						<p><Link className="read_more" to="/contact"> Contact Us</Link></p>
                     </div>
                  </div>
               </div>
               <div className="col-md-4">
                  <div className="blog_box">
                     <div className="blog_img">
                        <figure><img src="./img/blog3.jpg" alt="#"/></figure>
                     </div>
                     <div className="blog_room">
                        <h3>Consulting</h3>
                        <p>We help companies navigate the complexities of international trade by providing assistance in areas such as compliance, logistics, and market research.  </p>
						<p>&nbsp;</p>
						<p><Link className="read_more" to="/contact"> Contact Us</Link></p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
			<Footer />
		</>
	)
}

export default Expertise;
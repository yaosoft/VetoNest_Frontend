import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useLocation  } from 'react-router-dom';

import Header from '../Header';
import Footer from '../Footer';

const ImportExport = () => {
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
                     <h2>Import - Export</h2>
                  </div>
               </div>
            </div>
         </div>
      </div>
     
      <div  className="our_room">
         <div className="container">
            <div className="row">
               <div className="col-md-12">
                  <div className="titlepage">
                     <p  className="margin_0">We purchase various types of goods from different manufacturers to anticipate demand. </p>
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-md-4 col-sm-6">
                  <div id="serv_hover"  className="room">
                     <div className="room_img">
                        <figure><img src="./img/room1.jpg" alt="#"/></figure>
                     </div>
                     <div className="bed_room">
                        <h3>Bay windows</h3>
                     </div>
                  </div>
               </div>
               <div className="col-md-4 col-sm-6">
                  <div id="serv_hover"  className="room">
                     <div className="room_img">
                        <figure><img src="./img/room2.jpg" alt="#"/></figure>
                     </div>
                     <div className="bed_room">
                        <h3>Ceramic tiles</h3>
                     </div>
                  </div>
               </div>
               <div className="col-md-4 col-sm-6">
                  <div id="serv_hover"  className="room">
                     <div className="room_img">
                        <figure><img src="./img/room3.jpg" alt="#"/></figure>
                     </div>
                     <div className="bed_room">
                        <h3> Epoxy Paint</h3>
                     </div>
                  </div>
               </div>
               <div className="col-md-4 col-sm-6">
                  <div id="serv_hover"  className="room">
                     <div className="room_img">
                        <figure><img src="./img/room4.jpg" alt="#"/></figure>
                     </div>
                     <div className="bed_room">
                        <h3>Dental chair</h3>
                     </div>
                  </div>
               </div>
               <div className="col-md-4 col-sm-6">
                  <div id="serv_hover"  className="room">
                     <div className="room_img">
                        <figure><img src="./img/room5.jpg" alt="#"/></figure>
                     </div>
                     <div className="bed_room">
                        <h3>Biomedical equipment</h3>
                     </div>
                  </div>
               </div>
               <div className="col-md-4 col-sm-6">
                  <div id="serv_hover"  className="room">
                     <div className="room_img">
                        <figure><img src="./img/room6.jpg" alt="#"/></figure>
                     </div>
                     <div className="bed_room">
                        <h3>Workwear & Clothing</h3>
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

export default ImportExport;

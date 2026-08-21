import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useLocation  } from 'react-router-dom';
import SecuredPagesAuth from "./SecuredPagesAuth";
const Header = ( params ) => {

	return (
		<>
		<div class="row">
                            <div class="col-12">
                                <div class="card">
                                    <div class="card-body pb-0 d-flex justify-content-between" style={{ backgroundColor: '#4d7cff', height: '100%', height: '80px', paddingTop: '2%' }}>
                                        <div className="brand-logo">
												<Link to="/home">
													<span className="logo-compact">
														<img src="./img/logo10.png" alt="" />
													</span>
												</Link>
											</div>
                                        <div>
                                            <ul>
												<li class="d-inline-block mr-3">
													<Link to='/home' style={{ color: '#fff' }} >
														Home
													</Link>
												</li>
												<li class="d-inline-block mr-3" >
													<Link style={{ color: '#fff' }} >
														|
													</Link>
												</li>
                                                <li class="d-inline-block mr-3">
													<Link to='/login' style={{ color: '#fff' }} >
														Login
													</Link>
												</li>
												<li class="d-inline-block mr-3" >
													<Link style={{ color: '#fff' }} >
														|
													</Link>
												</li>
                                                <li class="d-inline-block mr-3" >
													<Link to='/registration' style={{ color: '#fff' }}>
														Sign up
													</Link>
												</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div class="chart-wrapper" style = {{ backgroundImage: "url('./img/bg11.jpg')", marginTop: '10px' }}>
                                        <canvas id="chart_widget_2" ></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
		</>
	);
};

export default Header;

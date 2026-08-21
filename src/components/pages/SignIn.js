import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import { Space, Spin, Button, message, Form, Input, Alert } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import Header from '../Header';
import Footer from '../Footer';
import Title from '../Title';

const INPUT_STYLE = {
	backgroundColor: '#FFDE59',
	caretColor: '#000000',
	color: '#000000',
	border: 'none',
	boxShadow: 'none',
};

const SignIn = () => {
	const { getReferrer } = useContext(SiteContext);
	const { logIn, isValidPassword } = useContext(AuthContext);
	const {
		base_api_url,
		languageSetup,
		getAContent,
		signUp_btnSubmit,
		signIn_passwordForgot,
	} = useContext(SiteContext);

	const [signInSpin, setSignInSpin] = useState(false);
	const [sendingDisabled, setSendingDisabled] = useState(false);
	const [form] = Form.useForm();
	const navigate = useNavigate();
	const location = useLocation();
	const emailRef = useRef(null);
	const passwordRef = useRef(null);

	const handleInputClick = (e) => {
    const el = e.target;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;

    // Only mutate value for text inputs (email), not password
    if (el.type !== 'password') {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
        ).set;

        const val = el.value;

        nativeInputValueSetter.call(el, val + ' ');
        el.dispatchEvent(new Event('input', { bubbles: true }));

        nativeInputValueSetter.call(el, val.trim());
        el.dispatchEvent(new Event('input', { bubbles: true }));
    }

    requestAnimationFrame(() => {
        el.setSelectionRange(start, end);
        el.style.setProperty('caret-color', '#000000', 'important');
        form.setFields([
            { name: 'signInEmail', errors: [] },
            { name: 'password', errors: [] },
        ]);
    });
};

	// Force caret and background on every navigation, reliably
	useEffect(() => {
		const breakAutofillState = () => {
			const email = document.getElementById('signInEmailInput');
			const password = document.getElementById('signInPasswordInput');

			[email, password].forEach(el => {
				if (!el) return;

				// Save the autofilled value
				const val = el.value;

				// Clear it — this breaks Chrome's autofill internal state
				const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
					window.HTMLInputElement.prototype, 'value'
				).set;

				nativeInputValueSetter.call(el, '');
				el.dispatchEvent(new Event('input', { bubbles: true }));

				// Restore it — now the browser treats it as a real typed value
				nativeInputValueSetter.call(el, val);
				el.dispatchEvent(new Event('input', { bubbles: true }));

				// Force styles
				el.style.setProperty('caret-color', '#000000', 'important');
				el.style.setProperty('color', '#000000', 'important');
				el.style.setProperty('-webkit-text-fill-color', '#000000', 'important');
				el.style.setProperty('background-color', '#FFDE59', 'important');
			});
		};

		const raf = requestAnimationFrame(() => {
			requestAnimationFrame(breakAutofillState);
		});

		return () => cancelAnimationFrame(raf);
	}, [location.key]);

	const regexEmailValidation = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
	const isValidEmail = (email) => regexEmailValidation.test(email);

	const [loginError, setLoginError] = useState(null);

	const getLocalizedError = (errorCode, defaultMessage) => {
		const errorMap = {
			'USER_NOT_FOUND': {
				messageKey: 'cmp_vetonest.com_login_error_user_not_found',
				detailsKey: 'cmp_vetonest.com_login_error_user_not_found_details',
				defaultMessage: "Account not found",
				defaultDetails: "No account exists with this email address."
			},
			'BAD_PASSWORD': {
				messageKey: 'cmp_vetonest.com_login_error_bad_password',
				detailsKey: 'cmp_vetonest.com_login_error_bad_password_details',
				defaultMessage: "Incorrect password",
				defaultDetails: "The password you entered is incorrect. Please try again."
			},
			'USER_DEACTIVATED': {
				messageKey: 'cmp_vetonest.com_login_error_account_disabled',
				detailsKey: 'cmp_vetonest.com_login_error_account_disabled_details',
				defaultMessage: "Account disabled",
				defaultDetails: "Your account has been disabled. Please contact support."
			},
			'NETWORK_ERROR': {
				messageKey: 'cmp_vetonest.com_login_error_network',
				detailsKey: 'cmp_vetonest.com_login_error_network_details',
				defaultMessage: "Connection error",
				defaultDetails: "Unable to connect to the server. Please check your internet connection."
			}
		};

		const error = errorMap[errorCode] || errorMap['NETWORK_ERROR'];
		return {
			message: getAContent(error.messageKey) || error.defaultMessage,
			details: getAContent(error.detailsKey) || error.defaultDetails
		};
	};

	const handleSubmit = async (values) => {
		setLoginError(null);
		setSignInSpin(true);
		setSendingDisabled(true);

		try {
			const signInData = {
				password: values.password,
				email: values.signInEmail.trim()  // ← trim her
			};

			// const base_api_url = 'http://localhost/VetoNest/public/index.php/api/'; // dev
			// const base_api_url = 'https://backend.vetonest.com/api/'    // prod
			const url = base_api_url + 'user/login';

			const response = await fetch(url, {
				method: 'POST',
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(signInData)
			});

			const data = await response.json();

			setSignInSpin(false);
			setSendingDisabled(false);

			if (!response.ok || (data && data.success === false)) {
				const errorCode = data.error_code ||
					(response.status === 404 ? 'USER_NOT_FOUND' :
						response.status === 401 ? 'BAD_PASSWORD' :
							response.status === 403 ? 'USER_DEACTIVATED' :
								'NETWORK_ERROR');

				const localizedError = getLocalizedError(errorCode, data.message || "Authentication failed");
				setLoginError({
					message: localizedError.message,
					description: localizedError.details
				});
				message.error(localizedError.message);
				return;
			}

			const userData = data.data || data;
			await logIn(userData);

			if (userData.languageId) {
				await languageSetup(userData.languageId);
			}

			const getConsultationPath = (referrer, profileTypeId) => {
				if (referrer) return referrer;
				const paths = {
					1: '/consultation/creation',
					2: '/consultation/vet/list'
				};
				return paths[profileTypeId] || '/';
			};

			const path = getConsultationPath(getReferrer(), userData.profileTypeId);
			navigate(path);

		} catch (error) {
			console.error("Login error:", error);
			setSignInSpin(false);
			setSendingDisabled(false);

			const localizedError = getLocalizedError('NETWORK_ERROR');
			setLoginError({
				message: localizedError.message,
				description: localizedError.details
			});
			message.error(localizedError.message);
		}
	};

	return (
		<>
			<div className="sticky-stack">
				<Header />
				<Title title={getAContent('cmp_vetonest.com_OK6429mzTG') || "Connexion"} />
			</div>

			<div className="container">
				<div className="row justify-content-center h-100">
					<div className="col-xl-6">
						<Form
							form={form}
							key={location.key}
							layout="vertical"
							onFinish={handleSubmit}
						>
							<Form.Item
								label={getAContent('cmp_vetonest.com_Er51Nm92Qa') || "Adresse e-mail"}
								name="signInEmail"
								rules={[
									{
										required: true,
										message: getAContent('cmp_vetonest.com_Em72Qa91Lp') || "Email is required"
									},
									{
										validator: (_, value) => {
											const trimmed = (value || '').trim();
											if (!trimmed) {
												return Promise.resolve();
											}
											if (!isValidEmail(trimmed)) {  // ← validate trimmed value
												return Promise.reject(
													getAContent('cmp_vetonest.com_Fm39Kd84Rw') || "Please enter a valid email"
												);
											}
											return Promise.resolve();
										}
									}
								]}
							>
								<Input
									id="signInEmailInput"
									autoComplete="username"
									className="rounded10 width100per100 height45"
									placeholder={getAContent('cmp_vetonest.com_Xep3PSNstf') || "Email"}
									size="large"
									style={INPUT_STYLE}
									onClick={handleInputClick} 
								/>
							</Form.Item>

							<Form.Item
								label={getAContent('cmp_vetonest.com_LXBYsFPl1b') || "Mot de passe"}
								name="password"
								rules={[
									{
										required: true,
										message: getAContent('cmp_vetonest.com_Kp83Wd61Lt') || "Password is required"
									},
								]}
							>
								<Input.Password
									id="signInPasswordInput"
									autoComplete="current-password"
									className="rounded10 width100per100 height45"
									placeholder={getAContent('cmp_vetonest.com_Kp83Wd61Lt') || "Password"}
									size="large"
									style={INPUT_STYLE}
									onClick={handleInputClick}
								/>
							</Form.Item>

							{loginError && (
								<Form.Item>
									<Alert
										message={loginError.message}
										description={loginError.details}
										type="error"
										showIcon
										closable
										onClose={() => setLoginError(null)}
										style={{ marginBottom: 16 }}
									/>
								</Form.Item>
							)}

							<Form.Item style={{ marginTop: 24 }}>
								<Button
									type="primary"
									htmlType="submit"
									block
									size="large"
									className="login-form__btn rounded10"
									disabled={sendingDisabled}
									style={{
										height: '45px',
										backgroundColor: '#000000',
										borderColor: '#000000',
										color: '#ffffff'
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.backgroundColor = '#333333';
										e.currentTarget.style.borderColor = '#333333';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.backgroundColor = '#000000';
										e.currentTarget.style.borderColor = '#000000';
									}}
								>
									<Space>
										{signInSpin && (
											<Spin
												indicator={
													<LoadingOutlined
														style={{ fontSize: 20, color: '#ffffff' }}
														spin
													/>
												}
											/>
										)}
										{signUp_btnSubmit || getAContent('cmp_vetonest.com_f8Pqk3fJ2H') || "Submit"}
									</Space>
								</Button>
							</Form.Item>

							<div className='row'>
								<div className='col-6'>
									<Link to='/mot-de-passe-oublie' className="text-primary">
										{signIn_passwordForgot || getAContent('cmp_vetonest.com_Y9LbvGXMq2') || "Forgot password?"}
									</Link>
								</div>
								<div className='col-6 textAlignRight'>
									<Link to='/inscription' className="text-primary" id="cmp_vetonest.com_J50yit0tKU">
										{getAContent('cmp_vonetest.com_J50yit0tKU') || "Create an account"}
									</Link>
								</div>
							</div>
						</Form>
					</div>
				</div>
			</div>

			<div>&nbsp;</div>
			<Footer />
		</>
	);
};

export default SignIn;
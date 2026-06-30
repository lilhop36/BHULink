import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { checkValidSignUpFrom } from "../utils/validate";
import { PiEye, PiEyeClosedLight } from "react-icons/pi";

const SignUp = () => {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState("student");
	const [department, setDepartment] = useState("");
	const [load, setLoad] = useState("");
	const [isShow, setIsShow] = useState(false);
	const [showOTPModal, setShowOTPModal] = useState(false);
	const [otp, setOTP] = useState("");
	const [otpSent, setOtpSent] = useState(false);
	const [tempUserData, setTempUserData] = useState(null);
	const navigate = useNavigate();

	const handleBackToHome = () => {
		navigate("/landing");
	};

	const signUpUser = (e) => {
		toast.loading("Wait until you SignUp");
		e.target.disabled = true;
		fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				firstName: firstName,
				lastName: lastName,
				email: email,
				password: password,
				role: role,
			}),
		})
			.then((response) => response.json())
			.then((json) => {
				setLoad("");
				e.target.disabled = false;
				toast.dismiss();
				if (json.token) {
					navigate("/signin");
					toast.success(json?.message);
				} else {
					toast.error(json?.message);
				}
			})
			.catch((error) => {
				console.error("Error:", error);
				setLoad("");
				toast.dismiss();
				toast.error("Network error or server not responding");
				e.target.disabled = false;
			});
	};

	const sendOTP = async (userData) => {
		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/send-otp`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email: userData.email }),
			});
			
			const result = await response.json();
			
			if (response.ok) {
				setOtpSent(true);
				setShowOTPModal(true);
				toast.success("OTP sent to your institutional email");
			} else {
				toast.error(result.message || "Failed to send OTP");
			}
		} catch (error) {
			console.error("Error sending OTP:", error);
			toast.error("Failed to send OTP");
		}
	};

	const verifyOTP = async () => {
		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-otp`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ 
					email: tempUserData.email, 
					otp: otp,
					userData: tempUserData
				}),
			});
			
			const result = await response.json();
			
			if (response.ok) {
				toast.success("Account created successfully!");
				setShowOTPModal(false);
				setOTP("");
				setTempUserData(null);
				navigate("/signin");
			} else {
				toast.error(result.message || "Invalid OTP");
			}
		} catch (error) {
			console.error("Error verifying OTP:", error);
			toast.error("Failed to verify OTP");
		}
	};

	const handleSignup = (e) => {
		// Validate all fields including department
		if (!firstName || !lastName || !email || !password || !role || !department) {
			toast.error("Required: All Fields including Department");
			return;
		}

		// Validate institutional email
		if (!email.endsWith("@bhu.edu.et")) {
			toast.error("Email must end with @bhu.edu.et");
			return;
		}

		const validError = checkValidSignUpFrom(
			firstName,
			lastName,
			email,
			password,
			role
		);
		if (validError) {
			toast.error(validError);
			return;
		}

		// Store user data temporarily and send OTP
		const userData = {
			firstName,
			lastName,
			email,
			password,
			role,
			department
		};
		
		setTempUserData(userData);
		setLoad("Loading...");
		sendOTP(userData);
	};

	return (
		<div className="relative min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#0a1a2f]">
			{/* Animated background orbs with soft curves */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-slow"></div>
				<div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-medium"></div>
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-fast"></div>
				<div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse-slow"></div>
			</div>

			{/* Floating particles */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				{[...Array(20)].map((_, i) => (
					<div
						key={i}
						className="absolute bg-white/10 rounded-full animate-particle"
						style={{
							width: `${Math.random() * 6 + 2}px`,
							height: `${Math.random() * 6 + 2}px`,
							top: `${Math.random() * 100}%`,
							left: `${Math.random() * 100}%`,
							animationDelay: `${Math.random() * 5}s`,
							animationDuration: `${Math.random() * 8 + 5}s`,
						}}
					/>
				))}
			</div>

			{/* Main Card - Two Column Curved Layout */}
			<div className="w-full max-w-5xl relative z-10 animate-fadeInUp">
				<div className="relative backdrop-blur-xl bg-white/5 rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden transition-all duration-500 hover:shadow-blue-500/20 hover:border-white/30">
					{/* Decorative curved accents */}
					<div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
					<div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

					{/* Back button row */}
					<div className="p-6 sm:p-8 pb-0 relative z-10">
						<div className="flex justify-start mb-4">
							<button 
								onClick={handleBackToHome}
								className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 text-slate-200 hover:text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/30"
							>
								<svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
								</svg>
								<span className="text-sm">Back to Home</span>
							</button>
						</div>
					</div>

					{/* Two column layout with curved divider */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-0 p-6 sm:p-8 pt-0 relative">
						{/* Curved divider line (desktop) */}
						<div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-3/4 bg-gradient-to-b from-transparent via-white/20 to-transparent rounded-full"></div>

						{/* LEFT COLUMN: Sign Up Form */}
						<div className="pr-0 md:pr-8 relative z-10">
							<div className="text-left mb-6">
								<h2 className="text-4xl font-bold text-white tracking-tight">
									Sign Up
								</h2>
								<p className="text-blue-200 mt-2 text-sm">Create your BHULink account</p>
							</div>

							<form className="space-y-5">
								{/* First Name */}
								<div className="space-y-2 group">
									<label className="text-sm font-medium text-slate-300 flex items-center gap-2 transition-colors duration-200 group-focus-within:text-blue-300">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
										</svg>
										First Name
									</label>
									<input
										className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/10"
										type="text"
										placeholder="Enter First Name"
										name="firstName"
										value={firstName}
										onChange={(e) => setFirstName(e.target.value)}
										required
									/>
								</div>

								{/* Last Name */}
								<div className="space-y-2 group">
									<label className="text-sm font-medium text-slate-300 flex items-center gap-2 transition-colors duration-200 group-focus-within:text-blue-300">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
										</svg>
										Last Name
									</label>
									<input
										className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/10"
										type="text"
										placeholder="Enter Last Name"
										name="lastName"
										value={lastName}
										onChange={(e) => setLastName(e.target.value)}
										required
									/>
								</div>

								{/* Role */}
								<div className="space-y-2 group">
									<label className="text-sm font-medium text-slate-300 flex items-center gap-2 transition-colors duration-200 group-focus-within:text-blue-300">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
										</svg>
										Role
									</label>
									<select
										className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/10 appearance-none cursor-pointer"
										name="role"
										value={role}
										onChange={(e) => setRole(e.target.value)}
									>
										<option value="student" className="bg-slate-800">Student</option>
										<option value="admin" className="bg-slate-800">Admin</option>
										<option value="faculty" className="bg-slate-800">Faculty</option>
									</select>
								</div>

								{/* Department */}
								<div className="space-y-2 group">
									<label className="text-sm font-medium text-slate-300 flex items-center gap-2 transition-colors duration-200 group-focus-within:text-blue-300">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
										</svg>
										Department
									</label>
									<input
										className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/10"
										type="text"
										placeholder="Enter your department"
										name="department"
										value={department}
										onChange={(e) => setDepartment(e.target.value)}
										required
									/>
								</div>

								{/* Email */}
								<div className="space-y-2 group">
									<label className="text-sm font-medium text-slate-300 flex items-center gap-2 transition-colors duration-200 group-focus-within:text-blue-300">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
										</svg>
										Institutional Email Address
									</label>
									<input
										className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/10"
										type="email"
										placeholder="komarsan.berhanu@bhu.edu.et"
										name="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
									/>
									<p className="text-xs text-slate-400 mt-1">Must end with @bhu.edu.et</p>
								</div>

								{/* Password */}
								<div className="space-y-2 group">
									<label className="text-sm font-medium text-slate-300 flex items-center gap-2 transition-colors duration-200 group-focus-within:text-blue-300">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
										</svg>
										Password
									</label>
									<div className="relative">
										<input
											className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 pr-12 hover:bg-white/10"
											type={isShow ? "text" : "password"}
											placeholder="Enter Password"
											name="password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
										/>
										<button
											type="button"
											onClick={() => setIsShow(!isShow)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-all duration-200 hover:scale-110"
										>
											{isShow ? <PiEyeClosedLight size={20} /> : <PiEye size={20} />}
										</button>
									</div>
								</div>

								{/* Sign Up Button */}
								<button
									onClick={(e) => {
										handleSignup(e);
										e.preventDefault();
									}}
									disabled={load !== ""}
									className="disabled:opacity-50 disabled:cursor-not-allowed relative w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3.5 px-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 overflow-hidden group"
								>
									<span className="relative z-10 flex items-center justify-center gap-2">
										{load === "" ? (
											<>
												<span>SIGN UP</span>
												<svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
												</svg>
											</>
										) : (
											<>
												<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
													<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
													<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
												</svg>
												<span>Loading...</span>
											</>
										)}
									</span>
									<div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
								</button>
							</form>
						</div>

						{/* RIGHT COLUMN: Curved Welcome Panel */}
						<div className="mt-8 md:mt-0 md:ml-4 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600/95 to-cyan-700/95 backdrop-blur-sm p-8 flex flex-col justify-center items-center text-center border border-white/30 shadow-xl">
							{/* Decorative wavy curves inside the panel */}
							<div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
								<svg className="absolute -bottom-10 -left-10 w-40 h-40 text-white/10" viewBox="0 0 200 200" fill="currentColor">
									<path d="M100,20 C140,20 180,50 190,90 C200,130 180,170 150,190 C120,210 70,210 40,190 C10,170 -10,130 0,90 C10,50 60,20 100,20 Z" />
								</svg>
								<svg className="absolute -top-10 -right-10 w-32 h-32 text-white/10 rotate-45" viewBox="0 0 200 200" fill="currentColor">
									<path d="M100,20 C140,20 180,50 190,90 C200,130 180,170 150,190 C120,210 70,210 40,190 C10,170 -10,130 0,90 C10,50 60,20 100,20 Z" />
								</svg>
							</div>
							{/* Curved bottom wave */}
							<div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white/5 to-transparent rounded-t-full"></div>
							
							<div className="relative z-10 space-y-6">
								<h3 className="text-4xl font-bold text-white tracking-tight">
									Welcome Back!
								</h3>
								<p className="text-blue-100 text-base leading-relaxed max-w-xs mx-auto">
									Already have an account? Sign in to continue your journey.
								</p>
								<Link to="/signin">
									<button className="mt-4 px-8 py-3 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/20 inline-flex items-center gap-2 group">
										<span>SIGN IN</span>
										<svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
										</svg>
									</button>
								</Link>
							</div>
						</div>
					</div>

					{/* OTP Verification Modal */}
					{showOTPModal && (
						<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
							<div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
								<div className="flex justify-between items-center p-6 border-b">
									<h3 className="text-xl font-bold text-gray-800">Verify Email</h3>
									<button
										onClick={() => {
											setShowOTPModal(false);
											setOTP("");
											setTempUserData(null);
											setLoad("");
										}}
										className="text-gray-500 hover:text-gray-700 transition-colors"
									>
										<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
								<div className="p-6 space-y-4">
									<div className="text-center">
										<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
											<svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
											</svg>
										</div>
										<h4 className="text-lg font-semibold text-gray-800 mb-2">Check your email</h4>
										<p className="text-gray-600 text-sm mb-4">
											We've sent a verification code to<br />
											<span className="font-medium text-blue-600">{tempUserData?.email}</span>
										</p>
									</div>
									
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP Code</label>
										<input
											type="text"
											value={otp}
											onChange={(e) => setOTP(e.target.value)}
											placeholder="Enter 6-digit code"
											className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
											maxLength={6}
										/>
									</div>
									
									<div className="flex gap-3">
										<button
											onClick={() => {
												setShowOTPModal(false);
												setOTP("");
												setTempUserData(null);
												setLoad("");
											}}
											className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
										>
											Cancel
										</button>
										<button
											onClick={verifyOTP}
											disabled={otp.length !== 6}
											className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
										>
											Verify
										</button>
									</div>
									
									<div className="text-center pt-2">
										<button
											onClick={() => sendOTP(tempUserData)}
											className="text-sm text-blue-600 hover:text-blue-700 transition"
										>
											Resend OTP
										</button>
									</div>
								</div>
							</div>
						</div>
					)}

					<style>{`
						@keyframes float-slow {
							0%, 100% { transform: translate(0, 0) scale(1); }
							50% { transform: translate(20px, -20px) scale(1.05); }
						}
						@keyframes float-medium {
							0%, 100% { transform: translate(0, 0) scale(1); }
							50% { transform: translate(-20px, 20px) scale(1.1); }
						}
						@keyframes float-fast {
							0%, 100% { transform: translate(0, 0) scale(1); }
							50% { transform: translate(15px, 15px) scale(1.08); }
						}
						@keyframes pulse-slow {
							0%, 100% { opacity: 0.2; transform: scale(1); }
							50% { opacity: 0.4; transform: scale(1.05); }
						}
						@keyframes particle {
							0% { transform: translateY(0) translateX(0); opacity: 0; }
							10% { opacity: 0.5; }
							90% { opacity: 0.5; }
							100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
						}
						@keyframes fadeInUp {
							from {
								opacity: 0;
								transform: translateY(30px);
							}
							to {
								opacity: 1;
								transform: translateY(0);
							}
						}
						.animate-float-slow {
							animation: float-slow 12s ease-in-out infinite;
						}
						.animate-float-medium {
							animation: float-medium 8s ease-in-out infinite;
						}
						.animate-float-fast {
							animation: float-fast 6s ease-in-out infinite;
						}
						.animate-pulse-slow {
							animation: pulse-slow 8s ease-in-out infinite;
						}
						.animate-particle {
							animation: particle linear infinite;
						}
						.animate-fadeInUp {
							animation: fadeInUp 0.8s ease-out;
						}
					`}</style>
				</div>
			</div>
		</div>
	);
};

export default SignUp;
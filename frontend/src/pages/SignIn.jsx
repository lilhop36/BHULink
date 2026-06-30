import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { addAuth } from "../redux/slices/authSlice";
import { checkValidSignInFrom } from "../utils/validate";
import { PiEye, PiEyeClosedLight } from "react-icons/pi";

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [load, setLoad] = useState("");
    const [isShow, setIsShow] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleBackToHome = () => {
        navigate("/landing");
    };

    const logInUser = (e) => {
        console.log(`Attempting to connect to: ${import.meta.env.VITE_BACKEND_URL}/api/auth/signin`);
        toast.loading("Wait until you SignIn");
        e.target.disabled = true;
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        })
            .then((response) => response.json())
            .then((json) => {
                setLoad("");
                e.target.disabled = false;
                toast.dismiss();

                if (json.token) {
                    console.log("Login response:", json);
                    console.log("Redirect URL from backend:", json.redirectUrl);
                    
                    localStorage.setItem("token", json.token);
                    dispatch(addAuth(json.data));

                    const redirectPath = json.redirectUrl;
                    console.log("Final redirect path:", redirectPath);
                    
                    if (redirectPath) {
                        navigate(redirectPath);
                    } else {
                        console.error("No redirect URL provided for role:", json.data?.role);
                        toast.error("Invalid user role. Please contact admin.");
                        return;
                    }
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

    const handleLogin = (e) => {
        if (email && password) {
            const validError = checkValidSignInFrom(email, password);
            if (validError) {
                toast.error(validError);
                return;
            }
            setLoad("Loading...");
            logInUser(e);
        } else {
            toast.error("Required: All Fields");
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#0a1a2f]">
            {/* Animated background orbs with soft curves */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-slow"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-medium"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-fast"></div>
                {/* Additional curved blob */}
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

            {/* Main Card - Curved, non-rectangular shape */}
            <div className="w-full max-w-5xl relative z-10 animate-fadeInUp">
                <div className="relative backdrop-blur-xl bg-white/5 rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden transition-all duration-500 hover:shadow-blue-500/20 hover:border-white/30">
                    {/* Decorative curved top-left and bottom-right accents */}
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

                    {/* Back button row with curved style */}
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
                        {/* Curved decorative line between columns (desktop) */}
                        <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-3/4 bg-gradient-to-b from-transparent via-white/20 to-transparent rounded-full"></div>

                        {/* Left Column - Sign In Form */}
                        <div className="pr-0 md:pr-8 relative z-10">
                            <div className="text-left mb-8">
                                <h2 className="text-4xl font-bold text-white tracking-tight">
                                    Sign In
                                </h2>
                                <p className="text-blue-200 mt-2 text-sm">or use your email & password</p>
                            </div>

                            <form className="space-y-6">
                                {/* Email Field */}
                                <div className="space-y-2 group">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2 transition-colors duration-200 group-focus-within:text-blue-300">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                        Email Address
                                    </label>
                                    <input
                                        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/10"
                                        type="email"
                                        placeholder="Enter your email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                {/* Password Field */}
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
                                            placeholder="Enter your password"
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

                                {/* Forgot Password Link - curved style */}
                                <div className="flex justify-end">
                                    <Link to="#" className="text-sm text-blue-300 hover:text-blue-200 transition-all duration-200 hover:scale-105 inline-block border-b border-transparent hover:border-blue-300/50 pb-0.5">
                                        Forgot? Your Password?
                                    </Link>
                                </div>

                                {/* Sign In Button with curved corners and shine */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleLogin(e);
                                    }}
                                    disabled={load !== ""}
                                    className="disabled:opacity-50 disabled:cursor-not-allowed relative w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3.5 px-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 overflow-hidden group"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {load === "" ? (
                                            <>
                                                <span>SIGN IN</span>
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
                                    {/* Shine effect */}
                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                                </button>
                            </form>
                        </div>

                        {/* Right Column - Curved Welcome Panel with Wave Shape */}
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
                                    Hello, Friend!
                                </h3>
                                <p className="text-blue-100 text-base leading-relaxed max-w-xs mx-auto">
                                    Register your new account!
                                </p>
                                <button
                                    onClick={() => navigate("/signup")}
                                    className="mt-4 px-8 py-3 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/20 inline-flex items-center gap-2 group"
                                >
                                    <span>KICK US</span>
                                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Animations */}
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
    );
};

export default SignIn;
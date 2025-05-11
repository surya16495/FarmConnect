"use client";
import Link from "next/link";
import Image from "next/image";
import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import "./Signup.css";
import { useAuth } from "../context/AuthContext";


export default function Signup({active}) {
    const [isDropdownOpen,setIsDropdownOpen]=useState(false);
    const [selectedRole, setSelectedRole] = useState(active); 
    const [loadingPhase, setLoadingPhase] = useState('hidden'); 
    const [loadingMessage, setLoadingMessage] = useState('');

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    const { login } = useAuth(); 
    const router = useRouter(); 
    const handleRoleChange = (role) => {
        setSelectedRole(role);
        const logo=document.querySelector(".logo img");
        if (logo) {
            logo.classList.add("logo-slide");
          }
        setTimeout(()=>{
            router.push(`/signupForms/${role}`); // Redirect to the selected role signup page  
        },100);
    };

    const [name,setName]=useState("");
    const [email,setEmail]=useState("");
    const [mobile,setMobile]=useState("");
    const [otp,setOtp]=useState("");
    const [otpSent,setOtpSent]=useState(false);
    const [message,setMessage]=useState("");
    const [password, setPassword] = useState("");
    const [retypePassword,setRetypePassword]=useState("");
    const [showLogin, setShowLogin] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [loginUsername, setLoginUsername] = useState("");
    
    const handleSendOTP = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            setMessage("Please enter a valid email address");
            return;
        }
    
        try {
            const response = await fetch("http://localhost:5000/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name }),
            });
    
            const data = await response.json();
            if (response.ok) {
                setOtpSent(true);
                setMessage("OTP Sent to your email!");
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            console.error("Error sending OTP:", error);
            setMessage("Failed to send OTP. Try again.");
        }
    };
    

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (!otp) {
            setMessage("Enter OTP.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage("OTP Verified!");
                setOtpVerified(true);
                
            } else {
                setMessage(data.message);
            }
            
        } catch (error) {
            console.error("Error verifying OTP:", error);
            setMessage("Failed to verify OTP. Try again.");
        }
        
    };

    const handleCreateAccount = async (e) =>{
        e.preventDefault();
        if (password !== retypePassword) {
            setMessage("Passwords do not match");
            return;
        }
        if (password.length<6){
            setMessage("password must be 6 characters");
            return;
        }
        try{
            setLoadingPhase('loading');
            setLoadingMessage('Cultivating Your Account...');
            const response =await fetch("http://localhost:5000/create-account",{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body: JSON.stringify({
                    username:name,email,
                    mobile,password,account_type:selectedRole
                }),
            })
            if (response.ok){
                const data = await response.json();
                
                setTimeout(()=>{
                    setLoadingPhase('success');
                    setTimeout(() => {
                        login(data.user);
                        router.push(`/dashboard/${data.user.account_type}_dashboard`);
                    }, 1000); 
                },3000);
                
            }
            
        } catch(error){
            setLoadingPhase('hidden');
            setMessage("Account creation failed");
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            setLoadingPhase('loading');
            setLoadingMessage('Authenticating Your Session...');
          const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ account_type:selectedRole ,username: loginUsername, password }),
          });
          const data = await response.json();
          if (response.ok) {
            setTimeout(()=>{
                setLoadingPhase('success');
                    setTimeout(() => {
                        login(data.user);
                        router.push(`/dashboard/${data.user.account_type}_dashboard`);
                    }, 1000);
            },3000);
          } else {
            setLoadingPhase('hidden');
            setMessage(data.message);
          }
        } catch (error) {
            setLoadingPhase('hidden');
          setMessage("Login failed");
        }
      };

    const handleLoginRoleChange = (role) => {
        setSelectedRole(role);
    };

    

    return(
        <div className="signup-container">
         {loadingPhase !== 'hidden' && (
                <div className="loader-overlay">
                    <div className="loader-container">
                        {loadingPhase === 'loading' ? (
                            <>
                                <div className="particle-animation"></div>
                                <Image 
                                    src="/Assets/loading-spinner.gif" 
                                    width={120} 
                                    height={120} 
                                    alt="Loading..."
                                    className="rotating-spinner"
                                />
                                <div className="loader-text">{loadingMessage}</div>
                            </>
                        ) : (
                            <>
                                <Image 
                                    src="/Assets/Success.gif" 
                                    width={300} 
                                    height={300} 
                                    alt="Success"
                                    className="success-gif"
                                />
                                <div className="success-text">Operation Successful!</div>
                            </>
                        )}
                    </div>
                </div>
            )}
            <main className="signup-section">
            <div className="signup-box">
                <div className="return">
                    <Link href="/" className="link">✖</Link>
                </div>
                {showLogin ?(<h2>Login</h2>):(<h2>Sign Up</h2>)}
                <button className="toggle-auth" onClick={() => setShowLogin(!showLogin)}>
                    {showLogin ? "Create New Account" : "Already have an account? Login"}
                </button>
                {showLogin ?(
                    <>
                    <div className="role-selector">
                        <div onClick={() => handleLoginRoleChange("farmer")} className="Role">
                            <input type="radio" checked={selectedRole === "farmer"} readOnly />
                            <label>Farmer</label>
                        </div>
                        <div onClick={() => handleLoginRoleChange("dealer")} className="Role">
                            <input type="radio" checked={selectedRole === "dealer"} readOnly />
                            <label>Dealer</label>
                        </div>
                        <div onClick={() => handleLoginRoleChange("storage")} className="Role">
                            <input type="radio" checked={selectedRole === "storage"} readOnly />
                            <label>Storage Owner</label>
                        </div>
                    </div>
                    <form onSubmit={handleLogin}>
                        <label htmlFor="username">Username</label>
                        <input type="text" placeholder="Username" value={loginUsername} onChange={(e)=>setLoginUsername(e.target.value)} name="username"/>
                        <label htmlFor="password">Password</label>
                        <input type="password" placeholder="Password" value={password} onChange={(e)=> setPassword(e.target.value)} name="password"/>
                        <button type="submit">Login</button>
                    </form>
                    </>
                ):(
                    <>
                    <div className="role-selector">
                        <div onClick={() => handleRoleChange("farmer")} className="Role">
                            <input type="radio" checked={selectedRole === "farmer"} readOnly />
                            <label>Farmer</label>
                        </div>
                        <div onClick={() => handleRoleChange("dealer")} className="Role">
                            <input type="radio" checked={selectedRole === "dealer"} readOnly />
                            <label>Dealer</label>
                        </div>
                        <div onClick={() => handleRoleChange("storage")} className="Role">
                            <input type="radio" checked={selectedRole === "storage"} readOnly />
                            <label>Storage Owner</label>
                        </div>
                    </div>
                    <form onSubmit={otpVerified ? handleCreateAccount: handleVerifyOTP}>
                            <label htmlFor="name">Username</label>
                            <input type="text" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} name="name"/>
                            <label htmlFor="email">Email</label>
                            <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} name="email"/>
                            {!otpSent ? (
                                    <div>
                                        <button type="button" onClick={handleSendOTP}>
                                            Get OTP
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                    <label htmlFor="otp">OTP</label>
                                        <input
                                            type="text"
                                            className="otp"
                                            maxLength="6"
                                            placeholder="Enter OTP"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            name="otp"
                                        />
                                        {otpVerified && (
                                            <>
                                            <label htmlFor="mobile">Mobile Number</label>
                                            <input
                                            type="text"
                                            placeholder="Mobile Number"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                            name="mobile"
                                            />
                                            <label htmlFor="password">Password</label>
                                            <input
                                            type="password"
                                            placeholder="Create Password (6 characters)"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            name="password"
                                            />
                                            <label htmlFor="retype">Retype Password</label>
                                            <input
                                            type="password"
                                            placeholder="Retype Password"
                                            value={retypePassword}
                                            onChange={(e) => setRetypePassword(e.target.value)}
                                            name="retype"
                                            />
                                            </>
                                        )}
                                        <div>
                                            <button type="submit">{otpVerified ? "Create Account": "verify OTP"}</button>
                                        </div>
                                    </>
                                )}
                        </form>
                        </>
                )}
                
                
                <div id="recaptcha-container"></div>
                {message && <p>{message}</p>}
                </div>
            </main>
        </div>
    )
}
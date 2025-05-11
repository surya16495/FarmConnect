"use client";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import "./page.css"; // Import CSS for home page
import OurServices from "./Components/OurServices/page";
import ContactUs from "./Components/ContactUs/page";
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';


export default function Home() {
  const [isDropdownOpen,setIsDropdownOpen]=useState(false);
  const serviceRef = useRef(null);
  const welcomeSectionRef = useRef(null);
  const contactUsRef=useRef(null);
  const { user } = useAuth();
  const router = useRouter();

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const scrollToServices = (e) => {
      e.preventDefault();
      if (serviceRef.current) {
        serviceRef.current.scrollIntoView({ behavior: "smooth" });
      } 
    };

    const scrollToTop = (e) => {
      e.preventDefault();
      if (welcomeSectionRef.current) {
        welcomeSectionRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    const scrollToContactUs=(e)=>{
      e.preventDefault();
      if(contactUsRef.current){
        contactUsRef.current.scrollIntoView({behavior:"smooth"});
      }
    }

    
  return (
    <>
      <nav className="navbar">
        <div className="logo">
          <Image src="/Assets/logo.png" height={50} width={80} alt="FarmConnect Logo" />
        </div>
        <button className="dropdown-toggle" onClick={toggleDropdown}>
          ☰
        </button>
        <div className={`nav-links ${isDropdownOpen ? "open" : ""}`}>
          <Link href="#/" onClick={scrollToTop}>Home</Link>
          <Link href="#OurServices" onClick={scrollToServices}>Our Services</Link>
          <Link href="#contact" onClick={scrollToContactUs}>Contact Us</Link>
        </div>
        
      </nav>
      <div className="hero-section">
        <main ref={welcomeSectionRef} className="welcome-section">
        <h1>Welcome to the platform</h1>
        <p>Where you can connect and make contracts</p>
        <div className="buttons">
        <Link href="/signupForms/farmer">
          <button className="signup-btn">Sign Up</button>
        </Link>
        <Link href="/signupForms/farmer">
            <button className="dashboard-btn">Login</button>
        </Link>
        </div>
        </main>
        <div ref={serviceRef} className="our-services-section"><OurServices/></div>
        <div ref={contactUsRef}><ContactUs/></div>
        <footer className="footer-section">
          <div className="footer-content">
            <p>Phone No: xxxxxxxxx</p>
            <p>Email: xxxxx@gmail.com</p>
            <p>&copy; 2025 FarmConnect</p>
          </div>
        </footer>
      </div>
    </>
  );
}

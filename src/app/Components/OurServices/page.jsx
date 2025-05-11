"use client";
import Image from "next/image";
import { useEffect,useState } from 'react';
import Link from "next/link";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./OurServices.css";

export default function OurServices() {
    const [activePopup, setActivePopup] = useState(null);
    const [isBootstrapLoaded, setIsBootstrapLoaded] = useState(false);


      useEffect(() => {
        (async () => {
            await import('bootstrap/dist/js/bootstrap.bundle.min.js');
            setIsBootstrapLoaded(true);
        })();
    }, []);
    
    const openPopup = (popupName) => {
        setActivePopup(popupName);
    };
    
    const closePopup = () => {
        setActivePopup(null);
    };

    return(
        <div className="services-container">
            {activePopup === 'contract' && (
                <div className="popup-overlay active" onClick={closePopup}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={closePopup}>×</button>
                        <h2>📘 Contract Farming</h2>
                        <p className="highlight">What is Contract Farming?</p>
                        <p>Contract Farming is a modern agricultural model where farmers and buyers form agreements to facilitate smoother transactions and fair pricing. It helps bridge the gap between production and market needs, ensuring that both parties benefit from transparency and trust.</p>
                        
                        <div className="emoji-heading">
                            <span>💡</span>
                            <h3>How Farmer's Friend Works</h3>
                        </div>
                        <ul>
                            <li>Farmers list crops they are ready to sell, specifying quantity, type, and price expectations.</li>
                            <li>Buyers browse these listings and initiate contract proposals based on their requirements.</li>
                            <li>Once both parties agree, a formal contract is created within the system and stored securely.</li>
                            <li>The contract ensures clarity on product details, price, and delivery terms — reducing risks for both parties.</li>
                        </ul>

                        <div className="emoji-heading">
                            <span>🚜</span>
                            <h3>Why It Matters</h3>
                        </div>
                        <ul>
                            <li>Ensures better price realization for farmers</li>
                            <li>Gives buyers access to verified produce listings</li>
                            <li>Promotes trust with trackable contracts</li>
                            <li>Digital documentation speeds up the process</li>
                        </ul>
                    </div>
                </div>
            )}
            {activePopup === 'storage' && (
                <div className="popup-overlay active" onClick={closePopup}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={closePopup}>×</button>
                        <h2>❄ Cold Storage Booking</h2>
                        <p className="highlight">What is Cold Storage Booking?</p>
                        <p>Cold Storage Booking refers to the reservation and use of temperature-controlled facilities to store perishable agricultural goods. It helps maintain quality, prolong shelf-life, and prevent spoilage.</p>

                        <div className="emoji-heading">
                            <span>🌾</span>
                            <h3>Why Cold Storage Matters</h3>
                        </div>
                        <ul>
                            <li>Reduces Post-Harvest Losses</li>
                            <li>Maintains Crop Freshness for export-oriented produce</li>
                            <li>Boosts Farmer Profitability through strategic sales</li>
                        </ul>

                        <div className="emoji-heading">
                            <span>🧊</span>
                            <h3>How It Works on FarmConnect</h3>
                        </div>
                        <ul>
                            <li>Cold Storage Owners list available facilities</li>
                            <li>Farmers browse nearby facilities and book slots</li>
                            <li>Real-time availability and booking confirmation</li>
                            <li>Future IoT monitoring and price comparisons</li>
                        </ul>
                    </div>
                </div>
            )}

            <h1>Our Services</h1>
            <p>Here are the services we offer</p>
            <div className="w-100">
                <div id="carouselExampleCaptions" className="carousel slide">
                <div className="carousel-indicators">
                    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1" aria-label="Slide 2"></button>
                </div>
                <div className="carousel-inner">
                    <div className="carousel-item active first">
                    <img src="/Assets/firstCarousel.png" className="d-block w-100" alt="Contracts" />
                    <div className="carousel-caption d-md-block">
                        <h5>Contract Farming</h5>
                        <p>We provide a platform where you can connect with farmers or buyers who wants to buy or sell their products.</p>
                        <button 
                        onClick={() => openPopup('contract')}
                        className="read-btn"
                    >
                        Read More
                    </button>
                    </div>
                    </div>
                    <div className="carousel-item second">
                    <img src="/Assets/secondCarousel.png" className="d-block w-100" alt="Storage" />
                    <div className="carousel-caption d-md-block">
                        <h5>Storage Booking</h5>
                        <p>Here you can book a storage for your products.</p>
                        <button 
                        onClick={() => openPopup('storage')}
                        className="read-btn"
                    >
                        Read More
                    </button>
                    </div>
                    </div>
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
                </div>
            </div>
        </div>
    )
}
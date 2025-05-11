"use client"
import Link from "next/link";
import { useEffect, useState } from "react";
import {useRouter} from "next/navigation";
import "./s_dashboard.css";
import Sidebar from "../../Components/Sidebar/page";
import { useAuth } from "@/app/context/AuthContext";
import Profile from '../../Components/Profile/page';
import StorageDetails from "@/app/Components/StorageDetails/page";
import { request } from "http";

export default function Dashboard() {
    const [activeSection, setActiveSection] = useState(null);
    const {user,logout} = useAuth();
    const router= useRouter();
    const [availableCrops, setAvailableCrops]=useState([]);
    const [showLogoutConfirmation,setShowLogoutConfirmation]=useState(false);
    const [isLoggingOut,setIsLoggingOut]=useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [isStorageDashboard] = useState(true);
    const [storageRequests, setStorageRequests] = useState([]);
    const [activeBookings, setActiveBookings] = useState([]);


    useEffect(()=>{
        const fetchAvailableCrops = async () =>{
            try{
                const response = await fetch('http://localhost:5000/api/user-crops');
                const data = await response.json();
                setAvailableCrops(data);

            }catch(error){
                console.log("Error fetching available crops");
            }
        };
        if (activeSection=='available-crops'){
            fetchAvailableCrops();
        }
    },[activeSection]);

    useEffect(() => {
        const fetchActiveBookings = async () => {
          try {
            const response = await fetch(`http://localhost:5000/api/active-storage-bookings/${user._id}`);
            if (!response.ok) throw new Error('Failed to fetch bookings');
            const data = await response.json();
            console.log("Fetched active bookings:", data);
            const processedBookings = data.map(booking => ({
              ...booking,
              crop_storage_start_date: new Date(booking.crop_storage_start_date),
              crop_storage_end_date: new Date(booking.crop_storage_end_date)
            }));
            setActiveBookings(processedBookings);
          } catch (error) {
            console.error("Error fetching active bookings:", error);
          }
        };
    
        if (user?._id && activeSection === 'bookings') {
          fetchActiveBookings();
        }
    }, [user, activeSection]);

    useEffect(() => {
        const fetchStorageData = async () => {
          try {
            const requestsRes = await fetch(`http://localhost:5000/api/storage-requests/${user._id}`);
            

            if (!requestsRes.ok) throw new Error(`Requests failed: ${requestsRes.status}`);
            
            const requestsData = await requestsRes.json();
            
            
      
      // Convert date strings to Date objects
      

      setStorageRequests(Array.isArray(requestsData) ? requestsData : []);
      
          } catch (error) {
            console.error("Error fetching storage data:", error);
          }
        };
        
        if (user?._id) fetchStorageData();
      }, [user]);
      
    
    const handleLogout = async () =>{
        setIsLoggingOut(true);
        setTimeout(()=>{
            logout();
            window.location.href="/";
        },1000);
    }
    
    const dashboardCards = [
        {
            title: "Storage Bookings",
            description: "Manage your current storage reservations and availability",
            target: "bookings",
            color: "#2d6a4f"
        },
        {
            title: "Facility Management",
            description: "Update storage facility details and maintenance schedules",
            target: "facility",
            color: "#1b4332"
        }
    ];

    const renderSectionContent = (items,section)=>(
        <>
            <div className="section-header">
                <h2 className="section-heading">{section === 'available-crops' ? 'Available Crops' : section === 'requests' ? 'Storage Requests' : 
         section === 'bookings' ? 'Active Bookings' : 'Your Section'}</h2>
                <button 
                className="close-section"
                onClick={() => setActiveSection(null)}
                >
                ✕
                </button>
            </div>
            {section === 'available-crops' ?(
            <div className="crop-cards">
                {items.map((item) => (
                    <div key={item._id} className="crop-card">
                        <h3>{item.crop_name || item.name}</h3>
                        <p className="farmer-name">{item.user?.username}</p>
                        {item.profile?.district && (
                            <p className="farmer-location">{item.profile.district}, {item.profile.state}</p>
                        )}
                        <div className="crop-details">
                            <p>Variety: {item.crop_variety || item.variety}</p>
                            <p>Quantity: {item.quantity || item.crop?.quantity} kg</p>
                            <p>Price: ₹{item.price_per_quintal || item.price}/quintal</p>
                        </div>
                    </div>
                ))}
            </div>
            ):section=== 'requests' ? (
                <div className="storage-requests">
                    <h3>Pending Requests ({storageRequests.length})</h3>
                    <div className="request-cards">
                        {storageRequests.map(request => (
                        <div key={request._id} className="request-card">
                            <div className="user-info">
                            <h4>{request.request_sent_username}</h4>
                            <p>📞 {request.request_sent_user_contact_no || "Not Provided"}</p>
                            <p>📍 {request.request_sent_user_address || "Address not available"}</p>
                            </div>
                            <div className="request-details">
                            <p>Storage: {request.storage?.name}</p>
                            <p>Price: ₹{request.storage?.price_per_quintal}/quintal/month</p>
                            <p>Quantity: {request.requested_storage_crop_quantity} kg</p>
                            <p>Duration: {request.duration} days</p>
                            <p>Start Date: {new Date(request.start_date).toLocaleDateString()}</p>
                            <div className="request-actions">
                                <button 
                                className="accept-btn"
                                onClick={async () => {
                                    try {
                                    await fetch(`http://localhost:5000/api/storage-requests/${request._id}`, {
                                        method: 'PUT',
                                        headers: {'Content-Type': 'application/json'},
                                        body: JSON.stringify({ status: 'accepted' })
                                    });
                                    const [newRequests, newBookings] = await Promise.all([
                                        fetch(`http://localhost:5000/api/storage-requests/${user._id}`).then(res => res.json()),
                                        fetch(`http://localhost:5000/api/active-storage-bookings/${user._id}`).then(res => res.json())
                                      ]);
                                      setStorageRequests(Array.isArray(newRequests) ? newRequests : []);
                                      setActiveBookings(Array.isArray(newBookings) ? newBookings : []);
                                    } catch (error) {
                                    console.error('Accept error:', error);
                                    }
                                }}
                                >
                                Accept
                                </button>
                                <button
                                className="decline-btn"
                                onClick={async () => {
                                    try {
                                        const response = await fetch(
                                            `http://localhost:5000/api/storage-requests/${request._id}`,
                                            { method: 'DELETE' }
                                          );
                                          
                                          if (!response.ok) throw new Error('Failed to delete request');
                                          
                                          // Refresh requests after successful deletion
                                          const newRequests = await fetch(
                                            `http://localhost:5000/api/storage-requests/${user._id}`
                                          ).then(res => res.json());
                                          
                                          setStorageRequests(Array.isArray(newRequests) ? newRequests : []);
                                    } catch (error) {
                                    console.error('Decline error:', error);
                                    }
                                }}
                                >
                                Decline
                                </button>
                            </div>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            ): section ==='bookings' ?(
                <div className="active-bookings">
                    <h3>Active Bookings ({activeBookings.length})</h3>
                    <div className="booking-cards">
                    {activeBookings.map(booking => (
                    <div key={booking._id} className="booking-card">
                        <div className="user-details">
                        <h4>{booking.crop_owner_name || "Unknown Owner"}</h4>
                        <p>Contact: {booking.crop_owner_id?.profile?.contact_number||"Not provided" }</p>
                        <p>Address: {booking.crop_owner_id?.profile?.address||"Location not available"}</p>
                        </div>
                        <hr className="divider" />
                        <div className="booking-info">
                        <p>🕑 Duration: {booking.storage_period} days</p>
                        <p>📅 Period: {new Date(booking.crop_storage_start_date).toLocaleDateString()} - 
                            {new Date(booking.crop_storage_end_date).toLocaleDateString()}</p>
                        <p>⚖️ Quantity: {booking.crop_quantity} kg</p>
                        <p>🏭 Storage: {booking.storage_id?.name || "Unknown Storage"}</p>
                        <div className="total-rent">
                            💰 Total Rent: ₹{booking.total_rent.toFixed(2) || "0.00"}
                        </div>
                        </div>
                    </div>
                    ))}
                    </div>
                </div>
            ):null}
                
        </>
    )

    return(
        <div className="dashboard">
            {showLogoutConfirmation && (
                <div className="logout-confirmation-overlay">
                    <div className="logout-confirmation-card">
                        <h3>Confirm Logout</h3>
                        <div className="confirmation-buttons">
                            <button className="confirm-button" onClick={handleLogout}>Yes</button>
                            <button className="cancel-button" onClick={() => setShowLogoutConfirmation(false)}>No</button>
                        </div>
                    </div>
                </div>
            )}
            {isLoggingOut && (
                <div className="logout-loader-overlay">
                    <div className="logout-loader-container">
                        <div className="reverse-spinner"></div>
                        <div className="loader-text">Securing Storage...</div>
                    </div>
                </div>
            )}

        <div className="Sidebar-container"><Sidebar onProfileClick={()=>setActiveSection('profile')} onHomeClick={() => setActiveSection(null)}
                    setActiveSection={setActiveSection} isStorageDashboard={isStorageDashboard} storageRequests={storageRequests}/></div>
        <main className={showLoader ? "blur-effect" : ""}>
            <nav>
                <h1>Welcome {user?.username},</h1>
                <button 
                        className="logout-btn"
                        onClick={() => setShowLogoutConfirmation(true)}
                    >
                        Logout
                    </button>
            </nav>
            <div className="storage_dashboard_container">
                {activeSection === 'profile' ? (
                    <Profile setActiveSection={setActiveSection}/>
                ) : activeSection==='facility'? (
                    <div className={`section-container ${activeSection}-section active`}>
                        <StorageDetails setActiveSection={setActiveSection} />
                    </div>
                
            ): activeSection==='requests'?(
                <>
                {activeSection==='requests' && renderSectionContent(storageRequests,'requests')}
                </>
            ):activeSection==='bookings'?(
                <>
                    {activeSection==='bookings' && renderSectionContent(activeBookings,'bookings')}
                </>
            ): activeSection? (
                    <div className={`section-container ${activeSection}-section active`}>
                        {activeSection==='available-crops' && renderSectionContent(availableCrops,'available-crops')}
                    </div>
                    
                ):(
                <>
                <div className="dashboard-cards">
                    {dashboardCards.map((card) => (
                        <div key={card.target} className="dashboard-card">
                            <h3>{card.title}</h3>
                            <p>{card.description}</p>
                            <a 
                                href="#" 
                                className="view-link"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveSection(activeSection === card.target ? null : card.target);
                                }}
                            >
                                {activeSection === card.target ? "Hide Details" : "View Details"}
                            </a>
                        </div>
                    ))}
                </div>
                </>)}
            </div>
            
            
        </main>
    </div>

    )
}

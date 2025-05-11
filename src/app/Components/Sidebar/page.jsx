"use client";
import "./Sidebar.css";
import Link from "next/link";
import Image from "next/image";
import { useState,useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function Sidebar({isStorageDashboard=false, onProfileClick,contractRequests=[],setActiveSection ,requestCount = 0,dealerNeedsCount=0,storageRequests=[]}) {
    const [isSidebarVisible, setSidebarVisible] = useState(false);

    const toggleSidebar = () => {
        console.log('Toggle Sidebar Clicked');
        setSidebarVisible(!isSidebarVisible);
        console.log('Sidebar Visible:', !isSidebarVisible);
    };

    const handleHomeClick = () => {
        setActiveSection(null);
    };

    return (
        <div>
            {!isSidebarVisible && (
                <div className="sidebar-logo" onClick={toggleSidebar}>
                    <Image src="/Assets/logo.png" width={70} height={50} alt="Logo" className="sidebar-image" priority/>
                </div>
            )}
            <div className={`sidebar ${isSidebarVisible ? 'visible' : 'hidden'}`}>
                <div className="sidebar-head" onClick={toggleSidebar}>
                    <Image src="/Assets/logo.png" width={70} height={50} alt="Logo" className="sidebar-image" priority/>
                    <h1>Farmers Friend</h1>
                </div>
                <div className="sidebar-links">
                    <Link href="#" onClick={handleHomeClick}>Home</Link>
                    <Link href="#" 
                        onClick={(e) => {
                            e.preventDefault();
                            onProfileClick();  // Trigger the callback
                        }}>Profile</Link>

                        {!isStorageDashboard && (
                        <Link href="#" onClick={() => setActiveSection('dealer-needs')}>
                            Dealer Needs
                            {dealerNeedsCount > 0 && 
                                <span className="notification-badge">{dealerNeedsCount}</span>}
                            </Link>)}
                    {!isStorageDashboard ?(<Link href="#" onClick={() => setActiveSection('requests')}>
                    Requests {contractRequests.length > 0 && <span className="request-badge">{contractRequests.length}</span>}
                    </Link>):
                    (<Link href="#" onClick={() => setActiveSection('requests')}>
                    Storage Requests 
                    {storageRequests.length > 0 && ( 
                      <span className="request-badge">{storageRequests.length}</span>
                    )}
                  </Link>)
                    }
                <Link href="#" onClick={() => setActiveSection('available-crops')}>View Available Crops</Link>
                {!isStorageDashboard && (
                    <Link href="#" onClick={()=>setActiveSection('available-storages')}>View Available Storages</Link>
                )}
                </div>
            </div>
            <main className={isSidebarVisible ? 'no-padding' : ''}>
                {/* Main content goes here */}
            </main>
        </div>
    );
}
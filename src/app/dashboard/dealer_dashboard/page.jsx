"use client"
import { useState,useEffect} from "react";
import "./d_dashboard.css";
import { useRouter } from "next/navigation";
import Sidebar from "../../Components/Sidebar/page";
import { LineChart } from "@mui/x-charts/LineChart";
import { useAuth } from "@/app/context/AuthContext";
import Profile from '../../Components/Profile/page';
import Image from 'next/image';
import DealerNeedForm from '../../Components/DealerNeedForm/DealerNeedForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

const marketData = Array.from({length: 12}, (_, i) => ({
  month: new Date(2023, i, 1).toLocaleString('default', { month: 'short' }),
  price: 13000 + (Math.random() * 5000 - 2500)
}));

export default function Dashboard() {
  const router=useRouter();
  const { user,logout } = useAuth();
  const [activeSection, setActiveSection] = useState(null);
  const [contractRequests, setContractRequests] = useState([]);
  const [availableCrops, setAvailableCrops] = useState([]);
  const [userContracts, setUserContracts] = useState([]);
  const [storageBookings, setStorageBookings]=useState([]);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [requestedCrops, setRequestedCrops]=useState(new Set());
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showNeedForm, setShowNeedForm] = useState(false);
  const [userNeeds, setUserNeeds] = useState([]);
  const [editingNeed, setEditingNeed] = useState(null);
  const [needFormData, setNeedFormData] = useState({
    crop_needed: '',
    variety: '',
    quantity: '',
    price: ''
  });
  const [availableStorages, setAvailableStorages] = useState([]);
  const [storageRequestData, setStorageRequestData] = useState({
    quantity: '',
    duration: '',
    startDate: ''
  });
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [isLoadingStorages, setIsLoadingStorages] = useState(false);
const [storageRequestsSent, setStorageRequestsSent] = useState(new Set());
const [storageRequestSuccess, setStorageRequestSuccess] = useState(false);
const [dealerBookings, setDealerBookings] = useState([]);


useEffect(() => {
    const fetchUserNeeds = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/user-needs?userId=${user?._id}`);
        const data = await res.json();
        setUserNeeds(data);
      } catch (error) {
        console.error("Error fetching user needs:", error);
      }
    };
    if (user?._id) fetchUserNeeds();
  }, [user, formSuccess]);
  
  useEffect(() => {
    const fetchDealerBookings = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/active-storage-bookings/${user._id}`);
        const data = await response.json();
        setDealerBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
    
    if (user?._id && activeSection === 'storage') fetchDealerBookings();
  }, [user, activeSection]);

    const fetchAvailableStorages = async () => {
      setIsLoadingStorages(true);
      try {
        const response = await fetch('http://localhost:5000/api/available-storages');
        const data = await response.json();
        setAvailableStorages(Array.isArray(data)?data:[]);
      } catch (error) {
        console.error("Error fetching storages:", error);
        setAvailableStorages([]);
      }finally{
        setIsLoadingStorages(false);
      }
    };
  useEffect(() => {
    if (activeSection === 'available-storages') fetchAvailableStorages();
  }, [activeSection]);
  
  const handleStorageRequest = async (storageId) => {
    try {
      console.log("Sending storage request:", {
        storageId,
        ...storageRequestData
      });
      const response=await fetch('http://localhost:5000/api/storage-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          storageId,
          quantity: storageRequestData.quantity,
        duration: storageRequestData.duration,
        startDate: storageRequestData.startDate
        })
      });
      if (!response.ok) {
        throw new Error('Failed to send storage request');
      }
  
      setStorageRequestsSent(prev => new Set([...prev, storageId]));
      setStorageRequestSuccess(true);
      setStorageRequestData({ quantity: '', duration: '', startDate: '' });
      setSelectedStorage(null);
      
      setTimeout(() => setStorageRequestSuccess(false), 3000);
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  const handleNeedSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError('');
    setFormSuccess(false);

    try {
      if (!needFormData.crop_needed?.trim() || !needFormData.quantity || !needFormData.price) {
        throw new Error("All fields are required");
      }

      if (!user?._id) {
        throw new Error("User authentication failed");
      }

      const endpoint = editingNeed 
        ? `http://localhost:5000/api/user-needs/${editingNeed._id}`
        : 'http://localhost:5000/api/user-needs';
        
      const response = await fetch(endpoint, {
        method: editingNeed ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...needFormData,
          user: user._id,
          contact_number: user.contact_number
        })
      });

      const text = await response.text();
      console.log('Raw server response:', text);

      let data;
      try {
        if (text && text.trim()) {
          data = JSON.parse(text);
        } else {
          data = {};
        }
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error(`Server response error: ${parseError.message}`);
      }

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status} ${response.statusText}`);
      }
  
      setFormSuccess(true);
      setFormError('');
      
      const needsRes = await fetch(`http://localhost:5000/api/user-needs/${user._id}`);
      if (needsRes.ok) {
        const needsData = await needsRes.json();
        setUserNeeds(needsData);
      }

      setTimeout(() => {
        setShowNeedForm(false);
        setEditingNeed(null);
        setNeedFormData({ 
          crop_needed: '', 
          variety: '', 
          quantity: '', 
          price: '' 
        });
      }, 1000);

    } catch (error) {
      console.error("Submission error:", error);
      setFormError(error.message);
      setFormSuccess(false);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleInputChange = (e) => {
    setNeedFormData({ ...needFormData, [e.target.name]: e.target.value });
  };
  

    const fetchData=async()=>{
      try{
        const [cropsRes,requestRes,storageRes,contractsRes] = await Promise.all([
          fetch('http://localhost:5000/api/user-crops'),
          fetch(`http://localhost:5000/api/contract-requests/${user?._id}`),
          fetch(`http://localhost:5000/api/storage-bookings/${user?._id}`),
          fetch(`http://localhost:5000/api/active-contracts/${user?._id}`)
        ]);
        const cropsData= await cropsRes.json();
        const requestsData =await requestRes.json();
        const storageData=await storageRes.json();
        const contractsData= await contractsRes.json();

        setAvailableCrops(cropsData);
        setContractRequests(requestsData);
        setStorageBookings(storageData);
        setUserContracts(contractsData);

      }catch(error){
        console.log("Error fetching data:",error);
      }
    };
useEffect(()=>{
    if(user?._id) fetchData();
  },[user]);
  
  useEffect(() => {
    const fetchAvailableCrops = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/user-crops');
        const data = await response.json();
        const cropsWithRequests = await Promise.all(
          data.map(async crop => {
            const res = await fetch(`http://localhost:5000/api/check-request?` +  new URLSearchParams({
              sentBy: user?._id,
              sentTo: crop.user?._id,
              cropId: crop._id
            }));
            const { exists } = await res.json();
            return { ...crop, isRequested: exists };
          })
        );
        setAvailableCrops(cropsWithRequests);
      } catch (error) {
        console.error("Error fetching available crops:", error);
        setAvailableCrops([]);
      }
    };
    if(activeSection === 'available-crops') fetchAvailableCrops();
  }, [activeSection, user]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeSection === 'contracts' || activeSection === 'available-crops') {
        fetchData();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [activeSection]);

  const handleHomeClick = () => setActiveSection(null);

  const handleContractRequest = async (crop) => {
      if(requestedCrops.has(crop._id)) return;
      try{
        const response= await fetch('http://localhost:5000/api/contract-requests',
          {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
              contract_sent_user:user._id,
              contract_sent_to_user:crop.user._id,
              crop:crop._id
            })
          }
        );
        if(response.ok) {
          // Update both requestedCrops and availableCrops states
          setRequestedCrops(prev => new Set([...prev, crop._id]));
          setAvailableCrops(prev => prev.map(c => 
            c._id === crop._id ? { ...c, isRequested: true } : c
          ));
          
          // Refresh contract requests
          const requestsRes = await fetch(`http://localhost:5000/api/contract-requests/${user._id}`);
          setContractRequests(await requestsRes.json());
        }
      }catch(error){
        console.error("Error creating contract request:",error);
      }
    };

  const handleRequestAction = async (requestId, action) => {
    try {
      const response = await fetch(`http://localhost:5000/api/contract-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action })
      });
      
      if(response.ok) {
        // Properly filter the deleted request
        setContractRequests(prev => prev.filter(r => r._id !== requestId));
        
        if (action === 'accepted') {
          // Refresh both contracts and crops
          const [contractsRes, cropsRes] = await Promise.all([
            fetch(`http://localhost:5000/api/active-contracts/${user._id}`),
            fetch('http://localhost:5000/api/user-crops')
          ]);
          const request = contractRequests.find(r => r._id === requestId);
          if (request.crop) {
            setAvailableCrops(prev => 
              prev.filter(c => c._id !== request.crop._id)
            );
          }
          
          setUserContracts(await contractsRes.json());
          setAvailableCrops(await cropsRes.json());
        }
      }
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
      router.push("/");
    }, 1000);
  };

  const dashboardCards = [
    {
        title: "Active Contracts",
        description: "View and manage your ongoing purchase agreements",
        target: "contracts",
        color: "#8b5a2b"
    },
    {
        title:"Storage Bookings",
        description:"Access your storage facility details",
        target:"storage",
        color:"#a87d52"
      },
      {
        title:"Market Analysis",
        description:"View recent market analysis and price trends",
        target:"market",
        color:"#a87d64"
      }
  ];

  const renderSectionContent = (items, section) => (
    <div className="section-container">
      <div className="section-header">
        <h2 className="section-heading">
          {section === 'available-crops' ? 'Available Crops' : 
           section === 'contracts' ? 'Active Contracts' : 
           section === 'storage' ? 'Storage Bookings' : 
           section==='needs' ? 'Dealer Needs':
           section==='requests'? 'Recieved Contract Requests':
           section==='available-storages'?"Available Storages": 'Market Analysis'}
        </h2>
        <button 
          className="close-section"
          onClick={() => setActiveSection(null)}
        >
          ✕
        </button>
      </div>
      {section === 'needs' && userNeeds.map(need => (
        <div key={need._id} className="need-card">
          <h3>{need.crop_needed} - {need.variety}</h3>
          <div className="need-meta">
            <p>Quantity: {need.quantity} kg</p>
            <p>Price: ₹{need.price}/quintal</p>
            <p>Contact: {need.contact_number}</p>
            <p>Created: {new Date(need.created_at).toLocaleDateString()}</p>
          </div>
          <div className="need-actions">
            <button 
              className="btn accept-btn"
              onClick={() => {
                setEditingNeed(need);
                setNeedFormData({
                  crop_needed: need.crop_needed,
                  variety: need.variety,
                  quantity: need.quantity,
                  price: need.price
                });
                setShowNeedForm(true);
              }}
            >
              Edit
            </button>
            <button
              className="btn decline-btn"
              onClick={async () => {
                await fetch(`http://localhost:5000/api/user-needs/${need._id}`, {
                  method: 'DELETE'
                });
                setUserNeeds(prev => prev.filter(n => n._id !== need._id));
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
      {section === 'requests' && (
        <div className="cards-list">
          {contractRequests.map(request => (
            <div key={request._id} className="contract-request-card">
              <div className="card-content">
                <div className="card-details">
                  <h3>{request.crop?.crop_name || request.need?.crop_needed}</h3>
                  <div className="farmer-details">
                    <p>Farmer: {request.contract_sent_user?.username}</p>
                    <p>Contact: {request.contract_sent_user?.contact_number}</p>
                    <p>Location: {request.contract_sent_user?.profile?.district}, {request.contract_sent_user?.profile?.state}</p>
                  </div>
                  <p>Variety: {request.crop?.crop_variety || request.need?.variety}</p>
                  <p>Quantity: {request.crop?.quantity || request.need?.quantity} kg</p>
                  <p>Price: ₹{request.crop?.price_per_quintal || request.need?.price}/quintal</p>
                </div>
                <div className="request-actions">
                  <button 
                    className="btn accept-btn"
                    onClick={() => handleRequestAction(request._id, 'accepted')}
                  >
                    Accept
                  </button>
                  <button
                    className="btn decline-btn"
                    onClick={() => handleRequestAction(request._id, 'declined')}
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {section === 'market' ? (
        <div className="market-analysis">
          <LineChart
            width={600}
            height={350}
            margin={{ top: 30, bottom: 70, left: 60, right: 30 }}
            series={[{ 
              data: marketData.map(d => d.price), 
              label: 'Price per Quintal (₹)', 
              showMark: true,
              color:'#6b4423',
              curve:'natural'
            }]}
            xAxis={[{ 
              scaleType:'point',
              data: marketData.map(d => d.month),
              label: 'Months',
              labelStyle: { fontSize: 14, fill: '#6b4423', fontWeight: 'bold' },
              tickLabelStyle: { fill: '#6b4423' },
              axisLine: { stroke: '#6b4423', strokeWidth: 2 }
            }]}
            yAxis={[{
              label: 'Price (₹)',
              labelStyle: { fontSize: 14, fill: '#6b4423', fontWeight: 'bold' },
              tickLabelStyle: { fill: '#6b4423' },
              axisLine: { stroke: '#6b4423' }
            }]}
          />
        </div>
      ) : section === 'available-crops' ? (
        <div className="cards-list">
          {availableCrops.map((crop) => (
            <div key={crop._id} className="card">
              <div className="card-content">
                <div className="card-details">
                  <h3>{crop.crop_name}</h3>
                  <div className="farmer-details">
                    <p className="farmer-name">
                      {crop.profile?.first_name} {crop.profile?.last_name}
                    </p>
                    <p className="farmer-location">
                      {crop.profile?.district}, {crop.profile?.state}
                    </p>
                  </div>
                  <p>Variety: {crop.crop_variety}</p>
                  <p>Quantity: {crop.quantity} kg</p>
                  <p>Price: ₹{crop.price_per_quintal}/quintal</p>
                </div>
                <button 
                  className={`btn request-btn ${crop.isRequested ? 'sent' : ''}`}
                  onClick={() => handleContractRequest(crop)}
                  disabled={crop.isRequested}
                >
                  {crop.isRequested ? 'Request Sent ✅' : 'Request Contract'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : section === 'contracts' ? (
        <div className="cards-list">
          {userContracts.length>0 ? (
            userContracts.map((contract) => (
              <div key={contract._id} className={`contract-card ${contract.contract_type === 'dealer-need' ? 'dealer-need' : ''}`}>
                <div className="card-content">
                  <div className="card-details">
                    <h3>{contract.crop_name} Contract</h3>
                    <div className="contract-meta">
                      <p className="contract-party">
                        {user.account_type === 'farmer' ? (
                          <>Dealer: {contract.dealer?.username || 'Unknown Dealer'}</>
                        ) : (
                          <>Farmer: {contract.producer?.username || 'Unknown Farmer'}</>
                        )}
                      </p>
                      <p>Variety: {contract.crop_variety}</p>
                      <p>Price: ₹{contract.price_per_quintal}/quintal</p>
                      <p>Quantity: {contract.contract_id?.crop?.quantity || contract.quantity || contract.crop?.quantity ||'N/A'} kg</p>
                      <p className="contract-date">
                        Established: {new Date(contract.contract_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="contract-status">
                    <p>Contract ID: {contract._id}</p>
                    <span className="status-active">Active</span>
                  </div>
                </div>
                {contract.contract_type === 'dealer-need' && (
                  <div className="contract-tag">
                    <span className="tag dealer-need-tag">Dealer Need Contract</span>
                  </div>
                )}
              </div>
            ))) : (
              <div className="no-contracts">
                <p>No active contracts found</p>
              </div>
            )}
        </div>
      ) : section === 'available-storages' ? ( isLoadingStorages ? (<div className="loader-container">
        <div className="loading-spinner"></div>
        <p>Loading storage facilities...</p>
      </div>):(
        <div className="storage-cards">
          {availableStorages.length===0 ? (
            <p className="no-storages">No storage facilities available</p>
          ):(
          Array.isArray(availableStorages) && availableStorages.map(storage => (
            <div key={storage._id} className="storage-card">
              <h3>{storage.name || 'Unnamed Storage'}</h3>
              <p>Owner: {storage.user?.username || 'Unknown'}</p>
              <p>Location: {storage.location?.address|| 'Location Not Specified'}</p>
              <div className={`status-indicator ${storage.booking_status.replace(' ', '-').toLowerCase()}`}>
                {storage.booking_status}
              </div>
              
              {selectedStorage === storage._id ? (
                <div className="storage-request-form">
                  <input type="number" placeholder="Quantity (kg)"
                    value={storageRequestData.quantity}
                    onChange={e => setStorageRequestData({...storageRequestData, quantity: e.target.value})}
                  />
                  <input type="date" 
                    value={storageRequestData.startDate}
                    onChange={e => setStorageRequestData({...storageRequestData, startDate: e.target.value})}
                  />
                  <input type="number" placeholder="Duration (days)"
                    value={storageRequestData.duration}
                    onChange={e => setStorageRequestData({...storageRequestData, duration: e.target.value})}
                  />
                  <div className="storage-request-buttons">
                    <button onClick={() => handleStorageRequest(storage._id)}>
                      Send Request
                    </button>
                    <button 
                      className="cancel-button"
                      onClick={() => setSelectedStorage(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setSelectedStorage(storage._id)}  disabled={storageRequestsSent.has(storage._id)}>
                 {storageRequestsSent.has(storage._id) ? "Request Sent ✅" : "Request Storage"}
                </button>
              )}
            </div>
          )))}
        </div>
        )
      ):section==='storage' ?(
        <div className="dealer-bookings">
          <h3>Active Storage Bookings ({dealerBookings.length})</h3>
          <div className="booking-cards">
            {dealerBookings.map(booking => (
              <div key={booking._id} className="dealer-booking-card">
                <div className="user-details">
                  <h4>{booking.storage_id?.name || "Unknown Storage"}</h4>
                  <p>📍 {booking.storage_id?.location?.address}</p>
                </div>
                <div className="booking-info">
                  <p>🕑 Duration: {booking.storage_period} days</p>
                  <p>📅 Period: {new Date(booking.crop_storage_start_date).toLocaleDateString()} - 
                    {new Date(booking.crop_storage_end_date).toLocaleDateString()}</p>
                  <p>⚖️ Quantity: {booking.crop_quantity} kg</p>
                  <div className="total-rent">
                    💰 Total Rent: ₹{booking.total_rent?.toFixed(2) || "0.00"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ):(
        items.map((item) => (
          <div key={item._id} className="card">
            <div className="card-content">
              <div className="card-details">
                <h3>{item.name || item.facilityType}</h3>
                {item.contractDate && <p className="contract-date">Contract Date:{item.contractDate}</p>}
                <p>{item.variety || item.storageDetails}</p>
                <p>{item.quantity || item.capacity}</p>
                <p>₹{item.price || item.cost}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

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

      {showNeedForm && (
        <DealerNeedForm
          editingNeed={editingNeed}
          needFormData={needFormData}
          handleInputChange={handleInputChange}
          handleNeedSubmit={handleNeedSubmit}
          isSaving={isSaving}
          formError={formError}
          formSuccess={formSuccess}
          setShowForm={setShowNeedForm}
          setEditingNeed={setEditingNeed}
        />
      )}

      {isLoggingOut && (
        <div className="logout-loader-overlay">
          <div className="logout-loader-container">
            <div className="reverse-spinner"></div>
            <div className="loader-text">Securing Contracts...</div>
          </div>
        </div>
      )}

      <div className="sidebar-container">
        <Sidebar 
          onProfileClick={()=>setActiveSection('profile')} 
          contractRequests={contractRequests} 
          setActiveSection={setActiveSection} 
          onHomeClick={handleHomeClick}
          requestCount={contractRequests.length}
        />
      </div>

      <main className={`main-content ${activeSection ? 'has-active-section' : ''}`}>
        <nav className="dashboard-nav">
          <h1 className="dashboard-title">Welcome, {user?.username}</h1>
          <button 
            className="logout-btn"
            onClick={() => setShowLogoutConfirmation(true)}
          >
            Logout
          </button>
        </nav>
        
        <div className="dashboard-content">
          {activeSection==='profile' ? (
            <Profile setActiveSection={setActiveSection} />
          ) : activeSection ? (
            renderSectionContent(
              activeSection === 'contracts' ? userContracts :
              activeSection === 'storage' ? storageBookings : [],
              activeSection
            )
          ) : (
            <>
              <div className="contract-actions">
                <button
                  className="btn view-btn"
                  onClick={() => setShowNeedForm(true)}
                >
                  <Image src="/Assets/Add.gif" width={28} height={24} alt="Add" />
                  Create New Contract
                </button>
                <button
                  className="btn view-contracts-btn"
                  onClick={() => setActiveSection('needs')}
                >
                  <FontAwesomeIcon icon={faEye} style={{ marginRight: '8px' }} />
                  View Contracts
                </button>
              </div>
              <div className="dashboard-cards">
                {dashboardCards.map((card) => (
                  <div key={card.target} className="dashboard-card">
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                    <button
                      className="btn view-btn"
                      onClick={() => setActiveSection(card.target.toLocaleLowerCase())}
                    >
                      {activeSection === card.target ? "Close" : "View Details"}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
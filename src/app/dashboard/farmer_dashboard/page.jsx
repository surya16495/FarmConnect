"use client"
import { useState, useEffect } from "react";
import {memo} from 'react';
import Image from "next/image";
import {useRouter} from "next/navigation";
import "./f_dashboard.css";
import Sidebar from "../../Components/Sidebar/page";
import { useAuth } from "@/app/context/AuthContext";
import Profile from '../../Components/Profile/page';

const AddCropForm = ({
  editingCrop,
  cropFormData,
  handleInputChange,
  handleCropSubmit,
  isSavingCrop,
  handleEditCrop,
  formError,formSuccess,
  setShowAddCropForm,
  setEditingCrop,
  setFormError
}) => {
    
  return(
    
  <div className="form-overlay">
    <div className="crop-form-container">
      <button className="close-form" onClick={() =>{ setShowAddCropForm(false); setEditingCrop(null);}} type="button"><span className="close-icon">×</span></button>
      <h2>{editingCrop ? 'Edit Crop': 'Add New Crop'}</h2>
      <form onSubmit={editingCrop ? handleEditCrop :handleCropSubmit}>
        <div className="form-group">
          <label htmlFor="crop_name">Crop Name</label>
          <input type="text" required id="crop_name" name="crop_name"
            value={cropFormData.crop_name}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="crop_variety">Crop Variety</label>
          <input
            type="text" id="crop_variety" name="crop_variety"
            required
            value={cropFormData.crop_variety}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="quantity">Quantity (kg)</label>
          <input
            type="number" id="quantity" name="quantity"
            required min="1"
            value={cropFormData.quantity}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="price_per_quintal">Price per Quintal (₹)</label>
          <input
            type="number" id="price_per_quintal" name="price_per_quintal"
            required min="1"
            value={cropFormData.price_per_quintal}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-button-container">
          <button type="submit" className="view-link submit-button">
            {isSavingCrop ? (
              <div className="form-spinner"></div>
            ) : formSuccess ? (
              <span className="success-check">✓</span>
            ) : (
              editingCrop ? "Update Crop" : "Add +"
            )}
          </button>
        </div>
        {formSuccess && (
        <div className="form-success-message">
          {editingCrop ? 'Crop updated successfully!' : 'Crop added successfully!'}
        </div>
      )}
      {formError && (
      <div className="form-error-message">
        ❌ {formError}
      </div>
    )}
      </form>
    </div>
    
  </div>
  );
};


export default function Dashboard() {
  const router=useRouter();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const {user,logout}= useAuth();
  const [activeSection, setActiveSection] = useState(null);
  const [isLoading, setIsLoading]= useState(false);
  const [showLoader, setShowLoader]=useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showAddCropForm, setShowAddCropForm] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
const [userCrops, setUserCrops] = useState([]);
const [editingCrop, setEditingCrop] = useState(null);
const [availableCrops, setAvailableCrops] = useState([]);
const [contractRequests, setContractRequests] = useState([]);
const [isSavingCrop, setIsSavingCrop] = useState(false);
const [contracts, setContracts] = useState([]);
const [cropFormData, setCropFormData] = useState({
  crop_name: '',
  crop_variety: '',
  quantity: '',
  price_per_quintal: ''
});
const [formError, setFormError] = useState('');
const [userContracts, setUserContracts] = useState([]);
const [storageBookings, setStorageBookings] = useState([]);
const [requestedCrops, setRequestedCrops] = useState(new Set());
const [showNeedForm, setShowNeedForm] = useState(false);
const [userNeeds, setUserNeeds] = useState([]);
const [editingNeed, setEditingNeed] = useState(null);
const [availableNeeds, setAvailableNeeds] = useState([]);
const [needFormData, setNeedFormData] = useState({
  crop_needed: '',
  variety: '',
  quantity: '',
  price: ''
});
const [availableStorages, setAvailableStorages] = useState([]);
const [selectedStorage, setSelectedStorage] = useState(null);
const [storageRequestData, setStorageRequestData] = useState({
  quantity: '',
  duration: '',
  startDate: ''
});
const [isLoadingStorages, setIsLoadingStorages] = useState(false);
const [storageRequestsSent, setStorageRequestsSent] = useState(new Set());
const [storageRequestSuccess, setStorageRequestSuccess] = useState(false);
const [farmerBookings, setFarmerBookings] = useState([]);


useEffect(() => {
  const fetchFarmerBookings = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/active-storage-bookings/${user._id}`);
      const data = await response.json();
      setFarmerBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };
  
  if (user?._id && activeSection === 'storage') fetchFarmerBookings();
}, [user, activeSection]);

const fetchAvailableStorages = async () => {
  setIsLoadingStorages(true);
  try {
    const response = await fetch('http://localhost:5000/api/available-storages');
    const data = await response.json();
    setAvailableStorages(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Error fetching storages:", error);
    setAvailableStorages([]);
  }finally{
    setIsLoadingStorages(false);
  }
};

useEffect(() => {
  if (activeSection === 'available-storages') {
    fetchAvailableStorages();
  }
}, [activeSection]);


const handleStorageRequest = async (storageId) => {
  try {
    console.log("Sending storage request:", {
      storageId,
      ...storageRequestData
    });

    const response = await fetch('http://localhost:5000/api/storage-requests', {
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

    // Update state
    setStorageRequestsSent(prev => new Set([...prev, storageId]));
    setStorageRequestSuccess(true);
    setStorageRequestData({ quantity: '', duration: '', startDate: '' });
    setSelectedStorage(null);
    
    setTimeout(() => setStorageRequestSuccess(false), 3000);
  } catch (error) {
    console.error("Request failed:", error);
    setFormError(error.message);
  }
};

  const fetchData = async () => {
    try {
      const [cropsRes, requestsRes,storageRes,contractsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/user-crops/${user?._id}`),
        fetch(`http://localhost:5000/api/contract-requests/${user?._id}`),
        fetch(`http://localhost:5000/api/storage-bookings/${user?._id}`),
        fetch(`http://localhost:5000/api/active-contracts/${user?._id}`),
      ]);
      
      const cropsData = await cropsRes.json();
      const requestsData = await requestsRes.json();
      const storageData = await storageRes.json();
      const contractsData=await contractsRes.json();
      
      setUserCrops(cropsData);
      setContractRequests(requestsData);
      setStorageBookings(storageData);
      setContracts(contractsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
  if(user?._id) fetchData();
  const interval = setInterval(() => {
    if (activeSection === 'contracts' || activeSection === 'available-crops') {
      fetchData();
    }
  }, 30000);
  return () => clearInterval(interval);
}, [user,activeSection]);

useEffect(() => {
  const fetchAvailableCrops = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/user-crops');
      const data = await response.json();
      const cropsWithRequests = await Promise.all(
        data.map(async crop => {
          const res = await fetch(`http://localhost:5000/api/check-request?` + 
            new URLSearchParams({
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
      setFormError('Failed to fetch crops. Please try again.');
      setAvailableCrops([]);
    }
  };
  if (user?._id) fetchAvailableCrops();
}, [user,formSuccess,contractRequests]);

useEffect(() => {
    const fetchAvailableNeeds = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/user-needs');
        if (!response.ok) throw new Error('Failed to fetch needs');
        const data = await response.json();
        const dealerNeeds = data.filter(need => 
          need.user?.account_type === 'dealer'
        );
        const needsWithRequests = await Promise.all(
          dealerNeeds.map(async (need) => {
            const res = await fetch(`http://localhost:5000/api/check-request?` + 
              new URLSearchParams({
                sentBy: user?._id,
                sentTo: need.user?._id,
                needId: need._id
              }));
            const { exists } = await res.json();
            return { ...need, isRequested: exists };
          })
        );
        setAvailableNeeds(needsWithRequests);
  
      } catch (error) {
        console.error("Error fetching available needs:", error);
        setAvailableNeeds([]);
      }
    };
  
    if (user?.account_type === 'farmer') {
      fetchAvailableNeeds();
    }
  }, [user,formSuccess, contractRequests]);
  

  useEffect(() => {
    // Extract crop IDs from contract requests to initialize requestedCrops
    const requestedIds = new Set(
      contractRequests.map(req => req.crop?._id || req.crop)
    );
    setRequestedCrops(requestedIds);
  }, [contractRequests]);

// Refresh data every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    if (activeSection === 'contracts' || activeSection === 'available-crops') {
      fetchData();
    }
  }, 30000);
  return () => clearInterval(interval);
}, [activeSection]);

  const handleViewDetails = (target) => {
    setShowLoader(true);
    setIsLoading(true);
    setActiveSection(target);
    setTimeout(() => {
      setShowLoader(false);
      setIsLoading(false);
    }, 500); // 2 second loader display
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
      window.location.href = "/";
    }, 1000);
  };

  const dashboardCards=[
    {
      title: "Crops Inventory",
      description: "Manage your current crops, View and update harvest details",
      target: "crops",
      color: "#ffffff"
    },
    {
      title:"Active Contracts",
      description:"Review your ongoing agreements with buyers. Monitor contract terms and quantities.",
      target:"contracts",
      color:"#ffffff"
    },
    {
      title:"Storage Bookings",
      description:"Acess your storage facility details. check reservation dates, capacity and maintanance schedules.",
      target:"storage",
      color:"#ffffff"
    } ,{
        title: "Dealer Needs",
        description: "View dealer purchase requirements and send contract offers",
        target: "dealer-needs",
        color: "#ffffff"
      }
  ]
 
  const handleNeedRequest = async (need) => {
    try {
      const normalizedNeedCrop = need.crop_needed.toLowerCase().trim();
    const requiredQuantity = parseInt(need.quantity);

    // Find matching crop with case-insensitive comparison
    const farmersCrop = userCrops.find(crop => {
      const normalizedCropName = crop.crop_name.toLowerCase().trim();
      const availableQuantity = parseInt(crop.quantity);
      
      return normalizedCropName === normalizedNeedCrop && 
             (availableQuantity >= requiredQuantity || availableQuantity <= requiredQuantity) ;
    });
      if (!farmersCrop) {
        throw new Error("You don't have matching crops in your inventory");
      }

      const response = await fetch('http://localhost:5000/api/contract-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_sent_user: user._id,
          contract_sent_to_user: need.user._id,
          need: need._id,
          crop:farmersCrop._id,
          status: 'pending'
        })
      });
      
      if (response.ok) {
        const requestsRes = await fetch(`http://localhost:5000/api/contract-requests/${user._id}`);
        setContractRequests(await requestsRes.json());
        setAvailableNeeds(prev => 
          prev.map(n => 
            n._id === need._id ? { ...n, isRequested: true } : n
          )
        );
        setFormSuccess(true);
      }
    } catch (error) {
      console.error("Error creating need request:", error);
      setFormError(error.message);
      setFormSuccess(false);
    }
  };


  const fetchUserCrops = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/user-crops/${user._id}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch crops');
      }

      const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error('Invalid response format');
    }
      
      const data = await response.json();
      setUserCrops(data);
    } catch (error) {
      console.error("Error fetching crops:", error);
      // Show error to user
    }
  };

  const handleCropSubmit = async (e) => {
    e.preventDefault();
    setIsSavingCrop(true);
    setFormError('');
    try {
      if (!user?._id) throw new Error("User authentication failed");
      if (!cropFormData.crop_name?.trim() || !cropFormData.quantity) {
        throw new Error("Crop name and quantity are required");
      }
      const endpoint = editingCrop ? `http://localhost:5000/api/user-crops/${editingCrop._id}` : 'http://localhost:5000/api/user-crops';
    const method = editingCrop ? 'PUT' : 'POST';
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cropFormData,
          user: user._id.toString()
        })
      });
      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Invalid server response");
      }
      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}`);
      }

    setFormSuccess(true);
    setFormError('');
    setTimeout(() => {
      setShowAddCropForm(false);
      fetchUserCrops();
      setCropFormData({
        crop_name: '',
        crop_variety: '',
        quantity: '',
        price_per_quintal: ''
      });
    }, 1000);
    
    } catch (error) {
      console.error("Submission error:", error);
      setFormError(error.message.replace('Error: ', ''));
      setFormSuccess(false);
    }finally {
      setIsSavingCrop(false);
    }
  };

  // Add this function inside the Dashboard component
const handleDeleteCrop = async (cropId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/user-crops/${cropId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete crop');
    }

    setUserCrops(prev => prev.filter(crop => crop._id !== cropId));
    setFormSuccess(true);
    setFormError('');
    setTimeout(() => setFormSuccess(false), 3000);
  } catch (error) {
    console.error("Delete error:", error);
    setFormError(error.message);
    setFormSuccess(false);
  }
};

  const handleContractRequest = async (crop) => {
    if(crop.user._id === user._id) {
      setFormError("Cannot send request to yourself");
      return;
    }
    try {
      setAvailableCrops(prev => 
        prev.map(c => 
          c._id === crop._id ? { ...c, isRequested: true } : c
        )
      );
      const response = await fetch('http://localhost:5000/api/contract-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_sent_user: user._id,
          contract_sent_to_user: crop.user._id,
          crop: crop._id
        })
      });
      if (!response.ok) {
        // Revert on error
        setAvailableCrops(prev => 
          prev.map(c => 
            c._id === crop._id ? { ...c, isRequested: false } : c
          )
        );
        throw new Error('Request failed');
      }
      const requestsRes = await fetch(`http://localhost:5000/api/contract-requests/${user._id}`);
      setContractRequests(await requestsRes.json());
    } catch (error) {
      console.error("Error creating contract request:", error);
      setFormError(error.message);
    // Revert UI state
    setAvailableCrops(prev => 
      prev.map(c => 
        c._id === crop._id ? { ...c, isRequested: false } : c
      )
    );
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      const response = await fetch(`http://localhost:5000/api/contract-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action })
      });
      if (response.ok) {
        const updatedRequests = contractRequests.filter(r => r._id !== requestId);
        setContractRequests(updatedRequests);
        if (action === 'accepted') {
          const request = contractRequests.find(r => r._id === requestId);
          setSuccessMessage(`Contract with ${request.contract_sent_user.username} accepted!`);
          setShowSuccessMessage(true);
          if (request.need) {
            setAvailableNeeds(prev => 
              prev.filter(n => n._id !== request.need._id)
            );
          }
          // Create active contract
          const contractRes = await fetch('http://localhost:5000/api/active-contracts', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
              contract_id: requestId,
              dealer: request.contract_sent_user._id,
              producer: user._id,
              crop_name: request.crop.crop_name,
              crop_variety: request.crop.crop_variety,
              price_per_quintal: request.crop.price_per_quintal,
              contract_date: new Date().toISOString()
            })
          });
          
          if (!contractRes.ok) throw new Error("Failed to create contract");
          if (contractRes.ok) {
            // Refresh contracts list
            const contractsRes = await fetch(`http://localhost:5000/api/active-contracts/${user._id}`);
            const contractsData = await contractsRes.json();
            setContracts(contractsData);
            
            // Show success message
            setSuccessMessage(`Contract with ${request.contract_sent_user.username} accepted!`);
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
          }
          
        }else {
          setSuccessMessage("Contract request declined!");
          setContractRequests(prev => prev.filter(r => r._id !== requestId));
        }
        setTimeout(() => setShowSuccessMessage(false), 1000);
      }
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  const handleEditCrop = async (e) => {
    e.preventDefault();
    setIsSavingCrop(true);
    try {
      const response = await fetch(`http://localhost:5000/api/user-crops/${editingCrop._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cropFormData)
      });
      if (response.ok) {
        fetchUserCrops();
        setEditingCrop(null);
        setShowAddCropForm(false);
      }
    } finally {
      setIsSavingCrop(false);
    }
  };
  

  const renderSectionContent = (items,section) => (
    <>
      <div className="section-header">
        <h2 className="section-heading">{section === 'available-crops' ? 'Available Crops' : section ==='dealer-needs'? 'Dealer Purchase Needs' :section === 'contracts' ? 'Active Contracts' : section==='requests'?'Recieved Contract Requests': section==='available-storages' ? 'Available Cold Storages':'Your Crops'}</h2>
        <button 
          className="close-section"
          onClick={() => setActiveSection(null)}
        >
          ✕
        </button>
      </div>
      
      {section === 'dealer-needs' ? (
              <div className="needs-list">
                {availableNeeds.map(need => {
                  const hasActiveContract = contracts.some(contract => 
                    contract.contract_type === 'dealer-need' && 
                    contract.contract_id?.need === need._id
                  );
                  
                  if (hasActiveContract) return null;
                  return (
                  <div key={need._id} className="need-card">
                    <div className="need-content">
                      <h3>{need.crop_needed} - {need.variety}</h3>
                      <div className="need-details">
                      <p>Dealer: {need.user?.username}</p>
                          <p>Contact: {need.contact_number || need.user?.contact_number}</p>
                          {need.user?.profile?.district && (
                            <p>Location: {need.user.profile.district}, {need.user.profile.state}</p>
                          )}
                        <p>Quantity Required: {need.quantity} kg</p>
                        <p>Offered Price: ₹{need.price}/quintal</p>
                        {need.user?.profile?.district && (
                          <p>Location: {need.user.profile.district}</p>
                        )}
                      </div>
                      <button
                        className={`btn request-button ${need.isRequested ? 'sent' : ''}`}
                        onClick={() => handleNeedRequest(need)}
                        disabled={need.isRequested || !userCrops.some(c => {
                          const cropNameMatch = c.crop_name.toLowerCase().trim() === need.crop_needed.toLowerCase().trim();
                          return cropNameMatch;
                        })}
                      >
                        {need.isRequested ? "Request Sent ✅" : "Send Offer"}
                      </button>
                      {!userCrops.some(c => 
                          c.crop_name.toLowerCase().trim() === need.crop_needed.toLowerCase().trim()
                        ) && (
                          <p className="error-text">You don't have this crop in your inventory</p>
                        )}
                    
                    </div>
                  </div>
                  );
                })}
              </div>
            ):section==='storage' ?(
              <div className="farmer-bookings">
                <h3>Active Storage Bookings ({farmerBookings.length})</h3>
                <div className="booking-cards">
                  {farmerBookings.map(booking => (
                    <div key={booking._id} className="farmer-booking-card">
                      <div className="user-details">
                        <h4>{booking.storage_id?.name || "Unknown Storage"}</h4>
                        <p>📍 {booking.storage_id?.location?.address}</p>
                      </div>
                      <div className="booking-info">
                        <p>🕑 Duration: {booking.storage_period} days</p>
                        <p>📅 Period: {new Date(booking.start_date).toLocaleDateString()} - 
                          {new Date(booking.end_date).toLocaleDateString()}</p>
                        <p>⚖️ Quantity: {booking.crop_quantity} kg</p>
                        <div className="total-rent">
                          💰 Total Rent: ₹{booking.total_rent?.toFixed(2) || "0.00"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ): section === 'available-storages' ? ( isLoadingStorages ? (<div className="loader-container">
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
            ):(
      Array.isArray(items) && items.map((item) => (
        <div key={item._id} className="crop_card-1">
          <div className="crop_details">
            <h1>{item.crop_name || item.name}</h1>
            <h4>{item.crop_variety || item.variety}</h4>
            <h1>Quantity : {item.quantity || item.crop?.quantity} kgs</h1>
            <p>Price per quintal : ₹{item.price_per_quintal || item.price}</p>
            {section === 'crops' && (
              <div className="crop-card">
                <div className="crop-header">
                  
                  {item.active_contracts?.length > 0 && (
                    <span className="contract-status-indicator">Under Contract</span>
                  )}
                </div>
                <div className="crop-actions">
                <button 
                  className="edit-crop-button"
                  onClick={() => {
                    setEditingCrop(item);
                    setCropFormData({
                      crop_name: item.crop_name,
                      crop_variety: item.crop_variety,
                      quantity: item.quantity,
                      price_per_quintal: item.price_per_quintal
                    });
                    setShowAddCropForm(true);
                  }}
                >
                  Edit
                </button>
                <button 
                  className="delete-crop-button"
                  onClick={() => handleDeleteCrop(item._id)}
                >
                  Delete
                </button>
                </div>
              </div>
            )}
            {section === 'available-crops' && item.user._id !== user._id &&(
              <button 
                className={`btn request-button ${item.isRequested ? 'sent' : ''}`}
                onClick={() => handleContractRequest(item)}
                disabled={item.isRequested}
              >
                {item.isRequested ? "Request Sent ✅" : "Request Contract"}
              </button>
            )}
            {section === 'requests' && (
              <div>
              <h3>{item.crop?.crop_name}</h3>
              <h2>{item.crop?.crop_variety || item.crop_variety }</h2>
              <p>From: {item.contract_sent_user?.username}</p>
              <div className="request-actions" key={item._id}>
                <button 
                  className="accept-button"
                  onClick={() => handleRequestAction(item._id, 'accepted')}
                >
                  Accept
                </button>
                <button
                  className="decline-button"
                  onClick={() => handleRequestAction(item._id, 'declined')}
                >
                  Decline
                </button>
              </div>
              </div>
            )}
            {section === 'contracts' && (
                <div className="contract-card">
                  <div className="contract-details">
                    <h3>{item.crop_name} ({item.crop_variety})</h3>
                    <div className="contract-meta">
                      <p>Dealer: {item.dealer?.username || 'Unknown Dealer'}</p>
                      <p>Farmer: {item.producer?.username || 'N/A'}</p>
                      <p>Quantity: {item.crop?.quantity || item.quantity||'N/A'} kg</p>
                      <p>Price: ₹{item.price_per_quintal || 'N/A'}/quintal</p>
                      <p>Date: {new Date(item.contract_date).toLocaleDateString()}</p>
                      <p>Contract ID: {item._id}</p>
                    </div>
                  </div>
                  <div className="contract-status">
                    <span className="status-active">Active</span>
                    <p>Initiated: {new Date(item.contract_id?.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
            )}
            


        </div>
          <div>
            <Image src="/Assets/Indam-5.png" height={100} width={100} alt="Crop Image"/>
          </div>
        </div>
      ))
      )}
    </>
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCropFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  
  
  const renderDashboardCards = () => (
    <div className="dashboard-cards">
      {dashboardCards.map((card) => (
        <div key={card.target} className="dashboard-card">
          <h3>{card.title}</h3>
          <p>{card.description}</p>
          <div className="card-actions">
            <button
              className="view-link"
              onClick={() => handleViewDetails(card.target)}
            >
              {isLoading && activeSection === card.target ? (
                <div className="loading-spinner"></div>
              ) : "View Details"}
            </button>
            {card.target === 'crops' && (
              <button
                className="view-link add-crop-button"
                onClick={() => {
                  setCropFormData({
                    crop_name: '',
                    crop_variety: '',
                    quantity: '',
                    price_per_quintal: ''
                  });
                  setShowAddCropForm(true);
                }}
              >
                Add New Crop
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const SuccessMessage = () => (
    <div className="contract-success-popup">
      <div className="success-message-content">
        <span className="success-check">✓</span>
        <p>{successMessage}</p>
      </div>
    </div>
  );

  // Remove dummy contract/storage displays
    return(
        <div className="dashboard">
          {showSuccessMessage && <SuccessMessage />}
          {storageRequestSuccess && (
            <div className="success-message">
              Storage request sent successfully!
            </div>
          )}
          {showLogoutConfirmation && (
              <div className="logout-confirmation-overlay">
                <div className="logout-confirmation-card">
                  <h3>Do you want to LOGOUT?</h3>
                  <div className="confirmation-buttons">
                    <button 
                      className="confirm-button"
                      onClick={handleLogout}
                    >
                      Yes
                    </button>
                    <button
                      className="cancel-button"
                      onClick={() => setShowLogoutConfirmation(false)}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            )}
            {isLoggingOut && (
              <div className="logout-loader-overlay">
                <div className="logout-loader-container">
                  <Image 
                    src="/Assets/loading-spinner.gif" 
                    width={100} 
                    height={100} 
                    alt="Logging out..."
                    className="reverse-spinner"
                  />
                  <div className="loader-text">Securing Your Farm Data...</div>
                </div>
              </div>
            )}

          {showLoader && (
                <div className="loader-overlay">
                  <div className="loader-container">
                    <Image 
                      src="/Assets/Background.gif" 
                      width={150} 
                      height={150} 
                      alt="Loading..."
                      className="loader-gif"
                    />
                    <div className="loader-text">Harvesting Data...</div>
                  </div>
                </div>
              )}

          {showAddCropForm && <AddCropForm editingCrop={editingCrop}
    cropFormData={cropFormData}
    handleInputChange={handleInputChange}
    handleCropSubmit={handleCropSubmit}
    handleEditCrop={handleEditCrop}
    isSavingCrop={isSavingCrop}
    formSuccess={formSuccess}
    formError={formError}
    setShowAddCropForm={setShowAddCropForm}
    setEditingCrop={setEditingCrop}
/>}

            <div className="Sidebar-container"><Sidebar onProfileClick={()=>setActiveSection('profile')} onRequestsClick={() => setActiveSection('requests')}
          onAvailableCropsClick={() => setActiveSection('available-crops')} dealerNeedsCount={availableNeeds.length}
          requestCount={contractRequests.length} contractRequests={contractRequests}
          setActiveSection={setActiveSection}/></div>
            <main className={showLoader ? "blur-effect" : ""}>
                <nav className="dashboard_nav">
                    <h1>Welcome {user?.username || 'User'},</h1>
                    <button 
                      className="logout-button"
                      onClick={() => setShowLogoutConfirmation(true)}
                    >
                      Logout
                    </button>
                </nav>
                <div className="Farmer_dashboard_container">
                  {activeSection === 'profile' ?(
                    <Profile setActiveSection={setActiveSection}/>
                  ):activeSection ? (
                    <div className={`section-container ${activeSection}-section active`}>
                      {activeSection === 'crops' && renderSectionContent(userCrops, 'crops')}
                      {activeSection === 'contracts' && renderSectionContent(contracts, 'contracts')}
                      {activeSection === 'requests' && renderSectionContent(contractRequests, 'requests')}
                      {activeSection === 'available-crops' && renderSectionContent(availableCrops, 'available-crops')}
                      {activeSection==='dealer-needs' && renderSectionContent(availableNeeds,'dealer-needs')}
                      {activeSection==='available-storages' && renderSectionContent(availableStorages,'available-storages')}
                      {activeSection==='storage' && renderSectionContent(farmerBookings,'storage')}
                    </div>
                  ) : (
                    renderDashboardCards()
                  )}
                </div>
            </main>
        </div>
    )
}

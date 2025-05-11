"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import "./profile.css";

export default function Profile({ setActiveSection }) {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email_id: '',
    state: '',
    district: '',
    city: '',
    address: '',
    alternate_contact_number: ''
  });
  
  const accountSpecificFields = {
    farmer: ['crop_types', 'land_size'],
    storage: ['storage_capacity', 'facility_type'],
    dealer: ['license_number', 'business_address']
  };
  
  const commonFields = ['first_name', 'last_name', 'email_id', 'state', 'district', 'city', 'address', 'alternate_contact_number'];
  
  const handleBack =()=>{
    setActiveSection(null);
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/profile/${authUser?._id}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setFormData({...data, ...data[`${authUser.account_type}_specific`]});
          setEditMode(false); // Disable edit mode if profile exists
        } else {
          setProfile(null);
          setEditMode(true); // Enable edit mode for new profile
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
        setEditMode(true);
      }
    };
    if (authUser?._id) {
      fetchProfile();
    }
  }, [authUser?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = profile ? 'PUT' : 'POST';
      const url = profile ? `http://localhost:5000/api/profile/${profile._id}` : 'http://localhost:5000/api/profile';
      const profileData = {
        userId:authUser._id,
        first_name: formData.first_name,
      last_name: formData.last_name,
      email_id: formData.email_id,
      state: formData.state,
      district: formData.district,
      city: formData.city,
      address: formData.address,
      alternate_contact_number: formData.alternate_contact_number,
      
      // Account-specific fields
      [`${authUser.account_type}_specific`]: {}
      };
      accountSpecificFields[authUser.account_type].forEach(field => {
        profileData[`${authUser.account_type}_specific`][field] = formData[field];
      });
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      throw new Error(`Invalid response: ${text}`);
    }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save profile');
      }
  
      setProfile(data);
      setFormData(data);
      setEditMode(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(error.message);
    }
  };

  return (
    <div className="profile-container">
      <button 
    className="back-button"
    onClick={handleBack}
    style={{
      marginBottom: '20px',
      padding: '8px 16px',
      backgroundColor: '#6b4423',
      color: 'white'
    }}
  >
    ← Back to Dashboard
  </button>
      <h2 className="profile-heading">Profile Information</h2>
      <form onSubmit={handleSubmit} className="profile-form-grid">
        
        <div className="form-group col-span-6">
          <label className="from-label">Contact Number</label>
          <input 
            type="text" 
            value={authUser?.contact_number || ""} 
            disabled 
            className="disabled-input"
          />
        </div>
      
        {commonFields.map((field) => (
        <div className="form-group col-span-6" key={field} data-field={field}>
          <label className='form-label'>{field.replace(/_/g, ' ').toUpperCase()}</label>
          {editMode ? (
            <input
              type="text"
              value={formData[field] || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                [field]: e.target.value

              }))}
              className='profile-input'
            />
          ) : (
            <div className="profile-value">
              {formData[field] || 'Not provided'}
            </div>
          )}
        </div>
      ))}
        {accountSpecificFields[authUser?.account_type]?.map((field) => (
            <div className="form-group col-span-6" key={field}>
              <label className='form-label'>{field.replace(/_/g, ' ').toUpperCase()}</label>
              {editMode ? (
                <input
                  type="text"
                  value={formData[field] || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                  className="profile-input"
                />
              ) : (
                <div className="profile-value">{formData[field] || 'Not provided'}</div>
              )}
            </div>
          
        ))}

        <div className="button-group">
          {!profile ? (
            <button type="submit" className="submit-button">
              Create Profile
            </button>
          ) : (
            <>
              {editMode ? (
                <>
                  <button type="submit" className="save-button">
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {setEditMode(false);setFormData(profile);}}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  type="button" 
                  onClick={() => setEditMode(true)}
                  className="edit-button"
                >
                  Edit Profile
                </button>
              )}
            </>
          )}
        </div>
      </form>
      
    </div>
  );
}
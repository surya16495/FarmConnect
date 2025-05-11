"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import "./StorageDetails.css";
import "../Profile/profile.css";


export default function StorageDetails({ setActiveSection }) {
  const { user: authUser } = useAuth();
  const [storage, setStorage] = useState(null);
  const [editMode, setEditMode] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    location: { state: '', district: '', city: '' ,address:''},
    availability: true,
    price_per_quintal: ''
  });
  const [formErrors, setFormErrors] = useState({});


  const handleBack = () => {
    setActiveSection(null);
  };

  useEffect(() => {
    const fetchStorage = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/cold-storages/${authUser?._id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setStorage(data[0]);
            setFormData(data[0]);
            setEditMode(false);
          }
        }
        else {
          setEditMode(true);
        }
      } catch (error) {
        console.error('Error fetching storage details:', error);
        setEditMode(true);
      }
    };
    if (authUser?._id) {
      fetchStorage();
    }
  }, [authUser?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const errors = {};
      if (!formData.name.trim()) errors.name = 'Storage name is required';
      if (!formData.location.state.trim()) errors.state = 'State is required';
      if (!formData.price_per_quintal) errors.price = 'Price is required';

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      const payload = {
        name: formData.name.trim(),
        location: {
          state: formData.location.state.trim(),
          district: formData.location.district.trim(),
          city: formData.location.city.trim(),
          address:formData.location.address.trim()
        },
        availability: formData.availability,
        price_per_quintal: Number(formData.price_per_quintal),
        user: authUser._id
      };
      const method = storage ? 'PUT' : 'POST';
      const url = storage ? 
        `http://localhost:5000/api/cold-storages/${storage._id}` : 
        'http://localhost:5000/api/cold-storages';
      
    
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save storage details');

      setStorage(data);
      setEditMode(false);
      setFormErrors({});
    } catch (error) {
      console.error('Error saving storage details:', error);
      alert(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value
      }
    }));
  };


  return (
    <div className="profile-container">
      <button className="back-button" onClick={handleBack} style={{ marginBottom: '20px', padding: '8px 16px' }}>
        ← Back to Dashboard
      </button>
      <h2 className="profile-heading">Storage Details</h2>
      <form onSubmit={handleSubmit} className="profile-form-grid">
      <div className="form-group col-span-6">
          <label className="form-label">Storage Name</label>
          {editMode ? (
            <>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="profile-input"
                required
              />
              {formErrors.name && <span className="error-message">{formErrors.name}</span>}
            </>
          ) : (
            <div className="profile-value">{formData.name || 'Not provided'}</div>
          )}
        </div>

        {['state', 'district', 'city','address'].map((field) => (
          <div className="form-group col-span-6" key={field}>
            <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
            {editMode ? (
              <>
                <input
                  type="text"
                  name={field}
                  value={formData.location[field]}
                  onChange={handleLocationChange}
                  className="profile-input"
                  required={field === 'state'} // Only state is required
                />
                {formErrors[field] && <span className="error-message">{formErrors[field]}</span>}
              </>
            ) : (
              <div className="profile-value">{formData.location[field] || 'Not provided'}</div>
            )}
          </div>
        ))}

        <div className="form-group col-span-6">
          <label className="form-label">Availability</label>
          {editMode ? (
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="availability"
                  checked={formData.availability}
                  onChange={() => setFormData({ ...formData, availability: true })}
                /> Available
              </label>
              <label>
                <input
                  type="radio"
                  name="availability"
                  checked={!formData.availability}
                  onChange={() => setFormData({ ...formData, availability: false })}
                /> Not Available
              </label>
            </div>
          ) : (
            <div className="profile-value">{formData.availability ? 'Available' : 'Not Available'}</div>
          )}
        </div>

        <div className="form-group col-span-6">
          <label className="form-label">Rent per Quintal (₹)</label>
          {editMode ? (
            <input
              type="number"
              value={formData.price_per_quintal}
              name='price_per_quintal'
              onChange={handleInputChange}
              className="profile-input"
              required
              min="1"
            />
          ) : (
            <div className="profile-value">₹{formData.price_per_quintal || 'Not provided'}</div>
          )}
        </div>

        <div className="button-group">
          {!storage ? (
            <button type="submit" className="submit-button">
              Create Storage Details
            </button>
          ) : (
            <>
              {editMode ? (
                <>
                  <button type="submit" className="save-button">
                    Update
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {setEditMode(false); setFormErrors({});}}
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
                  Edit Details
                </button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
}
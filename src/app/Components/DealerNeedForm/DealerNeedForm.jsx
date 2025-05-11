"use client"
import { useState, useEffect } from "react";
import Image from "next/image";

const DealerNeedForm = ({
  editingNeed,
  needFormData,
  handleInputChange,
  handleNeedSubmit,
  isSaving,
  formError,
  formSuccess,
  setShowForm,
  setEditingNeed
}) => {
  return (
    <div className="form-overlay">
      <div className="dealer-form-container">
        <button 
          className="close-form" 
          onClick={() => {
            setShowForm(false);
            setEditingNeed(null);
          }}
        >
          ×
        </button>
        <h2>{editingNeed ? 'Edit Contract Need' : 'Create New Contract Need'}</h2>
        <form onSubmit={handleNeedSubmit}>
          <div className="form-group">
            <label htmlFor="crop_needed">Crop Needed *</label>
            <input
              type="text"
              id="crop_needed"
              name="crop_needed"
              value={needFormData.crop_needed}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="variety">Variety *</label>
            <input
              type="text"
              id="variety"
              name="variety"
              value={needFormData.variety}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="quantity">Quantity (kg) *</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={needFormData.quantity}
              onChange={handleInputChange}
              required
              min="1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="price">Price per Quintal (₹) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={needFormData.price}
              onChange={handleInputChange}
              required
              min="1"
            />
          </div>
          <div className="form-button-container">
            <button type="submit" className="btn view-btn submit-button">
              {isSaving ? (
                <div className="form-spinner"></div>
              ) : formSuccess ? (
                <span className="success-check">✓</span>
              ) : (
                editingNeed ? "Update Need" : "Create Need"
              )}
            </button>
          </div>
          {formError && (
            <div className="form-error-message">
              ❌ {formError}
            </div>
          )}
          {formSuccess && (
            <div className="form-success-message">
              {editingNeed ? 'Need updated successfully!' : 'Need created successfully!'}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default DealerNeedForm;
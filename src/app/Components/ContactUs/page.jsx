"use client";
import "./ContactUs.css";
import {useState} from 'react';

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/send-contact-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-container">
      {/* Decorative Green Shapes */}
      <div className="shape-overlay">
        <div className="green-circle"></div>
      </div>
      <div className="contact-image">
        <img 
          src="/Assets/contact-person.png" 
          alt="Contact us"
          className="person-image"
        />
      </div>
      <div className="contact-content">
        <div className="contact-header">
          <h1 className="contact-title">
            Want to <br />
            know more?
          </h1>
          <p className="contact-subtitle">Write to us</p>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              type="text" 
              name="name"
              className="form-input"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
            />
        
          </div>

          <div className="form-group">
            <input 
              type="email" 
              name="email"
              className="form-input"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
            />
            
          </div>

          <div className="form-group">
            <textarea 
            name="message"
              className="form-textarea"
              placeholder="Your Message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
            ></textarea>
           
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Sending...' : 'Send Message'}
            <span className="arrow-icon">→</span>
          </button>
          {success && <div className="success-message">Message sent successfully!</div>}
        </form>
      </div>
    </div>
  );
}
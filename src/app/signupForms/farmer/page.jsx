'use client';
import '../../signup/Signup.css';
import Signup from '../../signup/page';

export default function FarmerSignup() {
  return (
    <div className="container farmer-bg">
      <Signup active="farmer" />
    </div>
  );
}

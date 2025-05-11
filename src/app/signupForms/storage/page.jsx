'use client';
import '../../signup/Signup.css';
import Signup from '../../signup/page';

export default function StorageSignup() {
  return (
    <div className="container storage-bg">
      <Signup active="storage" />
    </div>
  );
}
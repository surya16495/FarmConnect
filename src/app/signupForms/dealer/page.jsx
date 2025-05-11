'use client';
import '../../signup/Signup.css';
import Signup from '../../signup/page';
export default function DealerSignup() {
  return (
    <div className="container dealer-bg">
      <Signup active="dealer" />
    </div>
  );
}
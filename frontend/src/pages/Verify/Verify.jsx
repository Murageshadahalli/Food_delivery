import React, { useState } from 'react'
import './Verify.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useEffect } from 'react';

const Verify = () => {
    const [searchParams,setSearchParams] = useSearchParams();
    const success = searchParams.get("success")
    const orderId = searchParams.get("orderId")
    const {url, clearCart} = useContext(StoreContext);
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState(null);

    const verifyPayment = async ()=> {
        try {
            setVerifying(true);
            const response = await axios.post(url+"/api/order/verify",{success,orderId});
            
            if (response.data.success) {
                // Clear the cart after successful payment
                clearCart();
                setVerifying(false);
                // Add a small delay to show success state
                setTimeout(() => {
                    navigate("/myorders");
                }, 1000);
            } else {
                setError("Payment verification failed");
                setVerifying(false);
                setTimeout(() => {
                    navigate("/");
                }, 2000);
            }
        } catch (error) {
            console.error("Verification error:", error);
            setError("Error verifying payment");
            setVerifying(false);
            // Even if verification fails, clear cart if it was a successful payment
            if (success === "true") {
                clearCart();
            }
            setTimeout(() => {
                navigate("/");
            }, 2000);
        }
    }

    useEffect(()=>{
        verifyPayment();
    },[])
   
  return (
    <div className='verify'>
        <div className="verification-container">
            {verifying ? (
                <>
                    <div className="spinner"></div>
                    <p>Verifying your payment...</p>
                </>
            ) : error ? (
                <>
                    <div className="error-icon">❌</div>
                    <p className="error-message">{error}</p>
                    <p>Redirecting to home page...</p>
                </>
            ) : (
                <>
                    <div className="success-icon">✅</div>
                    <p className="success-message">Payment successful!</p>
                    <p>Redirecting to your orders...</p>
                </>
            )}
        </div>
    </div>
  )
}

export default Verify

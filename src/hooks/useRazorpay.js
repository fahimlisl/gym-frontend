import { useState } from 'react';

const useRazorpay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('✅ Razorpay script loaded');
        resolve(true);
      };
      script.onerror = () => {
        console.error('❌ Failed to load Razorpay script');
        reject(new Error('Failed to load Razorpay script'));
      };
      document.body.appendChild(script);
    });
  };

  const createOrder = async (amount, currency = 'INR', receipt = '', description = '') => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency,
          receipt,
          description
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create order');
      }

      return data;
    } catch (err) {
      console.error('Order creation error:', err);
      throw err;
    }
  };

  const verifyPayment = async (paymentDetails) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payment/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentDetails)
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Payment verification failed');
      }

      return data;
    } catch (err) {
      console.error('Verification error:', err);
      throw err;
    }
  };

  const handlePayment = async (paymentConfig) => {
    setLoading(true);
    setError(null);

    try {
      const {
        amount,
        productName,
        userEmail,
        userName = 'Customer',
        userPhone = '9000090000',
        onSuccess,
        onError
      } = paymentConfig;

      await loadRazorpayScript();
      const orderData = await createOrder(
        amount,
        'INR',
        `receipt_${Date.now()}`,
        productName
      );



      const options = {
        key: import.meta.env.VITE_RAZORPAY_TEST_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Alpha Gym',
        description: productName,
        order_id: orderData.orderId,

        handler: async (response) => {
          console.log('✅ Payment completed by user');
          console.log('🔄 Step 4: Verifying payment...');

          try {
            const verificationResult = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            console.log('✅ Payment verified:', verificationResult);
            setLoading(false);
            onSuccess(verificationResult);
          } catch (err) {
            console.error('❌ Verification failed:', err);
            setLoading(false);
            setError(err.message);
            onError(err);
          }
        },

        modal: {
          ondismiss: () => {
            console.log('❌ User closed payment modal');
            const dismissError = new Error('Payment modal closed by user');
            setLoading(false);
            setError(dismissError.message);
            onError(dismissError);
          }
        },

        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone
        },

        theme: {
          color: '#ef4444'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('❌ Payment error:in 155 line ofuserRazorPay.js', err);
      setError(err.message);
      setLoading(false);
      paymentConfig.onError(err);
    }
  };

  return {
    handlePayment,
    loading,
    error,
    setError
  };
};

export default useRazorpay;
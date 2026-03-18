import { useState, useEffect } from 'react';
import useRazorpay from '../hooks/useRazorpay';

/**
 * Dynamic Payment Component
 * Can work 3 ways:
 * 1. With props: <PaymentComponent products={[...]} />
 * 2. With database fetch: <PaymentComponent category="SUBSCRIPTION" />
 * 3. Standalone with hardcoded products
 */
const PaymentComponent = ({ 
  products: externalProducts = null,
  category = null,
  onPaymentSuccess = null,
  showUserForm = true 
}) => {
  const { handlePayment, loading, error, setError } = useRazorpay();
  
  // State for products, user info, and payment status
  const [products, setProducts] = useState(externalProducts || []);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Hardcoded fallback products
  const hardcodedProducts = [
    { id: 1, name: 'Basic Plan', price: 299, description: '1 month access' },
    { id: 2, name: 'Pro Plan', price: 799, description: '3 months access' },
    { id: 3, name: 'Premium Plan', price: 1999, description: '1 year access' },
    { id: 4, name: 'One-time Consultation', price: 599, description: 'Single session' }
  ];

  // Fetch products from database if category is provided
  useEffect(() => {
    if (externalProducts) {
      // Use products passed as props
      setProducts(externalProducts);
    } else if (category) {
      // Fetch from database
      const fetchProducts = async () => {
        try {
          setLoadingProducts(true);
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/plans?category=${category}`
          );
          const data = await response.json();
          
          if (data.success || Array.isArray(data)) {
            // Handle both { success: true, data: [...] } and just [...]
            const plansList = Array.isArray(data) ? data : data.data || [];
            setProducts(plansList);
          }
        } catch (err) {
          console.error('Failed to fetch products:', err);
          // Fallback to hardcoded
          setProducts(hardcodedProducts);
        } finally {
          setLoadingProducts(false);
        }
      };

      fetchProducts();
    } else if (!externalProducts && products.length === 0) {
      // Use hardcoded as fallback
      setProducts(hardcodedProducts);
    }
  }, [externalProducts, category]);

  const handleSelectProduct = async (product) => {
    if (!userEmail) {
      alert('Please enter your email');
      return;
    }

    if (!userName) {
      alert('Please enter your name');
      return;
    }

    if (showUserForm && !userPhone) {
      alert('Please enter your phone number');
      return;
    }

    await handlePayment({
      amount: product.price,
      productName: product.name,
      userEmail: userEmail,
      userName: userName,
      userPhone: userPhone,
      onSuccess: (result) => {
        const successData = {
          success: true,
          message: `✅ Payment successful! You've purchased ${product.name}`,
          paymentId: result.paymentId,
          orderId: result.orderId,
          userInfo: {
            name: userName,
            email: userEmail,
            phone: userPhone,
          },
          product: product,
        };

        setPaymentStatus(successData);

        // Call external callback if provided
        if (onPaymentSuccess) {
          onPaymentSuccess(successData);
        }
      },
      onError: (err) => {
        setPaymentStatus({
          success: false,
          message: `❌ Payment failed: ${err.message}`,
        });
      },
    });
  };

  // Show loading state while fetching products
  if (loadingProducts) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Choose Your Plan</h1>
          <p className="text-gray-400">Select and purchase any plan to get started</p>
        </div>

        {/* User Info Section */}
        {showUserForm && (
          <div className="mb-8 max-w-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Your Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="Enter your phone"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {products.map((product) => (
              <div
                key={product._id || product.id}
                className="p-6 rounded border border-white/10 bg-neutral-800/30 hover:border-red-500/50 hover:bg-neutral-800/50 transition flex flex-col"
              >
                <h3 className="text-xl font-bold text-white mb-2">
                  {product.title || product.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {product.bio || product.description}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-6">
                  {product.basePrice && (
                    <span className="text-gray-500 line-through text-sm">
                      ₹{product.basePrice}
                    </span>
                  )}
                  <span className="text-3xl font-bold text-white">
                    ₹{product.finalPrice || product.price}
                  </span>
                </div>

                {/* Duration */}
                {product.duration && (
                  <p className="text-gray-400 text-xs mb-4">
                    Duration: {product.duration}
                  </p>
                )}

                {/* Benefits */}
                {product.benefits && product.benefits.length > 0 && (
                  <ul className="text-xs text-gray-300 mb-6 flex-1">
                    {product.benefits.slice(0, 3).map((benefit, idx) => (
                      <li key={idx} className="mb-1">
                        ✓ {benefit.heading || benefit}
                      </li>
                    ))}
                    {product.benefits.length > 3 && (
                      <li className="text-gray-500">
                        + {product.benefits.length - 3} more benefits
                      </li>
                    )}
                  </ul>
                )}

                {/* Pay Button */}
                <button
                  onClick={() => handleSelectProduct(product)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-red-600 text-white font-semibold rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 mb-12">
            No plans available
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 mb-8 bg-red-500/10 border border-red-500/30 rounded">
            <p className="text-red-400 font-semibold">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-300 text-sm hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Payment Status Message */}
        {paymentStatus && (
          <div
            className={`p-6 rounded border mb-8 ${
              paymentStatus.success
                ? 'border-green-500/30 bg-green-500/10'
                : 'border-red-500/30 bg-red-500/10'
            }`}
          >
            <p
              className={
                paymentStatus.success
                  ? 'text-green-400 font-semibold text-lg'
                  : 'text-red-400 font-semibold text-lg'
              }
            >
              {paymentStatus.message}
            </p>
            {paymentStatus.success && (
              <div className="mt-4 text-gray-300 text-sm space-y-2">
                <p>
                  💳 Payment ID:{' '}
                  <span className="font-mono text-gray-200">
                    {paymentStatus.paymentId}
                  </span>
                </p>
                <p>
                  📋 Order ID:{' '}
                  <span className="font-mono text-gray-200">
                    {paymentStatus.orderId}
                  </span>
                </p>
                <p>
                  👤 User: <span className="font-mono text-gray-200">
                    {paymentStatus.userInfo?.name}
                  </span>
                </p>
              </div>
            )}
            <button
              onClick={() => setPaymentStatus(null)}
              className="mt-4 text-sm px-3 py-1 bg-neutral-700 text-white rounded hover:bg-neutral-600 transition"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Debug Info */}
        <div className="p-4 bg-neutral-800/50 border border-white/10 rounded text-gray-400 text-sm">
          <p className="font-semibold text-white mb-2">🧪 Debug Info:</p>
          <p>Razorpay Key: {import.meta.env.VITE_RAZORPAY_TEST_KEY_ID ? '✅ Loaded' : '❌ Missing'}</p>
          <p>API URL: {import.meta.env.VITE_API_URL || '❌ Missing'}</p>
          <p>Products Loaded: {products.length > 0 ? `✅ ${products.length}` : '❌ None'}</p>
          {showUserForm && (
            <>
              <p>Name: {userName || 'Not entered'}</p>
              <p>Email: {userEmail || 'Not entered'}</p>
              <p>Phone: {userPhone || 'Not entered'}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentComponent;
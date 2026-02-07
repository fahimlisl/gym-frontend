import React, { useState, useEffect } from 'react';
import api from '../../api/axios.api.js';
import { toast } from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiLock, FiUpload, FiTag, FiX, FiCheck } from 'react-icons/fi';

const TrainerMembers = () => {
  const [loading, setLoading] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponModalFor, setCouponModalFor] = useState(''); 

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    plan: 'monthly',
    price: 0,
    admissionFee: 0,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    avatar: null
  });

  const [couponDiscount, setCouponDiscount] = useState({
    couponCodeForSubscription: '',
    couponCodeForAdmission: '',
    subscriptionCouponData: null,
    admissionCouponData: null,
    subscriptionDiscountAmount: 0,
    admissionDiscountAmount: 0
  });

  const [avatarPreview, setAvatarPreview] = useState(null);

  const [calculatedPrices, setCalculatedPrices] = useState({
    originalTotal: 0,
    subscriptionDiscount: 0,
    admissionDiscount: 0,
    finalTotal: 0
  });

  const planPrices = {
    monthly: 5000,
    quarterly: 12000,
    'half-yearly': 24000,
    yearly: 40000
  };

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      price: planPrices[prev.plan] || 0
    }));
  }, [formData.plan]);

  useEffect(() => {
    calculateTotalPrice();
  }, [formData.price, formData.admissionFee, couponDiscount]);

  const calculateTotalPrice = () => {
    const price = Number(formData.price);
    const admissionFee = Number(formData.admissionFee);
    const subscriptionDiscount = couponDiscount.subscriptionDiscountAmount;
    const admissionDiscount = couponDiscount.admissionDiscountAmount;

    const finalTotal = price + admissionFee - subscriptionDiscount - admissionDiscount;

    setCalculatedPrices({
      originalTotal: price + admissionFee,
      subscriptionDiscount,
      admissionDiscount,
      finalTotal: Math.max(0, finalTotal)
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }));
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const fetchActiveCoupons = async (category) => {
    try {
      const response = await axios.get(`/api/coupon/active?category=${category}`);
      setActiveCoupons(response.data.data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to fetch coupons');
    }
  };

  const openCouponModal = (type) => {
    setCouponModalFor(type);
    const category = type === 'subscription' ? 'SUBSCRIPTION' : 'ADMISSION';
    fetchActiveCoupons(category);
    setShowCouponModal(true);
  };

  const applyCoupon = async (couponCode, type) => {
    try {
      const amount = type === 'subscription' ? formData.price : formData.admissionFee;
      const category = type === 'subscription' ? 'SUBSCRIPTION' : 'ADMISSION';

      if (amount === 0) {
        toast.error(`Please set ${type === 'subscription' ? 'subscription price' : 'admission fee'} first`);
        return;
      }

      const response = await axios.post('/trainer/applyCouponToGYM', {
        couponCode,
        category,
        amount
      });

      if (response.data.success) {
        const { calculation, coupon } = response.data.data;
        
        if (type === 'subscription') {
          setCouponDiscount(prev => ({
            ...prev,
            couponCodeForSubscription: couponCode,
            subscriptionCouponData: coupon,
            subscriptionDiscountAmount: calculation.discountAmount
          }));
          toast.success(`Subscription coupon applied! You save ₹${calculation.savings}`, {
            icon: '🎉',
            duration: 3000
          });
        } else {
          setCouponDiscount(prev => ({
            ...prev,
            couponCodeForAdmission: couponCode,
            admissionCouponData: coupon,
            admissionDiscountAmount: calculation.discountAmount
          }));
          toast.success(`Admission coupon applied! You save ₹${calculation.savings}`, {
            icon: '🎉',
            duration: 3000
          });
        }
        setShowCouponModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply coupon');
    }
  };

  const removeCoupon = (type) => {
    if (type === 'subscription') {
      setCouponDiscount(prev => ({
        ...prev,
        couponCodeForSubscription: '',
        subscriptionCouponData: null,
        subscriptionDiscountAmount: 0
      }));
      toast.success('Subscription coupon removed');
    } else {
      setCouponDiscount(prev => ({
        ...prev,
        couponCodeForAdmission: '',
        admissionCouponData: null,
        admissionDiscountAmount: 0
      }));
      toast.success('Admission coupon removed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      submitData.append('username', formData.username);
      submitData.append('email', formData.email);
      submitData.append('phoneNumber', formData.phoneNumber);
      submitData.append('password', formData.password);
      submitData.append('plan', formData.plan);
      submitData.append('price', formData.price);
      submitData.append('admissionFee', formData.admissionFee);
      submitData.append('paymentMethod', formData.paymentMethod);
      submitData.append('paymentStatus', formData.paymentStatus);
      submitData.append('avatar', formData.avatar);

      if (couponDiscount.couponCodeForSubscription) {
        submitData.append('couponCodeForSubscription', couponDiscount.couponCodeForSubscription);
      }
      if (couponDiscount.couponCodeForAdmission) {
        submitData.append('couponCodeForAdmission', couponDiscount.couponCodeForAdmission);
      }

      const response = await api.post('/trainer/register', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Member registered successfully! 🎉', {
          duration: 4000
        });
        resetForm();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      phoneNumber: '',
      password: '',
      plan: 'monthly',
      price: planPrices.monthly,
      admissionFee: 0,
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      avatar: null
    });
    setCouponDiscount({
      couponCodeForSubscription: '',
      couponCodeForAdmission: '',
      subscriptionCouponData: null,
      admissionCouponData: null,
      subscriptionDiscountAmount: 0,
      admissionDiscountAmount: 0
    });
    setAvatarPreview(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full mb-4">
            <span className="font-semibold">Trainer Access</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Register New Member
          </h1>
          <p className="text-gray-600 text-lg">
            Use coupons to give special discounts to your members
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 md:p-8 border-b">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FiUser className="inline mr-2 text-blue-600" />
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter member name"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FiMail className="inline mr-2 text-blue-600" />
                  Email <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="member@email.com"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FiPhone className="inline mr-2 text-blue-600" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="10 digit mobile number"
                  maxLength="10"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FiLock className="inline mr-2 text-blue-600" />
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Create a secure password"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FiUpload className="inline mr-2 text-blue-600" />
                  Profile Picture *
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  {avatarPreview && (
                    <div className="relative">
                      <img 
                        src={avatarPreview} 
                        alt="Preview" 
                        className="w-20 h-20 rounded-full object-cover border-4 border-blue-200 shadow-lg"
                      />
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1">
                        <FiCheck size={12} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 border-b bg-white">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
              Subscription Plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Plan Type *
                </label>
                <select
                  name="plan"
                  value={formData.plan}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
                >
                  <option value="monthly">Monthly - ₹{planPrices.monthly.toLocaleString()}</option>
                  <option value="quarterly">Quarterly - ₹{planPrices.quarterly.toLocaleString()}</option>
                  <option value="half-yearly">Half Yearly - ₹{planPrices['half-yearly'].toLocaleString()}</option>
                  <option value="yearly">Yearly - ₹{planPrices.yearly.toLocaleString()}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subscription Price *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Admission Fee
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                  <input
                    type="number"
                    name="admissionFee"
                    value={formData.admissionFee}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
                >
                  <option value="cash">💵 Cash</option>
                  <option value="upi">📱 UPI</option>
                  <option value="card">💳 Card</option>
                  <option value="bank_transfer">🏦 Bank Transfer</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 border-b bg-gradient-to-r from-green-50 to-emerald-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
              Apply Discount Coupons
              <span className="ml-3 text-sm font-normal text-gray-500">(Optional)</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Subscription Coupon
                </label>
                {!couponDiscount.couponCodeForSubscription ? (
                  <button
                    type="button"
                    onClick={() => openCouponModal('subscription')}
                    className="w-full px-6 py-4 bg-white border-3 border-dashed border-green-300 rounded-xl text-green-700 font-semibold hover:bg-green-50 hover:border-green-400 transition-all shadow-sm"
                  >
                    <FiTag className="inline mr-2" size={20} />
                    Browse & Apply Coupon
                  </button>
                ) : (
                  <div className="bg-white border-3 border-green-500 rounded-xl p-4 shadow-md">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                            {couponDiscount.couponCodeForSubscription}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {couponDiscount.subscriptionCouponData?.type === 'percentage' 
                            ? `${couponDiscount.subscriptionCouponData?.value}% OFF` 
                            : `₹${couponDiscount.subscriptionCouponData?.value} OFF`}
                        </p>
                        <p className="text-lg font-bold text-green-600 mt-1">
                          You save: ₹{couponDiscount.subscriptionDiscountAmount.toFixed(2)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCoupon('subscription')}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition"
                      >
                        <FiX size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Admission Fee Coupon
                </label>
                {!couponDiscount.couponCodeForAdmission ? (
                  <button
                    type="button"
                    onClick={() => openCouponModal('admission')}
                    className="w-full px-6 py-4 bg-white border-3 border-dashed border-green-300 rounded-xl text-green-700 font-semibold hover:bg-green-50 hover:border-green-400 transition-all shadow-sm"
                  >
                    <FiTag className="inline mr-2" size={20} />
                    Browse & Apply Coupon
                  </button>
                ) : (
                  <div className="bg-white border-3 border-green-500 rounded-xl p-4 shadow-md">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                            {couponDiscount.couponCodeForAdmission}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {couponDiscount.admissionCouponData?.type === 'percentage' 
                            ? `${couponDiscount.admissionCouponData?.value}% OFF` 
                            : `₹${couponDiscount.admissionCouponData?.value} OFF`}
                        </p>
                        <p className="text-lg font-bold text-green-600 mt-1">
                          You save: ₹{couponDiscount.admissionDiscountAmount.toFixed(2)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCoupon('admission')}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition"
                      >
                        <FiX size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 bg-gradient-to-r from-blue-50 to-purple-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">4</span>
              Price Summary
            </h2>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700 text-lg">
                  <span>Subscription Price:</span>
                  <span className="font-semibold">₹{formData.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700 text-lg">
                  <span>Admission Fee:</span>
                  <span className="font-semibold">₹{formData.admissionFee.toLocaleString()}</span>
                </div>
                {calculatedPrices.subscriptionDiscount > 0 && (
                  <div className="flex justify-between text-green-600 text-lg">
                    <span>Subscription Discount:</span>
                    <span className="font-semibold">- ₹{calculatedPrices.subscriptionDiscount.toFixed(2)}</span>
                  </div>
                )}
                {calculatedPrices.admissionDiscount > 0 && (
                  <div className="flex justify-between text-green-600 text-lg">
                    <span>Admission Discount:</span>
                    <span className="font-semibold">- ₹{calculatedPrices.admissionDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t-3 border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total Amount:</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ₹{calculatedPrices.finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                {(calculatedPrices.subscriptionDiscount > 0 || calculatedPrices.admissionDiscount > 0) && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 text-center">
                    <p className="text-green-700 font-semibold text-lg">
                      🎉 Total Savings: ₹{(calculatedPrices.subscriptionDiscount + calculatedPrices.admissionDiscount).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 bg-white">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-bold text-lg hover:bg-gray-300 transition-all shadow-md hover:shadow-lg"
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </span>
                ) : (
                  '✨ Register Member'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {showCouponModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">
                    {couponModalFor === 'subscription' ? '🎫 Subscription Coupons' : '🎟️ Admission Coupons'}
                  </h3>
                  <p className="text-green-100 mt-1">Select a coupon to apply discount</p>
                </div>
                <button
                  onClick={() => setShowCouponModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition"
                >
                  <FiX size={28} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
              {activeCoupons.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">😔</div>
                  <p className="text-gray-500 text-lg">No active coupons available for this category</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeCoupons.map((coupon) => (
                    <div
                      key={coupon._id}
                      className="border-3 border-gray-200 rounded-2xl p-5 hover:border-green-400 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-r from-white to-gray-50"
                      onClick={() => applyCoupon(coupon.code, couponModalFor)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-lg font-bold">
                              {coupon.code}
                            </span>
                            {coupon.typeOfCoupon === 'percentage' ? (
                              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                                {coupon.value}% OFF
                              </span>
                            ) : (
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                                ₹{coupon.value} OFF
                              </span>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            {coupon.maxDiscount && (
                              <p>💰 Max discount: ₹{coupon.maxDiscount}</p>
                            )}
                            {coupon.minCartAmount && (
                              <p>📊 Min amount: ₹{coupon.minCartAmount}</p>
                            )}
                            {coupon.expiryDate && (
                              <p className="text-red-600 font-semibold">
                                ⏰ Expires: {new Date(coupon.expiryDate).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                        <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition font-bold shadow-md">
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerMembers;
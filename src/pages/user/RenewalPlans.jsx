import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios.api';

const RenewalPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await api.get('/user/plans/sub/fetch/all');
        setPlans(response.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSelectPlan = (planId) => {
    navigate(`/member/renewal-billing/${planId}`);
  };

  const handleBack = () => {
    navigate('/member/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center">
        <div className="text-red-500 text-sm font-light tracking-wider">Loading plans...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center">
        <div className="text-red-500 text-sm font-light tracking-wider">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto mb-16">
        <button
          onClick={handleBack}
          className="text-neutral-400 text-xs font-light tracking-wider hover:text-white transition-colors mb-6"
        >
          ← BACK
        </button>
        <h1 className="text-4xl sm:text-5xl font-light text-white mb-2 tracking-tight">
          Renewal Plans
        </h1>
        <p className="text-neutral-400 text-sm font-light">
          Choose your next PT subscription period
        </p>
      </div>

      {plans.length > 0 ? (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="group relative bg-neutral-900/50 border border-white/10 rounded-lg p-6 hover:border-red-500/50 transition-all duration-300 cursor-pointer"
              onClick={() => handleSelectPlan(plan._id)}
            >
              <h2 className="text-2xl font-light text-white mb-2 group-hover:text-red-500 transition-colors">
                {plan.title}
              </h2>

              {plan.bio && (
                <p className="text-neutral-400 text-xs font-light mb-4 leading-relaxed">
                  {plan.bio}
                </p>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-light text-white">
                    ₹{plan.finalPrice}
                  </p>
                  <span className="text-sm font-light text-neutral-500 line-through">
                    ₹{plan.basePrice}
                  </span>
                </div>
                <p className="text-neutral-400 text-xs font-light mt-1">
                  {plan.duration}
                </p>
              </div>

              {plan.benefits && plan.benefits.length > 0 && (
                <div className="mb-6 space-y-2">
                  {plan.benefits.slice(0, 3).map((benefit, idx) => (
                    <p key={benefit._id || idx} className="text-neutral-400 text-xs font-light flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>{benefit.heading}</span>
                    </p>
                  ))}
                  {plan.benefits.length > 3 && (
                    <p className="text-neutral-500 text-xs font-light">
                      +{plan.benefits.length - 3} more benefits
                    </p>
                  )}
                </div>
              )}

              <button className="w-full mt-auto py-2 px-4 border border-white/10 text-white text-xs font-light tracking-wider hover:bg-red-500 hover:border-red-500 hover:text-white transition-all duration-200">
                SELECT PLAN
              </button>

              <div className="absolute top-0 left-0 h-px w-0 bg-red-500 group-hover:w-full transition-all duration-300" />
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-96">
          <p className="text-neutral-500 text-sm font-light">No plans available</p>
        </div>
      )}
    </div>
  );
};

export default RenewalPlans;
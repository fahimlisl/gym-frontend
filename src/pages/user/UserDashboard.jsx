import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import api from "../../api/axios.api";
import UserDashboardLayout from "../../components/layout/UserDashboardLayout";
import UserHeader from "../../components/user/UserHeader";
import SubscriptionSection from "../../components/user/SubscriptionSection";
import PTSection from "../../components/user/PTSection";
import DietSection from "../../components/user/DietSection";

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/user/getProfile");
        setUser(res.data.data);
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center
                      text-gray-500 tracking-widest">
        LOADING DASHBOARD...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center
                      text-red-500 tracking-widest">
        USER NOT FOUND
      </div>
    );
  }

  return (
    <UserDashboardLayout>
      <UserHeader user={user} />

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <SubscriptionSection subscription={user.subscription} />
        <PTSection pt={user.personalTraning} />
      </div>

      <div className="mt-6">
        <DietSection />
      </div>
    </UserDashboardLayout>
  );
}

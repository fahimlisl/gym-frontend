import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import api from "../../api/axios.api";
import UserHeader from "../../components/user/UserHeader";
import SubscriptionSection from "../../components/user/SubscriptionSection";
import PTSection from "../../components/user/PTSection";
import QRWidget from "../../components/user/QRWidget";

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
      <div
        className="min-h-screen bg-neutral-950 flex items-center justify-center
                      text-gray-500 tracking-widest"
      >
        LOADING DASHBOARD...
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="min-h-screen bg-neutral-950 flex items-center justify-center
                      text-red-500 tracking-widest"
      >
        USER NOT FOUND
      </div>
    );
  }

  return (
    <>
      <UserHeader
        user={user}
        onAvatarUpdate={(updater) =>
          setUser((prev) => ({ ...prev, avatar: updater(prev).avatar }))
        }
      />

      <div className="mt-4">
        <QRWidget />
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mt-4">
        <SubscriptionSection subscription={user.subscription} />
        <PTSection pt={user.personalTraning} subscription={user.subscription} />
      </div>

    </>
  );
}

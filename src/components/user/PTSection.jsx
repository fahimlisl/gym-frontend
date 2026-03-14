import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios.api";
import { GetTrainerUI } from "./GetTrainerUI";
import PTRequestStatus from "../../pages/user/PTRequestStatus";

export default function PTSection({ pt }) {

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {

    try {

      const res = await api.get("/user/pt/request/status");

      setStatus(res.data.data);

    } catch (err) {

      if (err.response?.status !== 400) {
        toast.error("Failed to fetch PT request status");
      }

    } finally {

      setLoading(false);

    }

  };

  if (loading) {
    return (
      <div className="border border-white/10 p-10 text-center text-gray-500">
        LOADING PERSONAL TRAINING...
      </div>
    );
  }

  if (pt && pt.subscription?.length && pt.subscription[pt.subscription.length -1].trainer ) {

    const current = pt.subscription.at(-1);

    return (
      <div className="border border-red-600/30 bg-black p-6 rounded-xl">

        <h3 className="font-black tracking-widest mb-4">
          PERSONAL TRAINING
        </h3>

        <div className="flex items-center gap-4 mb-4">

          <img
            src={current.trainer.avatar.url}
            className="w-14 h-14 rounded-full border border-red-600 object-cover"
          />

          <div>
            <p className="font-bold">{current.trainer.fullName}</p>
            <p className="text-xs text-gray-400">
              {current.trainer.experience}
            </p>
          </div>

        </div>

        <Row label="PLAN" value={current.plan.toUpperCase()} />
        <Row label="PRICE" value={`₹${current.price}`} />
        <Row label="STATUS" value={current.status} />
        <Row
          label="VALIDITY"
          value={`${fmt(current.startDate)} → ${fmt(current.endDate)}`}
        />

      </div>
    );

  }

  if (status) {
    return <PTRequestStatus status={status} />;
  }

  return <GetTrainerUI />;

}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

const fmt = (d) => new Date(d).toLocaleDateString();
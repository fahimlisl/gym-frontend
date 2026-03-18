import { useEffect, useState } from "react";
import api from "../../../api/axios.api.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AdminPTRequests() {

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {

      const res = await api.get("/admin/pt/request/all");
      setRequests(res.data.data);

    } catch {
      toast.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-gray-400">
        LOADING REQUESTS...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">

      <h1 className="text-2xl font-black tracking-widest mb-8">
        PERSONAL TRAINING REQUESTS
      </h1>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

        {requests.map((r) => (
          <div
            key={r._id}
            className="border border-white/10 bg-neutral-900 rounded-xl p-5
                       hover:border-red-500 transition cursor-pointer"
            onClick={() => navigate(`/admin/pt/request/${r._id}`)}
          >

            <div className="flex justify-between mb-4">

              <span className="text-xs text-gray-400">
                {new Date(r.createdAt).toLocaleDateString()}
              </span>

              <span
                className={`text-xs font-bold ${
                  r.isApproved ? "text-green-400" : "text-yellow-400"
                }`}
              >
                {r.isApproved ? "APPROVED" : "PENDING"}
              </span>

            </div>

            <div className="space-y-2 text-sm">

              <Row label="PLAN" value={r.plan.toUpperCase()} />
              <Row label="BASE PRICE" value={`₹${r.basePrice}`} />
              <Row label="FINAL PRICE" value={`₹${r.finalPrice}`} />

            </div>

            {/* <img
              src={r.image.url}
              className="mt-4 rounded border border-white/10 h-36 w-full object-cover"
            /> */}

            <button
              className="mt-4 w-full border border-red-600 py-2 text-xs font-bold
                         hover:bg-red-600 transition"
            >
              VIEW DETAILS
            </button>

          </div>
        ))}

      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../api/axios.api.js";
import toast from "react-hot-toast";

export default function AdminPTRequestDetails() {

  const { reqId } = useParams();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequest();
  }, []);

  const fetchRequest = async () => {
    try {

      const res = await api.get(`/admin/pt/request/${reqId}`);

      setRequest(res.data.data);

    } catch {
      toast.error("Failed to fetch request");
    } finally {
      setLoading(false);
    }
  };

  const approve = async () => {

    try {

      await api.post(`/admin/pt/request/approval/${reqId}`);

      toast.success("Request Approved");

      fetchRequest();

    } catch (err) {
      console.log(err)
      toast.error(err?.response?.data?.message || "Approval failed");

    }

  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-gray-400">
        LOADING...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 p-6">

      <div className="border border-white/10 bg-black rounded-xl p-6">

        <h2 className="font-black mb-4">PAYMENT PROOF</h2>

        {/* <img
          src={request.image.url}
          className="rounded border border-white/10"
        /> */}

      </div>

      <div className="border border-white/10 bg-black rounded-xl p-6">

        <h2 className="font-black mb-6">REQUEST DETAILS</h2>

        <div className="space-y-3 text-sm">

          <Row label="PLAN" value={request.plan} />
          <Row label="BASE PRICE" value={`₹${request.basePrice}`} />
          <Row label="FINAL PRICE" value={`₹${request.finalPrice}`} />
          <Row label="PAYMENT METHOD" value={request.paymentMethod} />
          <Row label="REFERENCE" value={request.ref} />

        </div>

        <div className="border-t border-white/10 mt-6 pt-4">

          <h3 className="font-bold mb-3 text-xs text-gray-400">
            DISCOUNT
          </h3>

          <Row label="CODE" value={request.discount.code || "NONE"} />
          <Row label="AMOUNT" value={`₹${request.discount.amount || 0}`} />

        </div>

        {!request.isApproved && (
          <button
            onClick={approve}
            className="mt-8 w-full py-3 font-extrabold tracking-widest
                       bg-green-600 hover:bg-green-700 transition"
          >
            APPROVE REQUEST
          </button>
        )}

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
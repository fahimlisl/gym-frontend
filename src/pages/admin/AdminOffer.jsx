import { useEffect, useState } from "react";
import api from "../../api/axios.api";
import toast from "react-hot-toast";
import { Trash2, Edit, Power } from "lucide-react";

export default function AdminOffer() {
  const [offers, setOffers] = useState([]);
  const [coupons, setCoupons] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    totalSlots: "",
    maxDiscount: "",
    minAmount: "",
    coupon: "",
    category: "SUBSCRIPTION",
    startDate: "",
    expiryDate: "",
    badgeText: "",
  });

  const [editingId, setEditingId] = useState(null);

  const fetchOffers = async () => {
    try {
      const res = await api.get("/admin/offer/fetch/all");
      setOffers(res.data.data || []);
    } catch (err) {
      console.error("Fetch offers error:", err);
      toast.error("Failed to fetch offers");
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await api.get("/admin/fetchAllCoupons");
      setCoupons(res.data.data || []);
    } catch (err) {
      console.error("Fetch coupons error:", err);
      toast.error("Failed to fetch coupons");
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchCoupons();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      totalSlots: "",
      maxDiscount: "",
      minAmount: "",
      coupon: "",
      category: "SUBSCRIPTION",
      startDate: "",
      expiryDate: "",
      badgeText: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.discountType || !form.discountValue || !form.totalSlots || !form.coupon || !form.category) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editingId) {
        await api.post(`/admin/offer/edit/${editingId}`, form);
        toast.success("Offer updated");
      } else {
        await api.post("/admin/offer/add", form);
        toast.success("Offer created");
      }

      resetForm();
      fetchOffers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    
    try {
      await api.delete(`/admin/offer/delete/${id}`);
      toast.success("Deleted");
      fetchOffers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/admin/offer/toggle/${id}`);
      toast.success("Status updated");
      fetchOffers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Toggle failed");
    }
  };

  const handleEdit = (offer) => {
    setEditingId(offer._id);

    setForm({
      title: offer.title || "",
      description: offer.description || "",
      discountType: offer.discountType || "percentage",
      discountValue: offer.discountValue || "",
      totalSlots: offer.totalSlots || "",
      maxDiscount: offer.maxDiscount || "",
      minAmount: offer.minAmount || "",
      coupon: offer.coupon || "",
      category: offer.category || "SUBSCRIPTION",
      startDate: offer.startDate ? offer.startDate.slice(0, 10) : "",
      expiryDate: offer.expiryDate ? offer.expiryDate.slice(0, 10) : "",
      badgeText: offer.badgeText || "",
    });
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-black mb-6">🔥 Offer Management</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4 mb-10 bg-white/5 p-6 rounded-2xl border border-white/10"
      >
        <input 
          name="title" 
          placeholder="Title *" 
          value={form.title} 
          onChange={handleChange} 
          className="input col-span-2 md:col-span-1" 
          required
        />

        <select 
          name="coupon" 
          value={form.coupon} 
          onChange={handleChange} 
          className="input col-span-2 md:col-span-1"
          required
        >
          <option value="">Select Coupon *</option>
          {coupons.map((c) => (
            <option key={c._id} value={c.code}>
              {c.code} ({c.typeOfCoupon === "percentage" ? `${c.value}%` : `₹${c.value}`})
            </option>
          ))}
        </select>

        <input 
          name="discountValue" 
          placeholder="Discount Value *" 
          type="number"
          value={form.discountValue} 
          onChange={handleChange} 
          className="input" 
          required
        />
        
        <input 
          name="totalSlots" 
          placeholder="Total Slots *" 
          type="number"
          value={form.totalSlots} 
          onChange={handleChange} 
          className="input" 
          required
        />

        <select 
          name="discountType" 
          value={form.discountType} 
          onChange={handleChange} 
          className="input"
          required
        >
          <option value="percentage">Percentage</option>
          <option value="flat">Flat</option>
        </select>

        <select 
          name="category" 
          value={form.category} 
          onChange={handleChange} 
          className="input"
          required
        >
          <option value="SUBSCRIPTION">Subscription</option>
          <option value="PT">PT</option>
          <option value="ADMISSION">Admission</option>
          <option value="CAFE">Cafe</option>
        </select>

        <input 
          name="startDate" 
          type="date" 
          value={form.startDate} 
          onChange={handleChange} 
          className="input" 
        />
        
        <input 
          name="expiryDate" 
          type="date" 
          value={form.expiryDate} 
          onChange={handleChange} 
          className="input" 
        />

        <input 
          name="maxDiscount" 
          placeholder="Max Discount (Optional)" 
          type="number"
          value={form.maxDiscount} 
          onChange={handleChange} 
          className="input" 
        />
        
        <input 
          name="minAmount" 
          placeholder="Min Amount (Optional)" 
          type="number"
          value={form.minAmount} 
          onChange={handleChange} 
          className="input" 
        />

        <input 
          name="badgeText" 
          placeholder="Badge Text (Optional)" 
          value={form.badgeText} 
          onChange={handleChange} 
          className="input col-span-2" 
        />

        <textarea 
          name="description" 
          placeholder="Description (Optional)" 
          value={form.description} 
          onChange={handleChange} 
          className="input col-span-2 h-20" 
        />

        <button 
          type="submit"
          className="col-span-2 bg-red-600 hover:bg-red-700 p-3 rounded-xl font-bold transition"
        >
          {editingId ? "Update Offer" : "Create Offer"}
        </button>
      </form>

      <div className="grid md:grid-cols-2 gap-6">
        {offers.length === 0 ? (
          <p className="text-gray-400 col-span-2 text-center py-10">No offers found</p>
        ) : (
          offers.map((offer) => (
            <div
              key={offer._id}
              className="p-5 rounded-2xl bg-gradient-to-br from-black via-neutral-900 to-black border border-white/10 shadow-xl"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-black text-lg text-red-500">
                  {offer.title}
                </h2>

                <span
                  className={`text-xs px-2 py-1 rounded ${
                    offer.isActive ? "bg-green-600" : "bg-gray-600"
                  }`}
                >
                  {offer.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="text-gray-400 text-sm mb-2">
                {offer.description || "No description"}
              </p>

              <p className="text-sm">
                🎯 {offer.discountValue}
                {offer.discountType === "percentage" ? "%" : "₹"} OFF
              </p>

              <p className="text-sm text-gray-400">
                Slots: {offer.totalSlots}
              </p>

              {offer.maxDiscount && (
                <p className="text-sm text-gray-400">
                  Max Discount: ₹{offer.maxDiscount}
                </p>
              )}

              {offer.minAmount && (
                <p className="text-sm text-gray-400">
                  Min Amount: ₹{offer.minAmount}
                </p>
              )}

              <p className="text-xs text-gray-500 mt-1">
                Coupon: {offer.coupon}
              </p>

              {offer.badgeText && (
                <p className="text-xs text-yellow-500 mt-1">
                  🏷️ {offer.badgeText}
                </p>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(offer)}
                  className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>

                <button
                  onClick={() => handleDelete(offer._id)}
                  className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>

                <button
                  onClick={() => handleToggle(offer._id)}
                  className={`p-2 rounded-lg transition ${
                    offer.isActive ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"
                  }`}
                  title={offer.isActive ? "Deactivate" : "Activate"}
                >
                  <Power size={16} />
                </button>
              </div>

              {(offer.startDate || offer.expiryDate) && (
                <div className="mt-3 text-xs text-gray-500 border-t border-white/10 pt-2">
                  {offer.startDate && (
                    <span>From: {new Date(offer.startDate).toLocaleDateString()}</span>
                  )}
                  {offer.expiryDate && (
                    <span className="ml-2">To: {new Date(offer.expiryDate).toLocaleDateString()}</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <style>
        {`
          .input {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            padding: 10px;
            border-radius: 10px;
            outline: none;
            color: white;
          }
          .input:focus {
            border-color: #ef4444;
          }
          .input option {
            background: #1f1f1f;
            color: white;
          }
        `}
      </style>
    </div>
  );
}
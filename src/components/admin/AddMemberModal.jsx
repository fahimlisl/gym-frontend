import { useState } from "react";
import toast from "react-hot-toast";
import { registerMember } from "../../api/admin.api";
import { useEffect } from "react";

function Modal({ title, children, onClose }) {

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur
                    flex items-center justify-center px-4">

      <div className="w-full max-w-3xl max-h-[90vh]
                      overflow-hidden
                      rounded-2xl
                      bg-gradient-to-br from-black via-neutral-900 to-black
                      border border-red-600/30">

        <div className="flex justify-between items-center
                        px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-black tracking-widest">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-64px)]">
          {children}
        </div>
      </div>
    </div>
  );
}


export default function AddMemberModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    // password: "",

    plan: "monthly",
    price: "",
    admissionFee: "",
    paymentMethod: "cash",

    discountType: "none",
    discount: "",

    discountTypeOnAdFee: "none",
    discountOnAdFee: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    if (!avatar) {
      toast.error("Avatar is required");
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("avatar", avatar);

      await registerMember(fd);

      toast.success("Member added successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="ADD MEMBER" onClose={onClose}>
      <form onSubmit={submit} className="grid gap-6">

        <TwoCol>
          <Input label="USERNAME" name="username" onChange={handleChange} required />
          <Input label="PHONE NUMBER" name="phoneNumber" onChange={handleChange} required />
        </TwoCol>

        <Input label="EMAIL (OPTIONAL)" name="email" onChange={handleChange} />
        {/* <Input label="PASSWORD" type="password" name="password" onChange={handleChange} required /> */}

        <FileInput label="AVATAR" onChange={(e) => setAvatar(e.target.files[0])} />

        <TwoCol>
          <Select
            label="PLAN"
            name="plan"
            value={form.plan}
            onChange={handleChange}
            options={["monthly", "quarterly", "half-yearly", "yearly"]}
          />
          <Input label="PLAN PRICE" name="price" onChange={handleChange} required />
        </TwoCol>

        <DiscountBlock
          title="PLAN DISCOUNT"
          typeName="discountType"
          valueName="discount"
          form={form}
          onChange={handleChange}
        />

        <Input label="ADMISSION FEE" name="admissionFee" onChange={handleChange} required />

        <DiscountBlock
          title="ADMISSION DISCOUNT"
          typeName="discountTypeOnAdFee"
          valueName="discountOnAdFee"
          form={form}
          onChange={handleChange}
        />

        <Select
          label="PAYMENT METHOD"
          name="paymentMethod"
          value={form.paymentMethod}
          onChange={handleChange}
          options={["cash", "upi", "card", "netbanking"]}
        />

        <Actions loading={loading} onClose={onClose} />
      </form>
    </Modal>
  );
}


function TwoCol({ children }) {
  return <div className="grid md:grid-cols-2 gap-4">{children}</div>;
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-xs tracking-widest text-gray-400">{label}</label>
      <input
        {...props}
        className="mt-2 w-full bg-neutral-900 border border-white/10
                   px-4 py-3 text-sm focus:border-red-600 outline-none rounded-lg"
      />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div>
      <label className="text-xs tracking-widest text-gray-400">{label}</label>
      <select
        {...props}
        className="mt-2 w-full bg-neutral-900 border border-white/10
                   px-4 py-3 text-sm focus:border-red-600 outline-none rounded-lg"
      >
        {options.map(o => (
          <option key={o} value={o}>{o.toUpperCase()}</option>
        ))}
      </select>
    </div>
  );
}

function FileInput({ label, onChange }) {
  return (
    <div>
      <label className="text-xs tracking-widest text-gray-400">{label}</label>
      <input type="file" accept="image/*" onChange={onChange}
             className="mt-2 text-sm text-gray-300" />
    </div>
  );
}

function DiscountBlock({ title, typeName, valueName, form, onChange }) {
  return (
    <div className="border border-white/10 p-4 rounded-xl space-y-3">
      <p className="text-xs tracking-widest text-red-500">{title}</p>

      <TwoCol>
        <Select
          label="DISCOUNT TYPE"
          name={typeName}
          value={form[typeName]}
          onChange={onChange}
          options={["none", "percentage", "flat"]}
        />

        {form[typeName] !== "none" && (
          <Input
            label={form[typeName] === "percentage" ? "PERCENT (%)" : "AMOUNT (₹)"}
            name={valueName}
            onChange={onChange}
          />
        )}
      </TwoCol>
    </div>
  );
}

function Actions({ loading, onClose }) {
  return (
    <div className="flex justify-end gap-4 pt-4">
      <button type="button" onClick={onClose}
              className="border border-white/20 px-6 py-3 text-xs font-bold">
        CANCEL
      </button>
      <button type="submit" disabled={loading}
              className="bg-red-600 hover:bg-red-700 px-8 py-3
                         text-xs font-extrabold tracking-widest rounded-lg">
        {loading ? "ADDING..." : "ADD MEMBER"}
      </button>
    </div>
  );
}
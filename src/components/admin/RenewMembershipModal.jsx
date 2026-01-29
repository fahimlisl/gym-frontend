import { useState } from "react";
import toast from "react-hot-toast";
import { renewMembership } from "../../api/admin.api";

export default function RenewMembershipModal({ userId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    plan: "monthly",
    price: "",
    paymentMethod: "cash",
    discountType: "none",
    discount: "",
  });

  const submit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await renewMembership(userId, form);
      toast.success("Membership renewed successfully");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to renew membership");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="RENEW MEMBERSHIP" onClose={onClose}>
      <form onSubmit={submit} className="space-y-8">

        <TwoCol>
          <Select
            label="PLAN"
            value={form.plan}
            onChange={(e) =>
              setForm({ ...form, plan: e.target.value })
            }
            options={["monthly", "quarterly", "half-yearly", "yearly"]}
          />

          <Input
            label="BASE PRICE (₹)"
            type="number"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
            required
          />
        </TwoCol>

        <DiscountBlock
          title="DISCOUNT (OPTIONAL)"
          typeName="discountType"
          valueName="discount"
          form={form}
          onChange={(e) =>
            setForm({ ...form, [e.target.name]: e.target.value })
          }
        />

        <Select
          label="PAYMENT METHOD"
          value={form.paymentMethod}
          onChange={(e) =>
            setForm({ ...form, paymentMethod: e.target.value })
          }
          options={["cash", "upi", "card", "netbanking"]}
        />

        <Actions
          loading={loading}
          onClose={onClose}
          submitText="RENEW MEMBERSHIP"
        />
      </form>
    </Modal>
  );
}


function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center px-4">
      <div
        className="w-full max-w-2xl rounded-2xl
                   bg-gradient-to-br from-black via-neutral-900 to-black
                   border border-red-600/30 shadow-2xl p-8"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black tracking-widest text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-xl"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function DiscountBlock({ title, typeName, valueName, form, onChange }) {
  return (
    <div className="border border-red-600/20 rounded-xl p-5 bg-black/40 space-y-4">
      <p className="text-xs tracking-widest text-red-500 font-bold">
        {title}
      </p>

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
            label={
              form[typeName] === "percentage"
                ? "DISCOUNT (%)"
                : "DISCOUNT AMOUNT (₹)"
            }
            name={valueName}
            type="number"
            onChange={onChange}
          />
        )}
      </TwoCol>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-xs tracking-widest text-gray-400">
        {label}
      </label>
      <input
        {...props}
        className="
          mt-2 w-full rounded-lg
          bg-neutral-100 text-black
          border border-neutral-300
          px-4 py-3 text-sm
          focus:outline-none focus:border-red-600
        "
      />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div>
      <label className="text-xs tracking-widest text-gray-400">
        {label}
      </label>
      <select
        {...props}
        className="
          mt-2 w-full rounded-lg
          bg-neutral-100 text-black
          border border-neutral-300
          px-4 py-3 text-sm
          focus:outline-none focus:border-red-600
        "
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}

const TwoCol = ({ children }) => (
  <div className="grid md:grid-cols-2 gap-4">{children}</div>
);

const Actions = ({ loading, onClose, submitText }) => (
  <div className="flex justify-end gap-4 pt-8 border-t border-white/10">
    <button
      type="button"
      onClick={onClose}
      className="border border-white/20 px-6 py-3
                 text-xs font-extrabold tracking-widest
                 text-gray-300 hover:border-red-600"
    >
      CANCEL
    </button>

    <button
      type="submit"
      disabled={loading}
      className="bg-red-600 hover:bg-red-700
                 px-10 py-3 text-xs font-extrabold tracking-widest
                 text-white disabled:opacity-50"
    >
      {loading ? "PROCESSING..." : submitText}
    </button>
  </div>
);

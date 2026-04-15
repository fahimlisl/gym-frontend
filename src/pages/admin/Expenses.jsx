import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../api/axios.api.js";
import * as XLSX from "xlsx";

const categories = [
  "RENT", "SALARY", "ELECTRICITY", "WATER", "EQUIPMENT",
  "MAINTENANCE", "MARKETING", "INTERNET", "ETC",
];

const emptyForm = {
  title: "", amount: "", remarks: "",
  category: "", paymentMethod: "cash", transactionId: "",
};

const FormFields = ({ data, setData }) => (
  <div className="space-y-4">
    <input
      className="w-full bg-black border border-white/20 px-4 py-3"
      placeholder="Expense title"
      value={data.title}
      onChange={(e) => setData({ ...data, title: e.target.value })}
    />
    <input
      type="number"
      className="w-full bg-black border border-white/20 px-4 py-3"
      placeholder="Amount"
      value={data.amount}
      onChange={(e) => setData({ ...data, amount: e.target.value })}
    />
    <select
      className="w-full bg-black border border-white/20 px-4 py-3"
      value={data.category}
      onChange={(e) => setData({ ...data, category: e.target.value })}
    >
      <option value="">Select Category</option>
      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
    </select>
    <select
      className="w-full bg-black border border-white/20 px-4 py-3"
      value={data.paymentMethod}
      onChange={(e) => setData({ ...data, paymentMethod: e.target.value })}
    >
      <option value="cash">Cash</option>
      <option value="upi">UPI</option>
      <option value="card">Card</option>
      <option value="netbanking">Net Banking</option>
    </select>
    {data.paymentMethod === "upi" && (
      <input
        className="w-full bg-black border border-white/20 px-4 py-3"
        placeholder="UPI Transaction ID"
        value={data.transactionId}
        onChange={(e) => setData({ ...data, transactionId: e.target.value })}
      />
    )}
    <textarea
      className="w-full bg-black border border-white/20 px-4 py-3"
      placeholder="Remarks"
      rows={3}
      value={data.remarks}
      onChange={(e) => setData({ ...data, remarks: e.target.value })}
    />
  </div>
);

export default function Expenses() {
  const [expenses, setExpenses]     = useState([]);
  const [loading, setLoading]       = useState(true);

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const [fromDate, setFromDate]           = useState(today);
  const [toDate, setToDate]               = useState(today);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(emptyForm);

  const [showEditModal, setShowEditModal]   = useState(false);
  const [editForm, setEditForm]             = useState(emptyForm);
  const [editingId, setEditingId]           = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null); 

  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get("/admin/fetchAllExpenses");
      setExpenses(res.data.data || []);
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const expenseDate = new Date(e.createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      
      return (
        expenseDate >= fromDate && 
        expenseDate <= toDate &&
        (categoryFilter === "all" || e.category === categoryFilter)
      );
    });
  }, [expenses, fromDate, toDate, categoryFilter]);

  const exportExcel = () => {
    if (!filteredExpenses.length) return toast.error("No data to export");
    const data = filteredExpenses.map((e) => ({
      Date: new Date(e.createdAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }),
      Title: e.title, Category: e.category, Amount: e.amount,
      PaymentMethod: e.paymentMethod, Remarks: e.remarks || "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");
    XLSX.writeFile(wb, `Expenses_${fromDate}_to_${toDate}.xlsx`, { bookType: "xlsx" });
    toast.success("Excel exported");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post("/admin/add-expense", form);
      toast.success("Expense added");
      setShowModal(false);
      setForm(emptyForm);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (expense) => {
    setEditingId(expense._id);
    setEditForm({
      title:         expense.title,
      amount:        String(expense.amount),
      remarks:       expense.remarks || "",
      category:      expense.category,
      paymentMethod: expense.paymentMethod,
      transactionId: expense.transactionId || "",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.patch(`/admin/edit-expense/${editingId}`, editForm);
      toast.success("Expense updated");
      setShowEditModal(false);
      setEditingId(null);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update expense");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/admin/delete-expense/${deleteTarget.id}`);
      toast.success("Expense deleted");
      setDeleteTarget(null);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete expense");
    }
  };

  return (
    <>
      <div className="space-y-8">

        <div className="border border-red-600/30 bg-black p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-widest">EXPENSES</h1>
            <p className="text-sm text-gray-400 mt-2">Track & manage outgoing payments</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 font-bold tracking-widest w-full sm:w-auto"
          >
            + ADD EXPENSE
          </button>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-end">
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
            className="bg-black border border-white/20 px-4 py-2 w-full sm:w-auto" />
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
            className="bg-black border border-white/20 px-4 py-2 w-full sm:w-auto" />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-black border border-white/20 px-4 py-2 w-full sm:w-auto">
            <option value="all">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={exportExcel}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 font-bold w-full sm:w-auto sm:ml-auto">
            EXPORT EXCEL
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500 tracking-widest">LOADING EXPENSES...</p>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto border border-white/10">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-white/10">
                    <th className="p-3 text-left">DATE</th>
                    <th className="p-3 text-left">TITLE</th>
                    <th className="p-3 text-left">CATEGORY</th>
                    <th className="p-3 text-right">AMOUNT (₹)</th>
                    <th className="p-3 text-left">METHOD</th>
                    <th className="p-3 text-left">REMARKS</th>
                    <th className="p-3 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((e) => (
                    <tr key={e._id} className="border-t border-white/5 hover:bg-white/5">
                      <td className="p-3">
                        {new Date(e.createdAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}
                      </td>
                      <td className="p-3 font-semibold">{e.title}</td>
                      <td className="p-3 text-xs tracking-widest">{e.category}</td>
                      <td className="p-3 text-right text-red-500 font-bold">₹{e.amount}</td>
                      <td className="p-3 uppercase text-sm">{e.paymentMethod}</td>
                      <td className="p-3 text-gray-400 text-sm">{e.remarks || "—"}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(e)}
                            className="px-3 py-1 text-xs border border-white/20 hover:bg-white/10 tracking-widest"
                          >
                            EDIT
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: e._id, title: e.title })}
                            className="px-3 py-1 text-xs border border-red-600/50 text-red-500 hover:bg-red-600/10 tracking-widest"
                          >
                            DELETE
                          </button>
                        </div>
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-4">
              {filteredExpenses.map((e) => (
                <div key={e._id} className="border border-white/10 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Date</span>
                    <span>{new Date(e.createdAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Title</span>
                    <span className="font-semibold">{e.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category</span>
                    <span>{e.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount</span>
                    <span className="text-red-500 font-bold">₹{e.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Method</span>
                    <span className="uppercase text-sm">{e.paymentMethod}</span>
                  </div>
                  {e.remarks && (
                    <div className="text-sm text-gray-400 pt-1">{e.remarks}</div>
                  )}
                  <div className="flex gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => openEdit(e)}
                      className="flex-1 py-2 text-xs border border-white/20 hover:bg-white/10 tracking-widest"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ id: e._id, title: e.title })}
                      className="flex-1 py-2 text-xs border border-red-600/50 text-red-500 hover:bg-red-600/10 tracking-widest"
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!filteredExpenses.length && (
              <p className="text-center text-gray-500 py-6">No expenses found for selected filters</p>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/10 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-black tracking-widest mb-6">ADD EXPENSE</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormFields data={form} setData={setForm} />
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-white/20 w-full sm:w-auto">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-6 py-2 bg-red-600 font-bold w-full sm:w-auto disabled:opacity-50">
                  {submitting ? "SAVING..." : "SAVE EXPENSE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/10 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-black tracking-widest mb-6">EDIT EXPENSE</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <FormFields data={editForm} setData={setEditForm} />
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <button type="button"
                  onClick={() => { setShowEditModal(false); setEditingId(null); }}
                  className="px-6 py-2 border border-white/20 w-full sm:w-auto">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-6 py-2 bg-red-600 font-bold w-full sm:w-auto disabled:opacity-50">
                  {submitting ? "UPDATING..." : "UPDATE EXPENSE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-red-600/40 w-full max-w-sm p-6 space-y-6">

            <div className="flex items-center justify-center w-14 h-14 border-2 border-red-600 mx-auto">
              <span className="text-red-500 text-2xl font-black">!</span>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-lg font-black tracking-widest">DELETE EXPENSE?</h2>
              <p className="text-gray-400 text-sm">
                You're about to permanently delete{" "}
                <span className="text-white font-semibold">"{deleteTarget.title}"</span>.
                This will also remove its linked transaction record.
              </p>
              <p className="text-red-500 text-xs tracking-widest">THIS ACTION CANNOT BE UNDONE</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 border border-white/20 text-sm font-bold tracking-widest hover:bg-white/5"
              >
                CANCEL
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-sm font-bold tracking-widest"
              >
                YES, DELETE
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
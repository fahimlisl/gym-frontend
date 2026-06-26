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

const StatCard = ({ label, value, sub, color = "text-white", icon }) => (
  <div className="flex flex-col rounded-xl bg-gradient-to-br from-black via-neutral-900 to-black border border-white/10 p-3 md:p-5">
    <div className="flex items-center justify-between">
      <p className="text-[8px] md:text-[10px] text-gray-500 tracking-widest uppercase font-semibold">{label}</p>
      {icon && <span className="text-base md:text-xl">{icon}</span>}
    </div>
    <p className={`text-base md:text-2xl font-black mt-1 md:mt-2 ${color} truncate`}>₹{value}</p>
    {sub && <p className="text-[8px] md:text-xs text-gray-500 mt-0.5 md:mt-1">{sub}</p>}
  </div>
);

const SectionLabel = ({ children }) => (
  <p className="text-[10px] text-gray-500 tracking-widest uppercase font-semibold px-1">{children}</p>
);

export default function Expenses() {
  const [expenses, setExpenses]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

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

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const { data } = await axios.get("/admin/get/me");
        setIsSuperAdmin(data?.admin?.isSuperAdmin ?? false);
      } catch {
        setIsSuperAdmin(false);
      }
    };
    fetchAdmin();
  }, []);

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

  const calculateStats = (expenseList) => {
    const total = expenseList.reduce((sum, e) => sum + e.amount, 0);
    const cash = expenseList.filter(e => e.paymentMethod === "cash").reduce((sum, e) => sum + e.amount, 0);
    const upi = expenseList.filter(e => e.paymentMethod === "upi").reduce((sum, e) => sum + e.amount, 0);
    const online = expenseList.filter(e => e.paymentMethod === "card" || e.paymentMethod === "netbanking").reduce((sum, e) => sum + e.amount, 0);
    const count = expenseList.length;
    
    const categoryBreakdown = {};
    expenseList.forEach(e => {
      if (!categoryBreakdown[e.category]) {
        categoryBreakdown[e.category] = 0;
      }
      categoryBreakdown[e.category] += e.amount;
    });

    return { total, cash, upi, online, count, categoryBreakdown };
  };

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

  const filteredStats = useMemo(() => {
    return calculateStats(filteredExpenses);
  }, [filteredExpenses]);
  const allTimeStats = useMemo(() => {
    return calculateStats(expenses);
  }, [expenses]);

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

  const fmt = (n) => Math.round(n).toLocaleString("en-IN");

  // Get top category
  const getTopCategory = (breakdown) => {
    if (!breakdown || Object.keys(breakdown).length === 0) return null;
    const entries = Object.entries(breakdown);
    const top = entries.reduce((a, b) => a[1] > b[1] ? a : b);
    return { category: top[0], amount: top[1] };
  };

  const topCategory = getTopCategory(filteredStats.categoryBreakdown);

  return (
    <>
      <div className="space-y-8">

        <div className="border border-red-600/30 bg-black p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-widest">EXPENSES</h1>
            <p className="text-sm text-gray-400 mt-2">Track & manage outgoing payments</p>
            {!isSuperAdmin && (
              <p className="text-xs text-yellow-500 mt-1">🔒 View-only mode - You can view & export but cannot modify</p>
            )}
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={exportExcel}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 font-bold tracking-widest flex-1 sm:flex-none">
              EXPORT
            </button>
            {isSuperAdmin && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-red-600 hover:bg-red-700 px-6 py-3 font-bold tracking-widest flex-1 sm:flex-none"
              >
                + ADD
              </button>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <SectionLabel>Lifetime Statistics (All Time)</SectionLabel>
          <div className="grid grid-cols-3 gap-1.5 md:gap-3">
            <StatCard 
              label="Total" 
              value={fmt(allTimeStats.total)} 
              color="text-red-500" 
              icon="💰"
              sub={`${allTimeStats.count} txns`}
            />
            <StatCard 
              label="Cash" 
              value={fmt(allTimeStats.cash)} 
              color="text-green-400" 
              icon="💵"
            />
            <StatCard 
              label="UPI" 
              value={fmt(allTimeStats.upi)} 
              color="text-blue-400" 
              icon="📱"
            />
          </div>
          {allTimeStats.count > 0 && (
            <div className="text-[10px] md:text-xs text-gray-500 px-1">
              Avg: ₹{fmt(allTimeStats.total / allTimeStats.count)} / txn
            </div>
          )}
        </div>
        <div className="space-y-2">
          <SectionLabel>
            {fromDate === toDate
              ? `Stats for ${new Date(fromDate).toLocaleDateString("en-IN")}`
              : `Stats: ${new Date(fromDate).toLocaleDateString("en-IN")} – ${new Date(toDate).toLocaleDateString("en-IN")}`}
          </SectionLabel>
          <div className="grid grid-cols-3 gap-1.5 md:gap-3">
            <StatCard 
              label="Total" 
              value={fmt(filteredStats.total)} 
              color="text-red-500" 
              icon="💰"
              sub={`${filteredStats.count} txns`}
            />
            <StatCard 
              label="Cash" 
              value={fmt(filteredStats.cash)} 
              color="text-green-400" 
              icon="💵"
            />
            <StatCard 
              label="UPI" 
              value={fmt(filteredStats.upi)} 
              color="text-blue-400" 
              icon="📱"
            />
          </div>
          {filteredStats.count > 0 && (
            <div className="flex flex-wrap items-center gap-1 md:gap-3 text-[10px] md:text-xs text-gray-500 px-1">
              <span>Avg: ₹{fmt(filteredStats.total / filteredStats.count)}</span>
              {topCategory && (
                <span className="flex items-center gap-1">
                  <span className="text-yellow-500">🏆</span>
                  <span className="text-white font-semibold">{topCategory.category}</span>
                  <span className="text-gray-400">(₹{fmt(topCategory.amount)})</span>
                </span>
              )}
            </div>
          )}
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
                        {isSuperAdmin ? (
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
                        ) : (
                          <span className="text-gray-500 text-xs font-semibold tracking-widest">
                            VIEW ONLY
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/10 bg-neutral-900/60">
                    <td colSpan={3} className="p-3 text-xs text-gray-500 font-extrabold uppercase tracking-widest">
                      Total ({filteredExpenses.length} records)
                    </td>
                    <td className="p-3 text-right font-black text-red-500">
                      ₹{fmt(filteredStats.total)}
                    </td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
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
                  {isSuperAdmin ? (
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
                  ) : (
                    <div className="text-center py-2 text-xs text-gray-500 font-semibold tracking-widest border-t border-white/10">
                      VIEW ONLY
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!filteredExpenses.length && (
              <div className="border border-white/10 bg-gradient-to-br from-black via-neutral-900 to-black rounded-xl p-12 text-center">
                <p className="text-gray-500 font-semibold text-sm">NO EXPENSES FOUND</p>
                {isSuperAdmin && (
                  <button onClick={() => setShowModal(true)}
                    className="mt-4 flex items-center gap-2 mx-auto bg-red-600 hover:bg-red-700 transition px-4 py-2 text-[11px] font-extrabold rounded-lg text-white">
                    + ADD YOUR FIRST EXPENSE
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {showModal && isSuperAdmin && (
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

      {showEditModal && isSuperAdmin && (
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

      {deleteTarget && isSuperAdmin && (
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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCog, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { fetchAllAdmins } from "../../api/admin.api.js";
import api from "../../api/axios.api.js";
import AddAdminModal from "../../components/admin/AddAdminModal.jsx";

export default function AdminsListPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const { data } = await fetchAllAdmins();
      setAdmins(data?.data ?? []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const deleteAdmin = async (adminId, adminName) => {
    if (!window.confirm(`Are you sure you want to delete admin "${adminName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(adminId);
      await api.delete(`/admin/remove/admin/${adminId}`);
      toast.success(`${adminName} deleted successfully`);
      setAdmins((prev) => prev.filter((a) => a._id !== adminId));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete admin");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="text-gray-400 p-6">Loading admins...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black tracking-widest text-red-600">
          ADMINS
        </h1>

        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition px-4 py-2 text-xs font-extrabold tracking-widest rounded-lg text-white"
        >
          <Plus size={16} />
          ADD ADMIN
        </button>
      </div>

      {admins.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-10 text-center text-gray-500">
          NO ADMINS FOUND
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {admins.map((admin) => (
            <div
              key={admin._id}
              className="flex items-center justify-between p-4 rounded-xl
                         bg-neutral-950 border border-white/10
                         hover:border-red-600/50 transition"
            >
              <button
                onClick={() => navigate(`/admin/admins/${admin._id}`)}
                className="flex items-center gap-3 flex-1 text-left"
              >
                <UserCog className="text-red-600" size={20} />
                <div>
                  <p className="text-white font-bold text-sm">{admin.username}</p>
                  <p className="text-gray-500 text-xs">{admin.email}</p>
                </div>
              </button>

              <button
                onClick={() => deleteAdmin(admin._id, admin.username)}
                disabled={deletingId === admin._id}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                title="Delete admin"
              >
                {deletingId === admin._id ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-red-500 rounded-full animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {addOpen && (
        <AddAdminModal
          onClose={() => setAddOpen(false)}
          onSuccess={loadAdmins}
        />
      )}
    </div>
  );
}
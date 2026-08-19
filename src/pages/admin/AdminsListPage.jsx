import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCog, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { fetchAllAdmins } from "../../api/admin.api.js";
import AddAdminModal from "../../components/admin/AddAdminModal.jsx";

export default function AdminsListPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
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
            <button
              key={admin._id}
              onClick={() => navigate(`/admin/admins/${admin._id}`)}
              className="flex items-center gap-3 p-4 rounded-xl
                         bg-neutral-950 border border-white/10
                         hover:border-red-600/50 transition text-left"
            >
              <UserCog className="text-red-600" size={20} />
              <div>
                <p className="text-white font-bold text-sm">{admin.username}</p>
                <p className="text-gray-500 text-xs">{admin.email}</p>
              </div>
            </button>
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
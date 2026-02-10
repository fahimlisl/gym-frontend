import { useEffect, useState } from "react";
import { Plus, Trash2, Shield } from "lucide-react";
import toast from "react-hot-toast";

import AddCafeAdminModal from "../../components/admin/cafe/AddCafeAdminModal.jsx";
import { fetchAllCafeAdmin, destroyCafeAdmin } from "../../api/admin.api.js";

export default function CafeAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetchAllCafeAdmin();
      setAdmins(res.data.data || []);
    } catch {
      toast.error("Failed to load cafe admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const removeAdmin = async (id) => {
    if (!confirm("Remove this cafe admin?")) return;

    try {
      await destroyCafeAdmin(id);
      toast.success("Cafe admin removed");
      loadAdmins();
    } catch {
      toast.error("Failed to remove cafe admin");
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div
          className="flex justify-between items-center
                        border border-red-600/30 bg-gradient-to-br
                        from-black via-neutral-900 to-black
                        p-6 rounded-xl"
        >
          <div>
            <h1 className="text-3xl font-black tracking-widest">CAFE ADMINS</h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage cafe staff & permissions
            </p>
          </div>

          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-2
                       bg-red-600 hover:bg-red-700
                       px-6 py-3 text-xs font-extrabold
                       tracking-widest rounded-lg
                       shadow-lg shadow-red-600/30"
          >
            <Plus size={16} />
            ADD CAFE ADMIN
          </button>
        </div>

        {loading && (
          <div className="text-gray-500 tracking-widest">LOADING ADMINS...</div>
        )}

        {!loading && admins.length === 0 && (
          <div className="border border-white/10 p-12 text-center text-gray-500">
            NO CAFE ADMINS FOUND
          </div>
        )}

        {!loading && admins.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {admins.map((admin) => (
              <CafeAdminCard
                key={admin._id}
                admin={admin}
                onDelete={() => removeAdmin(admin._id)}
              />
            ))}
          </div>
        )}
      </div>

      {openAdd && (
        <AddCafeAdminModal
          onClose={() => setOpenAdd(false)}
          onSuccess={loadAdmins}
        />
      )}
    </>
  );
}

function CafeAdminCard({ admin, onDelete }) {
  return (
    <div
      className="border border-white/10 bg-gradient-to-br
                    from-black via-neutral-900 to-black
                    rounded-xl p-6 space-y-4
                    hover:border-red-600/40 transition"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full
                          bg-red-600/20 flex items-center justify-center"
          >
            <Shield size={18} className="text-red-500" />
          </div>

          <div>
            <h3 className="font-black tracking-wide">{admin.username}</h3>
            <p className="text-xs text-gray-400">Cafe Staff</p>
          </div>
        </div>

        <button onClick={onDelete} className="text-gray-400 hover:text-red-500">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="text-sm space-y-2 text-gray-300">
        <p>
          <span className="text-gray-400">Phone:</span> {admin.phoneNumber}
        </p>

        {admin.email && (
          <p>
            <span className="text-gray-400">Email:</span> {admin.email}
          </p>
        )}

        {admin.salary && (
          <p>
            <span className="text-gray-400">Salary:</span> ₹{admin.salary}
          </p>
        )}
      </div>
    </div>
  );
}

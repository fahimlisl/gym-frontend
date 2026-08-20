import { useEffect, useState } from "react";
import { Plus, Trash2, Shield, Lock } from "lucide-react";
import toast from "react-hot-toast";

import AddCafeAdminModal from "../../components/admin/cafe/AddCafeAdminModal.jsx";
import { fetchAllCafeAdmin, destroyCafeAdmin } from "../../api/admin.api.js";
import api from "../../api/axios.api.js";

export default function CafeAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);

  const [admin, setAdmin] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const { data } = await api.get("/admin/get/me");
        setAdmin(data?.admin ?? null);
      } catch {
        setAdmin(null);
      } finally {
        setAdminLoading(false);
      }
    };
    fetchAdmin();
  }, []);

  const isSuperAdmin = admin?.isSuperAdmin ?? false;
  const isAllowed = isSuperAdmin || !!admin?.cafe_admins?.allow;
  const isReadOnly = !isSuperAdmin && !!admin?.cafe_admins?.isReadOnly;
  const canEdit = isAllowed && !isReadOnly;
  const lockTitle = isReadOnly ? "Read-only access" : "";

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
    if (isAllowed) loadAdmins();
  }, [isAllowed]);

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

  if (adminLoading) {
    return <div className="p-8 text-gray-400 tracking-widest">LOADING...</div>;
  }

  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Lock size={40} className="text-red-600 mb-4" />
        <h2 className="text-lg font-bold mb-1">Access restricted</h2>
        <p className="text-gray-500 text-sm">
          You don't have permission to manage cafe admins.
        </p>
      </div>
    );
  }

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
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-black tracking-widest">CAFE ADMINS</h1>
              {isReadOnly && (
                <span className="flex items-center gap-1 text-xs font-bold tracking-wide text-yellow-500">
                  <Lock size={12} /> READ ONLY
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Manage cafe staff & permissions
            </p>
          </div>

          {canEdit && (
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
          )}
          {!canEdit && isAllowed && (
            <div className="flex items-center px-4 py-2 border border-yellow-500/30 rounded-lg text-yellow-500 text-[10px] font-bold tracking-widest">
              VIEW ONLY
            </div>
          )}
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
                canEdit={canEdit}
              />
            ))}
          </div>
        )}
      </div>

      {openAdd && canEdit && (
        <AddCafeAdminModal
          onClose={() => setOpenAdd(false)}
          onSuccess={loadAdmins}
        />
      )}
    </>
  );
}

function CafeAdminCard({ admin, onDelete, canEdit }) {
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

        {canEdit && (
          <button onClick={onDelete} className="text-gray-400 hover:text-red-500">
            <Trash2 size={16} />
          </button>
        )}
        {!canEdit && (
          <span className="text-[10px] text-gray-500 font-semibold">VIEW ONLY</span>
        )}
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
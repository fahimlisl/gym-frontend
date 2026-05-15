import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";

import MemberCard from "../../components/admin/MemberCard";
import AddMemberModal from "../../components/admin/AddMemberModal";
import { fetchAllMembers } from "../../api/admin.api.js";

export default function Members() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const getLatestSubscription = (user) => {
    const subs = user?.subscription?.subscription;
    if (!Array.isArray(subs) || subs.length === 0) return null;

    return [...subs].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )[0];
  };

  const getLatestStatus = (user) => {
    const latest = getLatestSubscription(user);
    return latest?.status || "none";
  };

  const loadMembers = async () => {
    try {
      setLoading(true);
      const res = await fetchAllMembers();
      setUsers(res.data.data || []);
    } catch {
      toast.error("Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  const ptAlerts = useMemo(() => {
    return users.filter((u) => {
      const ptSubs = u?.personalTraning?.subscription;
      const latestPT = ptSubs?.[ptSubs.length - 1];
      const isPTActive = latestPT?.status === "active";
      if (!isPTActive) return false;
      return !u?.diet || !u?.workout;
    }).map((u) => {
      const missing = [];
      if (!u?.diet) missing.push("diet");
      if (!u?.workout) missing.push("workout");
      return { id: u._id, name: u.username, missing };
    });
  }, [users]);

  useEffect(() => {
    loadMembers();
  }, []);

  const sortMembers = (members) => {
    return [...members].sort((a, b) => {
      const statusA = getLatestStatus(a);
      const statusB = getLatestStatus(b);
      
      const subA = getLatestSubscription(a);
      const subB = getLatestSubscription(b);
      const dateA = subA?.createdAt ? new Date(subA.createdAt) : new Date(a.createdAt || 0);
      const dateB = subB?.createdAt ? new Date(subB.createdAt) : new Date(b.createdAt || 0);
      
      const priority = {
        "expired": 1,
        "active": 2,
        "none": 3
      };
      
      const priorityA = priority[statusA] || 3;
      const priorityB = priority[statusB] || 3;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      return dateB - dateA;
    });
  };

const filteredUsers = useMemo(() => {
  let filtered = users.filter((u) => {
    if (!u) return false;
    
    const status = getLatestStatus(u);
    
    const ptSubscriptions = u?.personalTraning?.subscription;
    const latestPT = ptSubscriptions?.[ptSubscriptions.length - 1];
    const hasPT = latestPT?.status === "active";

    const searchLower = search.toLowerCase().trim();
    let matchesSearch = true;
    
    if (searchLower) {
      const nameMatch = u.username?.toLowerCase().includes(searchLower) || false;
      
      const phoneNumberStr = u.phoneNumber ? String(u.phoneNumber) : '';
      const phoneMatch = phoneNumberStr.toLowerCase().includes(searchLower) || false;
      
      matchesSearch = nameMatch || phoneMatch;
    }

    let matchesFilter = true;

    switch (filter) {
      case "expired":
        matchesFilter = status === "expired";
        break;
      case "active":
        matchesFilter = status === "active";
        break;
      case "withPT":
        matchesFilter = hasPT === true;
        break;
      case "withoutPT":
        matchesFilter = !hasPT;
        break;
      case "expiredWithPT":
        matchesFilter = status === "expired" && hasPT;
        break;
      case "expiredWithoutPT":
        matchesFilter = status === "expired" && !hasPT;
        break;
      default:
        matchesFilter = true;
    }

    return matchesSearch && matchesFilter;
  });

  return sortMembers(filtered);
}, [users, search, filter]);
  return (
    <>
      <div className="space-y-10">

        <div className="relative overflow-hidden rounded-2xl
                        bg-gradient-to-br from-black via-neutral-900 to-black
                        border border-red-600/25 p-6 sm:p-8">

          <div className="relative z-10 flex flex-col lg:flex-row
                          lg:items-center lg:justify-between gap-6">

            <div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-widest">
                MEMBERS
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-3 max-w-xl">
                Manage gym members, memberships and personal training
                from a single control panel.
              </p>
            </div>

            <button
              onClick={() => setOpenAdd(true)}
              className="bg-red-600 hover:bg-red-700
                         px-6 sm:px-10 py-3 sm:py-4
                         text-[10px] sm:text-xs
                         font-extrabold tracking-widest
                         shadow-[0_0_40px_rgba(239,68,68,0.35)]"
            >
              ADD MEMBER
            </button>
          </div>

          <div className="absolute -top-24 -right-24 w-96 h-96
                          bg-red-600/10 blur-3xl rounded-full" />
        </div>

        {ptAlerts.length > 0 && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                strokeLinejoin="round" className="text-yellow-400 shrink-0">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <p className="text-yellow-400 text-xs font-black tracking-widest">
                ACTION REQUIRED — {ptAlerts.length} PT {ptAlerts.length === 1 ? "MEMBER" : "MEMBERS"} PENDING
              </p>
            </div>
            <div className="space-y-1.5">
              {ptAlerts.map((alert) => (
                <div key={alert.id}
                  className="flex items-center justify-between
                             bg-yellow-500/[0.06] border border-yellow-500/20
                             rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-xs font-bold">{alert.name}</span>
                    <span className="text-yellow-400/70 text-[10px]">
                      — {alert.missing.join(" & ")} not provided
                    </span>
                  </div>
                  <Link
                    to={`/admin/members/${alert.id}`}
                    className="text-[10px] font-black tracking-widest text-yellow-400
                               hover:text-white border border-yellow-500/30
                               hover:bg-yellow-500/20 px-2.5 py-1 rounded-md transition"
                  >
                    ASSIGN →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">

          <input
            type="text"
            placeholder="Search by name or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-black border border-white/10
                       px-4 py-3 text-sm text-white
                       rounded-lg focus:outline-none
                       focus:border-red-500 transition"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-black border border-white/10
                       px-4 py-3 text-sm text-white
                       rounded-lg focus:outline-none
                       focus:border-red-500 transition"
          >
            <option value="all">All Members</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="withPT">With PT</option>
            <option value="withoutPT">Without PT</option>
            <option value="expiredWithPT">Expired + PT</option>
            <option value="expiredWithoutPT">Expired + No PT</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
          <StatBox label="TOTAL MEMBERS" value={users.length} />
          <StatBox
            label="WITH PT"
            value={users.filter(u => u.personalTraning?.subscription?.length > 0).length}
          />
          <StatBox
            label="WITHOUT PT"
            value={users.filter(u => !u.personalTraning?.subscription?.length).length}
          />
          <StatBox
            label="ACTIVE"
            value={users.filter(u => getLatestStatus(u) === "active").length}
          />
          <StatBox
            label="EXPIRED"
            value={users.filter(u => getLatestStatus(u) === "expired").length}
          />
        </div>

        {loading && (
          <div className="text-gray-500 tracking-widest">
            LOADING MEMBERS...
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="rounded-xl border border-white/10
                          bg-neutral-900/40 p-10 text-center text-gray-500">
            NO MEMBERS FOUND
          </div>
        )}

        {!loading && filteredUsers.length > 0 && (
          <div className="space-y-4">
            {filteredUsers.map((u) => (
              <MemberCard
                key={u._id}
                user={u}
                latestStatus={getLatestStatus(u)}
              />
            ))}
          </div>
        )}
      </div>

      {openAdd && (
        <AddMemberModal
          onClose={() => setOpenAdd(false)}
          onSuccess={loadMembers}
        />
      )}
    </>
  );
}


function StatBox({ label, value }) {
  return (
    <div className="relative overflow-hidden rounded-xl
                    bg-gradient-to-br from-black via-neutral-900 to-black
                    border border-white/10 p-4 sm:p-5">

      <p className="text-[10px] sm:text-[11px] text-gray-400 tracking-widest">
        {label}
      </p>

      <p className="text-xl sm:text-3xl font-black mt-2 sm:mt-3">
        {value}
      </p>

      <div className="absolute bottom-0 left-0 w-full h-[2px]
                      bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />
    </div>
  );
}
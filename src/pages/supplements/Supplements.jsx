import { useEffect, useState } from "react";
import { fetchPublicSupplements } from "../../api/supplement.api";
import SupplementCard from "./SupplementCard.jsx";
import toast from "react-hot-toast";

export default function Supplements() {
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicSupplements()
      .then(setSupplements)
      .catch(() =>
        toast.error("Failed to load supplements")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-16">
      <h1 className="text-3xl font-black mb-10">
        Supplements
      </h1>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {supplements.map((s) => (
            <SupplementCard
              key={s._id}
              product={s}
            />
          ))}
        </div>
      )}
    </div>
  );
}

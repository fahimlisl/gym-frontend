// import { useEffect, useState } from "react";
// import { fetchPublicSupplements } from "../../api/supplement.api";
// import SupplementCard from "./SupplementCard.jsx";
// import toast from "react-hot-toast";

// export default function Supplements() {
//   const [supplements, setSupplements] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchPublicSupplements()
//       .then(setSupplements)
//       .catch(() =>
//         toast.error("Failed to load supplements")
//       )
//       .finally(() => setLoading(false));
//   }, []);

//   return (
//     <div className="container py-16">
//       <h1 className="text-3xl font-black mb-10">
//         Supplements
//       </h1>

//       {loading ? (
//         <p className="text-gray-400">Loading...</p>
//       ) : (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {supplements.map((s) => (
//             <SupplementCard
//               key={s._id}
//               product={s}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import { fetchPublicSupplements } from "../../api/supplement.api";
import toast from "react-hot-toast";

export default function Supplements() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // still calling to keep structure intact (can remove later if not needed)
    fetchPublicSupplements()
      .catch(() => toast.error("Failed to load supplements"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-16">
      {/* <h1 className="text-3xl font-black mb-10">
        Supplements
      </h1>*/}

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <div className="w-full flex items-center justify-center py-20">
          <div className="max-w-2xl text-center space-y-4">
            <h2 className="text-2xl font-bold">Store Coming Soon</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              We’re currently building a dedicated shopping experience for all
              supplements and fitness products.
            </p>
            <p className="text-gray-400 text-sm">
              Our full store will be available soon at :
            </p>
            <a
              href="https://store.alphagym.fit"
              className="inline-block font-semibold text-black border border-black px-6 py-2 rounded-lg hover:bg-black hover:text-white transition text-red-600"
            >
              store.alphagym.fit
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

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

export default function Supplements() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="relative text-center max-w-xl w-full">

        <div className="absolute inset-0 blur-3xl bg-red-600/20 rounded-full"></div>

        <div className="relative border border-red-600/40 bg-black/60 backdrop-blur-xl rounded-2xl p-10 shadow-[0_0_60px_rgba(239,68,68,0.25)]">

          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-3">
            Supplements
          </h1>

          <div className="h-1 w-20 bg-red-600 mx-auto rounded-full mb-6"></div>

          <p className="text-xl text-red-500 font-semibold mb-2 animate-pulse">
            🚀 Coming Soon
          </p>

          <p className="text-gray-400 leading-relaxed">
            We’re crafting a <span className="text-white font-semibold">power-packed supplement store </span>  
            to fuel your performance, recovery, and gains.
          </p>

          <div className="mt-8 flex justify-center gap-4 text-sm text-gray-500">
            <span className="border border-red-600/30 px-4 py-2 rounded-full">
              💪 Performance
            </span>
            <span className="border border-red-600/30 px-4 py-2 rounded-full">
              ⚡ Energy
            </span>
            <span className="border border-red-600/30 px-4 py-2 rounded-full">
              🧬 Recovery
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

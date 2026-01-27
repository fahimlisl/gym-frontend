import { Link } from "react-router-dom";

export default function SupplementCard({ product }) {
  const thumb = product.images?.find(
    (i) => i.isThumbnail
  );

  return (
    <Link
      to={`/supplements/${product._id}`}
      className="border border-white/10 bg-black p-4 hover:border-red-600 transition"
    >
      <img
        src={thumb?.url}
        alt={product.productName}
        className="h-44 w-full object-cover mb-3"
      />

      <h3 className="font-bold">
        {product.productName}
      </h3>

      <p className="text-sm text-gray-400">
        {product.category}
      </p>

      <p className="font-extrabold mt-2">
        ₹{product.price}
      </p>
    </Link>
  );
}

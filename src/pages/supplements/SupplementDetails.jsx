import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchPublicSupplementById,
} from "../../api/supplement.api";
import toast from "react-hot-toast";

export default function SupplementDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetchPublicSupplementById(id)
      .then(setProduct)
      .catch(() =>
        toast.error("Product not found")
      );
  }, [id]);

  if (!product) return null;

  return (
    <div className="container py-16 grid lg:grid-cols-2 gap-10">
      
      {/* Images */}
      <div className="space-y-4">
        {product.images.map((img) => (
          <img
            key={img.public_id}
            src={img.url}
            className="w-full border border-white/10"
          />
        ))}
      </div>

      {/* Info */}
      <div>
        <h1 className="text-3xl font-black">
          {product.productName}
        </h1>

        <p className="text-gray-400 mt-2">
          {product.category}
        </p>

        <p className="text-2xl font-extrabold mt-6">
          ₹{product.price}
        </p>

        <p className="mt-6 text-gray-300">
          {product.description}
        </p>

        <button className="mt-8 bg-red-600 px-8 py-3 font-extrabold">
          BUY NOW
        </button>
      </div>
    </div>
  );
}

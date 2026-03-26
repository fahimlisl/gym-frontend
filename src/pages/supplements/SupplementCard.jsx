// SupplementCard.jsx
import { useState } from "react";
import { ShoppingCartIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

export default function SupplementCard({ product, onAddToCart, cartItem, onUpdateQuantity }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = product.images || [];
  const thumbnailImage = images.find(img => img.isThumbnail) || images[0];
  const allImages = thumbnailImage ? [thumbnailImage, ...images.filter(img => !img.isThumbnail && img !== thumbnailImage)] : images;

  const nextImage = () => {
    if (allImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }
  };

  const prevImage = () => {
    if (allImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  return (
    <div className="group bg-zinc-900 rounded-xl border border-zinc-800 hover:border-red-600/50 transition-all duration-300 overflow-hidden">
      {/* Image Carousel */}
      <div className="relative h-64 bg-black overflow-hidden">
        {allImages.length > 0 ? (
          <>
            <img
              src={allImages[currentImageIndex]?.url}
              alt={product.productName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ‹
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ›
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`h-1 rounded-full transition-all ${
                        currentImageIndex === idx ? 'w-4 bg-red-600' : 'w-1.5 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
            <span className="text-zinc-500 text-sm">NO IMAGE</span>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide">
            {product.category.toUpperCase()}
          </span>
        </div>

        {/* Stock Badge */}
        {product.quantity <= 0 && (
          <div className="absolute top-3 right-3">
            <span className="bg-black/80 text-red-500 text-xs font-bold px-3 py-1 rounded-full border border-red-600">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 min-h-[56px] tracking-tight">
          {product.productName}
        </h3>
        
        <p className="text-sm text-gray-400 mb-3 line-clamp-2 min-h-[40px]">
          {product.description}
        </p>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-black text-red-600">
            ₹{product.salePrice}
          </span>
        </div>

        {/* Stock Progress Bar */}
        {product.quantity > 0 && (
          <div className="mb-4">
            <div className="w-full bg-zinc-800 rounded-full h-1">
              <div
                className="bg-red-600 rounded-full h-1 transition-all"
                style={{ width: `${Math.min((product.quantity / 50) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {product.quantity} units available
            </p>
          </div>
        )}

        {/* Cart Actions */}
        {cartItem ? (
          <div className="flex items-center justify-between gap-3 bg-zinc-800 rounded-lg p-1.5">
            <button
              onClick={() => onUpdateQuantity(product._id, cartItem.quantity - 1)}
              className="bg-black p-2 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
              disabled={cartItem.quantity <= 1}
            >
              <MinusIcon className="w-4 h-4 text-white" />
            </button>
            <span className="font-bold text-lg text-white min-w-[30px] text-center">
              {cartItem.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(product._id, cartItem.quantity + 1)}
              className="bg-black p-2 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
              disabled={cartItem.quantity >= product.quantity}
            >
              <PlusIcon className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.quantity <= 0}
            className={`w-full py-3 rounded-lg font-bold transition-all tracking-wide ${
              product.quantity > 0
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCartIcon className="w-5 h-5 inline mr-2 -mt-0.5" />
            {product.quantity > 0 ? 'ADD TO CART' : 'OUT OF STOCK'}
          </button>
        )}
      </div>
    </div>
  );
}
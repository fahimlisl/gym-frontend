// Supplements.jsx
import { useEffect, useState } from "react";
import { fetchPublicSupplements } from "../../api/supplement.api";
import SupplementCard from "./SupplementCard.jsx";
import Cart from "./Cart.jsx";
import toast from "react-hot-toast";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";

export default function Supplements() {
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    fetchPublicSupplements()
      .then(setSupplements)
      .catch(() => toast.error("Failed to load supplements"))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === product._id);
      if (existingItem) {
        return prevCart.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    toast.success(`${product.productName} added to cart!`);
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== productId));
    toast.success("Item removed from cart");
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item._id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.salePrice * item.quantity), 0);
  };

  return (
    <>
      <div className="min-h-screen bg-black">
        {/* Header - Black & Red Theme */}
        <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-sm border-b border-red-900/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                <span className="text-white">FUEL</span>
                <span className="text-red-600"> STATION</span>
              </h1>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative group"
              >
                <div className="bg-red-600 hover:bg-red-700 p-3 rounded-full shadow-lg transition-all duration-300">
                  <ShoppingBagIcon className="w-6 h-6 text-white" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-red-600">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          {loading ? (
            <div className="flex justify-center items-center min-h-[60vh]">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Category Filter Bar - Optional */}
              {/* <div className="flex gap-3 mb-12 overflow-x-auto pb-2">
                <button className="px-6 py-2 bg-red-600 text-white font-bold rounded-full text-sm whitespace-nowrap">
                  ALL
                </button>
                <button className="px-6 py-2 bg-zinc-900 text-gray-400 font-bold rounded-full text-sm whitespace-nowrap hover:bg-zinc-800 transition">
                  PRE WORKOUT
                </button>
                <button className="px-6 py-2 bg-zinc-900 text-gray-400 font-bold rounded-full text-sm whitespace-nowrap hover:bg-zinc-800 transition">
                  PROTEIN
                </button>
                <button className="px-6 py-2 bg-zinc-900 text-gray-400 font-bold rounded-full text-sm whitespace-nowrap hover:bg-zinc-800 transition">
                  CREATINE
                </button>
                <button className="px-6 py-2 bg-zinc-900 text-gray-400 font-bold rounded-full text-sm whitespace-nowrap hover:bg-zinc-800 transition">
                  BCAA
                </button>
              </div> */}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {supplements?.map((supplement) => (
                  <SupplementCard
                    key={supplement._id}
                    product={supplement}
                    onAddToCart={addToCart}
                    cartItem={cart.find(item => item._id === supplement._id)}
                    onUpdateQuantity={updateQuantity}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cart Drawer */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        total={getCartTotal()}
      />
    </>
  );
}

// import { useEffect, useState } from "react";
// import { fetchPublicSupplements } from "../../api/supplement.api";
// import toast from "react-hot-toast";

// export default function Supplements() {
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // still calling to keep structure intact (can remove later if not needed)
//     fetchPublicSupplements()
//       .catch(() => toast.error("Failed to load supplements"))
//       .finally(() => setLoading(false));
//   }, []);

//   return (
//     <div className="container py-16">
//       {/* <h1 className="text-3xl font-black mb-10">
//         Supplements
//       </h1>*/}

//       {loading ? (
//         <p className="text-gray-400">Loading...</p>
//       ) : (
//         <div className="w-full flex items-center justify-center py-20">
//           <div className="max-w-2xl text-center space-y-4">
//             <h2 className="text-2xl font-bold">Store Coming Soon</h2>
//             <p className="text-gray-500 text-sm leading-relaxed">
//               We’re currently building a dedicated shopping experience for all
//               supplements and fitness products.
//             </p>
//             <p className="text-gray-400 text-sm">
//               Our full store will be available soon at :
//             </p>
//             <a
//               href="https://store.alphagym.fit"
//               className="inline-block font-semibold text-black border border-black px-6 py-2 rounded-lg hover:bg-black hover:text-white transition text-red-600"
//             >
//               store.alphagym.fit
//             </a>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

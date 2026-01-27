// import { Routes, Route } from "react-router-dom";
// import { Toaster } from "react-hot-toast";

// import Navbar from "./components/layout/Navbar";
// import Footer from "./components/layout/Footer";

// import Home from "./pages/Home";
// import Login from "./pages/Login";
//           import AdminDashboard from "./pages/admin/AdminDashboard";
// // import Supplements from "./pages/Supplements";

// export default function App() {
//   return (
//     <div className="min-h-screen flex flex-col bg-neutral-950 text-white">

//       {/* Global Toast */}
//       <Toaster
//         position="top-right"
//         toastOptions={{
//           style: {
//             background: "#0b0b0b",
//             color: "#fff",
//             border: "1px solid rgba(255,255,255,0.15)",
//             fontWeight: "600",
//           },
//         }}
//       />

//       <Navbar />

//       <main className="flex-1">
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/login" element={<Login />} />

// <Route path="/admin/dashboard" element={<AdminDashboard />} />

//           {/* <Route path="/supplements" element={<Supplements />} /> */}
//         </Routes>
//       </main>

//       <Footer />
//     </div>
//   );
// }

import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import PublicLayout from "./components/layout/PublicLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";

import AdminSupplements from "./pages/admin/AdminSupplements";
import AddSupplement from "./pages/admin/AddSupplement";

import Supplements from "./pages/supplements/Supplements";
import SupplementDetails from "./pages/supplements/SupplementDetails";

import Pricing from "./pages/PricingP.jsx";
import Contact from "./pages/Contact.jsx";
import Programs from "./pages/Programs.jsx";
import Members from "./pages/admin/members.jsx";
import UserDetail from "./pages/admin/UserDetail.jsx";
import Trainers from "./pages/admin/Trainers.jsx";
import Payments from "./pages/admin/Payments.jsx";
import TrainerDashboard from "./pages/trainer/TrainerDashboard.jsx";
import UserDashboard from "./pages/user/UserDashboard.jsx";

export default function App() {
  return (
    <>
      {/* Global Toast */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0b0b0b",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.15)",
            fontWeight: "600",
          },
        }}
      />

      <Routes>
        {/* 🌐 PUBLIC WEBSITE */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          <Route path="/supplements" element={<Supplements />} />
          <Route path="/supplements/:id" element={<SupplementDetails />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/contacts" element={<Contact />} />
        </Route>

        // trainer dashboard 
        <Route path="/trainer/dashboard" element={<TrainerDashboard />} />

        // member dashboard
        <Route path="/member/dashboard" element={<UserDashboard />} />



        {/* 🛡️ ADMIN DASHBOARD */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/supplements" element={<AdminSupplements />} />
        <Route path="/admin/supplements/add" element={<AddSupplement />} />

        <Route path="/admin/members" element={<Members />} />
        <Route path="/admin/members/:id" element={<UserDetail />} />

        <Route path="/admin/trainers" element={<Trainers />} />
        <Route path="/admin/payments" element={<Payments />} />

          {/* future */}
          {/* <Route path="trainers/:id" element={<TrainerDetail />} /> */}
      </Routes>
    </>
  );
}

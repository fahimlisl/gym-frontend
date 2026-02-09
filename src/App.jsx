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
import CafeItems from "./pages/admin/CafeItems.jsx";
import AddCafeItemModal from "./components/admin/cafe/AddCafeItemModal.jsx";
import CafeAdmins from "./pages/admin/CafeAdmins.jsx";
import CafeAdminDashboard from "./pages/cafe/CafeAdminDashboard.jsx";
import Coupon from "./pages/admin/Coupon.jsx";
import Expenses from "./pages/admin/Expenses.jsx";
import Foods from "./pages/trainer/Foods.jsx";
import TrainerDashboardLayout from "./components/layout/TrainerDashboardLayout.jsx";
import TrainerDietManager from "./pages/trainer/TrainerDietManager.jsx";
import AdminInventory from "./pages/admin/AdminInventory.jsx";
import TrainerProfile from "./pages/TrainerProfile.jsx";
import PublicTrainers from "./pages/PublicTrainers.jsx";
import CafePayments from "./pages/cafe/CafePayments.jsx";
import AboutUs from "./pages/AboutUs.jsx";
// import TrainerMembers from "./pages/trainer/TrainerMembers.jsx";

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
        {/* public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          <Route path="/supplements" element={<Supplements />} />
          <Route path="/supplements/:id" element={<SupplementDetails />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/contacts" element={<Contact />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/trainers" element={<PublicTrainers />} />
<Route path="/trainers/:id" element={<TrainerProfile />} />

        </Route>

        <Route element={<TrainerDashboardLayout />}>
          <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
          <Route path="/trainer/foods" element={<Foods />} />
          <Route
            path="/trainer/diet/:userId"
            element={
              // <TrainerDashboardLayout>
              <TrainerDietManager />
              // {/* </TrainerDashboardLayout> */}
            }
          />
          {/* <Route path="trainer/trainer-members" element={<TrainerMembers />}/> */}
        </Route>

        {/* member dashboard */}
        <Route path="/member/dashboard" element={<UserDashboard />} />

        {/* admin  */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/supplements" element={<AdminSupplements />} />
        <Route path="/admin/supplements/add" element={<AddSupplement />} />

        <Route path="/admin/members" element={<Members />} />
        <Route path="/admin/members/:id" element={<UserDetail />} />

        <Route path="/admin/trainers" element={<Trainers />} />
        <Route path="/admin/payments" element={<Payments />} />
        <Route path="/admin/coupons" element={<Coupon />} />
        <Route path="/admin/expenses" element={<Expenses />} />
        <Route path="/admin/assets" element={<AdminInventory />} />

        {/* cafe things starts here  */}
        <Route path="/admin/cafe/items" element={<CafeItems />} />
        <Route path="/admin/cafe/add-item" element={<AddCafeItemModal />} />
        <Route path="/admin/cafe/admins" element={<CafeAdmins />} />

        <Route path="/cafe/dashboard" element={<CafeAdminDashboard />} />
        <Route path="/cafe/payments" element={<CafePayments />} />

      </Routes>
    </>
  );
}

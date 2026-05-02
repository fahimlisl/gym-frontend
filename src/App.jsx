import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navigate } from "react-router-dom";

import PublicLayout from "./components/layout/PublicLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";

import AdminSupplements from "./pages/admin/AdminSupplements";
import AddSupplement from "./pages/admin/AddSupplement";

import Supplements from "./pages/supplements/Supplements";
import SupplementDetails from "./pages/supplements/SupplementDetails";
import SuperAdminRoute from "./components/layout/SuperAdminRoute.jsx";

import Pricing from "./pages/PricingP.jsx";
import Contact from "./pages/Contact.jsx";
import Programs from "./pages/Programs.jsx";
import Members from "./pages/admin/Members.jsx";
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
import TrainerDashboardLayout from "./components/layout/TrainerDashboardLayout.jsx";
import AdminInventory from "./pages/admin/AdminInventory.jsx";
import TrainerProfile from "./pages/TrainerProfile.jsx";
import PublicTrainers from "./pages/PublicTrainers.jsx";
import CafePayments from "./pages/cafe/CafePayments.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import AttendanceDashboard from "./pages/admin/Attendence/AttendanceDashboard.jsx";
import MarkAttendance from "./pages/admin/Attendence/MarkAttendance.jsx";
import TodayAttendance from "./pages/admin/Attendence/TodayAttendance.jsx";
import MonthlyAttendance from "./pages/admin/Attendence/MonthlyAttendance.jsx";
import AdminDashboardLayout from "./components/layout/AdminDashboardLayout.jsx";
import CafePaymentsOfAdmin from "./pages/admin/CafePaymentsOfAdmin.jsx";
import Plan from "./pages/admin/plans/Plan.jsx";
import PTBilling from "./pages/user/PTBilling.jsx";
import PTPlans from "./pages/user/PTPlans.jsx";
import AdminPTRequests from "./pages/admin/pt/AdminPTRequests.jsx";
import AdminPTRequestDetails from "./pages/admin/pt/AdminPTRequestDetails.jsx";
import UserDashboardLayout from "./components/layout/UserDashboardLayout.jsx";
import DietChart from "./pages/user/DietChart.jsx";
import SubscriptionHistory from "./pages/user/SubscriptionHistory.jsx";
import RenewalPlans from "./pages/user/RenewalPlans.jsx";
import RenewalBilling from "./pages/user/RenewalBilling.jsx";
import AdminOffer from "./pages/admin/AdminOffer.jsx";
import AdminWorkoutTemplates from "./pages/admin/AdminWorkoutTemplates.jsx";
import AdminEditWorkout from "./pages/admin/AdminEditWorkout.jsx";
import UserWorkoutView from "./pages/user/UserWorkoutView.jsx";
import ScannerPage from "./pages/ScannerPage.jsx";
import SuppBillsAdmin from "./pages/admin/SuppBillsAdmin.jsx";
import PaymentInPage from "./pages/admin/PaymentInPage.jsx";
import TrainerQRWidget from "./pages/trainer/TrainerQRWidget.jsx";
import TodayAttendanceTrainer from "./pages/trainer/TodayAttendanceTrainer.jsx";
import TrainerStudentDetail from "./pages/trainer/TrainerStudentDetail.jsx";
import TrainerMyAttendance from "./pages/trainer/TrainerMyAttendance.jsx";
import AdminTrainerAttendance from "./pages/admin/Attendence/AdminTrainerAttendance.jsx";
import GymQRPage from "./pages/admin/Attendence/GymQRPage.jsx";
import MemberScanGymQR from "./pages/user/MemberScanGymQR.jsx";
import TrainerScanGymQR from "./pages/trainer/TrainerScanGymQR.jsx";
import TrainerCoupon from "./pages/admin/TrainerCoupon.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const duration = 900;
    const start = window.scrollY;
    const startTime = performance.now();

    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      window.scrollTo(0, start * (1 - eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <>
      {/* global Toast */}
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

      <ScrollToTop />

      <Routes>
        <Route path="/scanner" element={<ScannerPage />} />
        {/* public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          <Route path="/store" element={<Supplements />} />
          <Route path="/supplements/:id" element={<SupplementDetails />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/contacts" element={<Contact />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/trainers" element={<PublicTrainers />} />
          <Route path="/trainers/:id" element={<TrainerProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* trainer */}
        <Route element={<TrainerDashboardLayout />}>
          <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
          <Route path="/trainer/my-qr" element={<TrainerQRWidget />} />
          <Route path="/trainer/attendence/scan-qr" element={<TrainerScanGymQR />} />
          <Route path="/trainer/attendence/today" element={<TodayAttendanceTrainer />} />
          <Route path="/trainer/student/:userId" element={<TrainerStudentDetail />} />
          <Route path="/trainer/attendence/my" element={<TrainerMyAttendance />} />

          {/* <Route
            path="/trainer/diet/:userId"
            element={<TrainerDietManager />}
          /> */}
        </Route>

        {/* member */}
        <Route element={<UserDashboardLayout />}>
          <Route path="/member/dashboard" element={<UserDashboard />} />
          <Route path="/member/pt-plans" element={<PTPlans />} />
          <Route path="/member/renewal-plans" element={<RenewalPlans />} />
          <Route path="/member/pt-billing/:planId" element={<PTBilling />} />
          <Route path="/member/renewal-billing/:planId" element={<RenewalBilling />} />

          <Route path="/member/diet-chart" element={<DietChart />} />
          <Route path="/member/history" element={<SubscriptionHistory />} />
          <Route path="/member/workout-plans" element={<UserWorkoutView />} />
          {/* <Route path="/member/my-qr" element={<MyQRPage />} />*/}
          <Route path="/member/scan-qr" element={<MemberScanGymQR />} />
        </Route>

        {/* admin */}
        <Route path="/admin" element={<AdminDashboardLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="supplements" element={<AdminSupplements />} />
          <Route path="supplements/add" element={<AddSupplement />} />
          <Route path="supplement/request" element={<SuppBillsAdmin />} />

          <Route path="members" element={<Members />} />
          <Route path="members/:id" element={<UserDetail />} />

          <Route path="trainers" element={<Trainers />} />
          <Route path="coupons" element={<Coupon />} />
          <Route path="coupons/trainer" element={<TrainerCoupon />} />

          {/* cafe */}
          <Route path="cafe/items" element={<CafeItems />} />
          <Route path="cafe/add-item" element={<AddCafeItemModal />} />
          <Route path="cafe/admins" element={<CafeAdmins />} />

          {/* attendance */}
          <Route
            path="attendance/member/dashboard"
            element={<AttendanceDashboard />}
          />
          <Route path="attendance/member/mark" element={<MarkAttendance />} />
          <Route path="attendance/member/today" element={<TodayAttendance />} />
          <Route path="attendance/member/month" element={<MonthlyAttendance />} />
          <Route path="check-in/qr" element={<GymQRPage />} />

          <Route path="attendance/trainer/dashboard" element={<AdminTrainerAttendance />} />

          <Route path="plans" element={<Plan />} />
          <Route path="offers" element={<AdminOffer />} />

          <Route path="pt/requests" element={<AdminPTRequests />} />

          <Route path="pt/request/:reqId" element={<AdminPTRequestDetails />} />

          <Route path="workout-templates" element={<AdminWorkoutTemplates />} />
          <Route path="workout/:workoutId" element={<AdminEditWorkout />} />

          <Route path="expenses" element={
            <SuperAdminRoute><Expenses /></SuperAdminRoute>
          } />

          <Route path="assets" element={
            <SuperAdminRoute><AdminInventory /></SuperAdminRoute>
          } />

          <Route path="payments/all" element={
            <SuperAdminRoute><Payments /></SuperAdminRoute>
          } />

          <Route path="payments/cafe" element={
            <SuperAdminRoute><CafePaymentsOfAdmin /></SuperAdminRoute>
          } />

          <Route path="payments/payments-in" element={
            <SuperAdminRoute><PaymentInPage /></SuperAdminRoute>
          } />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* cafe */}
        <Route path="/cafe/dashboard" element={<CafeAdminDashboard />} />
        <Route path="/cafe/payments" element={<CafePayments />} />
      </Routes>
    </>
  );
}

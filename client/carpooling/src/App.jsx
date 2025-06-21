import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Layout from "./components/common/Layout";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/user/Profile";
import DriverDashboard from "./pages/driver/DriverDashboard";
import RidesList from "./pages/ride/RidesList";
import RideDetails from "./pages/ride/RideDetails";
import CreateRide from "./pages/ride/CreateRide";
import MyRides from "./pages/ride/MyRides";
import NotFound from "./pages/NotFound";
import Payment from "./pages/payment/Payment";


import ManageDrivers from "./pages/admin/ManageDrivers";
import DriverDetails from "./pages/driverDetails/DriverDetails";
import AdminWallet from "./pages/admin/AdminWallet";
import ChatApp from "./components/chat/ChatApp";
import ChatListPage from "./pages/chatlist/ChatListPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin" element={<ManageDrivers />} />
        <Route path="/admin-driver/:id" element={<DriverDetails />} />
        <Route path="/adminwallet" element={<AdminWallet />} />


        {/* Protected Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="profile" element={<Profile />} />
          <Route path="rides" element={<RidesList />} />
          <Route path="rides/:id" element={<RideDetails />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/my-rides" element={<MyRides />} />
          <Route path="/chat" element={<ChatApp />} />
          <Route path="/chatlist" element={<ChatListPage />} />

          {/* Driver Routes (Protected) */}
          <Route
            path="driver"
            element={<ProtectedRoute allowedRoles={["driver"]} />}
          >
            <Route index element={<DriverDashboard />} />
            <Route path="create-ride" element={<CreateRide />} />
          </Route>

          {/* Admin Routes (Placeholder) */}

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;

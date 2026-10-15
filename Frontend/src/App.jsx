import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import LoginSignup from "./components/LoginSignup";
import AdminPage from "./pages/AdminPage";
import BookingPage from "./pages/BookingPage";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/auth" element={<LoginSignup />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
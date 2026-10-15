import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Mainscreen from "../components/mainscreen";
import CardNav from "../components/CardNav";
import logo from "../assets/logo.svg";

function MainPage() {
  const navigate = useNavigate();

  const items = [
    {
      label: "Admin",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [
        { label: "Manage Users", ariaLabel: "Admin Users" },
        { label: "Reports", ariaLabel: "Admin Reports" },
      ],
    },
    {
      label: "Booking",
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "New Booking", ariaLabel: "New Booking" },
        { label: "History", ariaLabel: "Booking History" },
      ],
    },
    {
      label: "Dashboard",
      bgColor: "#271E37",
      textColor: "#fff",
      links: [
        { label: "Analytics", ariaLabel: "Dashboard Analytics" },
        { label: "Settings", ariaLabel: "Dashboard Settings" },
      ],
    },
  ];

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Background */}
      <Mainscreen />

      {/* Left Text Content */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2 }}
        className="absolute left-12 top-1/2 transform -translate-y-1/2 z-20 max-w-md pointer-events-none select-none"
      >
        
      </motion.div>

      {/* Navbar */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0 }}
        className="absolute top-0 left-0 w-full flex justify-center z-30"
      >
        <CardNav
          logo={logo}
          logoAlt="Rentify Logo"
          items={items}
          baseColor="rgba(255,255,255,0.1)"
          menuColor="#fff"
          buttonBgColor="rgba(255,255,255,0.25)"
          buttonTextColor="#fff"
          ease="power3.out"
          onLoginClick={() => navigate("/auth")} 
          // 👈 fixed
          onAdminClick={() => navigate("/admin")}
          onBookingClick={() => navigate("/booking")}
          onDashboardClick={() => navigate("/dashboard")}
        />
      </motion.div>
    </div>
  );
}

export default MainPage;
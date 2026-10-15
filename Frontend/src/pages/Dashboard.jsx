import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  DollarSign,
  Car,
  Clock,
  User,
  CreditCard,
  MapPin,
  CheckCircle,
  XCircle,
} from "lucide-react";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (!userData.userId) {
      alert("Please login first!");
      navigate("/auth");
      return;
    }
    setUser(userData);
    loadBookings(userData.userId);
  }, [navigate]);

  const loadBookings = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/bookings/${userId}`
      );
      const data = await response.json();
      const userBookings = data.bookings || [];
      setBookings(userBookings);

      const totalSpent = userBookings.reduce(
        (sum, b) => sum + (b.status !== "cancelled" ? b.totalCost : 0),
        0
      );
      const activeBookings = userBookings.filter(
        (b) => b.status === "active"
      ).length;

      setStats({
        totalBookings: userBookings.length,
        activeBookings,
        totalSpent,
      });
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
  };

  const handleReturnCar = async (bookingId) => {
    if (!window.confirm("Confirm return of vehicle? Rental will be marked completed.")) return;
    try {
      const response = await fetch(`http://localhost:8080/api/booking/${bookingId}/return`, {
        method: "POST"
      });
      const data = await response.json();
      if (data.success) {
        alert("Car returned successfully! Thank you for using Rentify.");
        if (user) loadBookings(user.userId);
      } else {
        alert(data.message || "Failed to return car.");
      }
    } catch (error) {
      console.error("Error returning car:", error);
      alert("Error contacting server.");
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const response = await fetch(`http://localhost:8080/api/booking/${bookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.userId })
      });
      const data = await response.json();
      if (data.success) {
        alert("Booking cancelled successfully.");
        if (user) loadBookings(user.userId);
      } else {
        alert(data.message || "Failed to cancel booking.");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Error contacting server.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#4CAF50";
      case "completed":
        return "#2196F3";
      case "cancelled":
        return "#f44336";
      default:
        return "#9E9E9E";
    }
  };

  const getCarTypeIcon = () => {
    return <Car size={24} />;
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-header"
        >
          <div className="header-left">
            <h1>📊 My Dashboard</h1>
            <p className="welcome-text">Welcome back, {user?.username}!</p>
          </div>
          <button className="back-btn" onClick={() => navigate("/")}>
            ← Back to Home
          </button>
        </motion.div>

        <div className="stats-overview">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="stat-card"
          >
            <div className="stat-icon" style={{ background: "#4CAF50" }}>
              <Calendar size={28} />
            </div>
            <div className="stat-info">
              <h3>Total Bookings</h3>
              <p className="stat-value">{stats.totalBookings}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="stat-card"
          >
            <div className="stat-icon" style={{ background: "#2196F3" }}>
              <Car size={28} />
            </div>
            <div className="stat-info">
              <h3>Active Bookings</h3>
              <p className="stat-value">{stats.activeBookings}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="stat-card"
          >
            <div className="stat-icon" style={{ background: "#FF9800" }}>
              <DollarSign size={28} />
            </div>
            <div className="stat-info">
              <h3>Total Spent</h3>
              <p className="stat-value">${stats.totalSpent.toFixed(2)}</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bookings-section"
        >
          <div className="section-header">
            <h2>Booking History</h2>
            <button
              className="new-booking-btn"
              onClick={() => navigate("/booking")}
            >
              + New Booking
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="no-bookings">
              <Car size={64} opacity={0.3} />
              <h3>No bookings yet</h3>
              <p>Start your journey by booking your first car!</p>
              <button
                className="book-now-btn"
                onClick={() => navigate("/booking")}
              >
                Book Now
              </button>
            </div>
          ) : (
            <div className="bookings-list">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking.bookingId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="booking-card"
                >
                  <div className="booking-header-row">
                    <div className="car-info-section">
                      <div
                        className="car-icon-circle"
                        style={{
                          background: `linear-gradient(135deg, ${getStatusColor(
                            booking.status
                          )}, ${getStatusColor(booking.status)}aa)`,
                        }}
                      >
                        {getCarTypeIcon()}
                      </div>
                      <div>
                        <h3>
                          {booking.carBrand} {booking.carModel}
                        </h3>
                        <p className="car-type-text">
                          {booking.carType?.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div
                      className="status-badge"
                      style={{
                        background: getStatusColor(booking.status),
                      }}
                    >
                      {booking.status}
                    </div>
                  </div>

                  <div className="booking-details-grid">
                    <div className="detail-item">
                      <Calendar size={18} />
                      <div>
                        <span className="label">Pickup</span>
                        <span className="value">{booking.pickupDate}</span>
                      </div>
                    </div>

                    <div className="detail-item">
                      <Calendar size={18} />
                      <div>
                        <span className="label">Return</span>
                        <span className="value">{booking.returnDate}</span>
                      </div>
                    </div>

                    <div className="detail-item">
                      <Clock size={18} />
                      <div>
                        <span className="label">Duration</span>
                        <span className="value">{booking.numDays} days</span>
                      </div>
                    </div>

                    <div className="detail-item">
                      <Clock size={18} />
                      <div>
                        <span className="label">Stalling</span>
                        <span className="value">{booking.stallingHours} hrs</span>
                      </div>
                    </div>
                  </div>

                  <div className="booking-footer">
                    <div className="payment-info">
                      <CreditCard size={18} />
                      <span>Payment ID: {booking.paymentId}</span>
                      <span
                        className="payment-status"
                        style={{
                          color: getStatusColor(booking.paymentStatus || "success"),
                        }}
                      >
                        {booking.paymentStatus || "success"}
                      </span>
                    </div>
                    <div className="total-cost">
                      <span className="cost-label">Total:</span>
                      <span className="cost-value">
                        ${booking.totalCost.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {booking.status === "active" && (
                    <div style={{ marginTop: "16px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => handleReturnCar(booking.bookingId)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          backgroundColor: "#2196F3",
                          color: "white",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "13px"
                        }}
                      >
                        <CheckCircle size={15} /> Return Car
                      </button>
                      <button
                        onClick={() => handleCancelBooking(booking.bookingId)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "13px"
                        }}
                      >
                        <XCircle size={15} /> Cancel Booking
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="profile-section"
        >
          <h2>Profile Information</h2>
          <div className="profile-card">
            <div className="profile-item">
              <User size={20} />
              <div>
                <span className="label">Username</span>
                <span className="value">{user?.username}</span>
              </div>
            </div>
            <div className="profile-item">
              <CreditCard size={20} />
              <div>
                <span className="label">Email</span>
                <span className="value">{user?.email}</span>
              </div>
            </div>
            <div className="profile-item">
              <MapPin size={20} />
              <div>
                <span className="label">User ID</span>
                <span className="value">{user?.userId}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Car, Users, TrendingUp, Trash2, Edit2, Plus, Calendar, CheckCircle, XCircle } from "lucide-react";
import "../styles/AdminPage.css";

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("cars");
  const [cars, setCars] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showAddCar, setShowAddCar] = useState(false);
  const [editingCar, setEditingCar] = useState(null);

  const [newCar, setNewCar] = useState({
    brand: "",
    model: "",
    carType: "economy",
    baseRate: "",
    stallingCharge: "",
    regNumber: "",
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.userType !== "admin") {
      alert("Access denied! Admin only.");
      navigate("/");
      return;
    }
    loadCars();
    loadUsers();
    loadBookings();
  }, [navigate]);

  const loadCars = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/cars");
      const data = await response.json();
      setCars(data.cars || []);
    } catch (error) {
      console.error("Error loading cars:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/admin/users");
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadBookings = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/admin/bookings");
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/api/admin/car", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCar,
          baseRate: parseFloat(newCar.baseRate),
          stallingCharge: parseFloat(newCar.stallingCharge),
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Car added successfully!");
        setShowAddCar(false);
        setNewCar({
          brand: "",
          model: "",
          carType: "economy",
          baseRate: "",
          stallingCharge: "",
          regNumber: "",
        });
        loadCars();
      }
    } catch (error) {
      console.error("Error adding car:", error);
      alert("Failed to add car");
    }
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/admin/car/${carId}`,
        { method: "DELETE" }
      );

      const data = await response.json();
      if (data.success) {
        alert("Car deleted successfully!");
        loadCars();
      }
    } catch (error) {
      console.error("Error deleting car:", error);
      alert("Failed to delete car");
    }
  };

  const handleUpdateRates = async (carId, baseRate, stallingCharge) => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/car/${carId}/rates`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseRate, stallingCharge }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Rates updated successfully!");
        setEditingCar(null);
        loadCars();
      }
    } catch (error) {
      console.error("Error updating rates:", error);
      alert("Failed to update rates");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/admin/user/${userId}`,
        { method: "DELETE" }
      );

      const data = await response.json();
      if (data.success) {
        alert("User deleted successfully!");
        loadUsers();
      } else {
        alert(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    if (!window.confirm("Mark this booking as completed and free up the vehicle?")) return;
    try {
      const response = await fetch(`http://localhost:8080/api/booking/${bookingId}/return`, {
        method: "POST"
      });
      const data = await response.json();
      if (data.success) {
        alert("Booking marked as completed!");
        loadBookings();
        loadCars();
      }
    } catch (error) {
      console.error("Error completing booking:", error);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this booking and free up the vehicle?")) return;
    try {
      const response = await fetch(`http://localhost:8080/api/booking/${bookingId}/cancel`, {
        method: "POST"
      });
      const data = await response.json();
      if (data.success) {
        alert("Booking cancelled successfully!");
        loadBookings();
        loadCars();
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  const totalRevenue = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.totalCost || 0), 0);

  return (
    <div className="admin-page">
      <div className="admin-container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-header"
        >
          <h1>🎯 Admin Dashboard</h1>
          <button className="back-btn" onClick={() => navigate("/")}>
            ← Back to Home
          </button>
        </motion.div>

        <div className="tabs-container">
          <button
            className={`tab ${activeTab === "cars" ? "active" : ""}`}
            onClick={() => setActiveTab("cars")}
          >
            <Car size={20} /> Manage Cars
          </button>
          <button
            className={`tab ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <Users size={20} /> Manage Users
          </button>
          <button
            className={`tab ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            <Calendar size={20} /> Manage Bookings
          </button>
          <button
            className={`tab ${activeTab === "stats" ? "active" : ""}`}
            onClick={() => setActiveTab("stats")}
          >
            <TrendingUp size={20} /> Statistics
          </button>
        </div>

        {activeTab === "cars" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="content-section"
          >
            <div className="section-header">
              <h2>Car Fleet Management</h2>
              <button
                className="add-btn"
                onClick={() => setShowAddCar(!showAddCar)}
              >
                <Plus size={18} /> Add New Car
              </button>
            </div>

            {showAddCar && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="add-car-form"
                onSubmit={handleAddCar}
              >
                <h3>Add New Car</h3>
                <div className="form-grid">
                  <input
                    type="text"
                    placeholder="Brand"
                    value={newCar.brand}
                    onChange={(e) =>
                      setNewCar({ ...newCar, brand: e.target.value })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="Model"
                    value={newCar.model}
                    onChange={(e) =>
                      setNewCar({ ...newCar, model: e.target.value })
                    }
                    required
                  />
                  <select
                    value={newCar.carType}
                    onChange={(e) =>
                      setNewCar({ ...newCar, carType: e.target.value })
                    }
                  >
                    <option value="economy">Economy</option>
                    <option value="luxury">Luxury</option>
                    <option value="suv">SUV</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Base Rate ($/day)"
                    value={newCar.baseRate}
                    onChange={(e) =>
                      setNewCar({ ...newCar, baseRate: e.target.value })
                    }
                    required
                  />
                  <input
                    type="number"
                    placeholder="Stalling Charge ($/hr)"
                    value={newCar.stallingCharge}
                    onChange={(e) =>
                      setNewCar({ ...newCar, stallingCharge: e.target.value })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="Registration Number"
                    value={newCar.regNumber}
                    onChange={(e) =>
                      setNewCar({ ...newCar, regNumber: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    Add Car
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowAddCar(false)}
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}

            <div className="cars-grid">
              {cars.map((car) => (
                <motion.div
                  key={car.carId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="car-card"
                >
                  <div className="car-info">
                    <h3>
                      {car.brand} {car.model}
                    </h3>
                    <p className="car-type">{car.carType?.toUpperCase()}</p>
                    <p className="reg-number">Reg: {car.regNumber}</p>

                    {editingCar === car.carId ? (
                      <div className="edit-rates">
                        <input
                          type="number"
                          defaultValue={car.baseRate}
                          id={`base-${car.carId}`}
                          placeholder="Base Rate"
                        />
                        <input
                          type="number"
                          defaultValue={car.stallingCharge}
                          id={`stall-${car.carId}`}
                          placeholder="Stalling Charge"
                        />
                        <button
                          onClick={() => {
                            const base = parseFloat(
                              document.getElementById(`base-${car.carId}`).value
                            );
                            const stall = parseFloat(
                              document.getElementById(`stall-${car.carId}`).value
                            );
                            handleUpdateRates(car.carId, base, stall);
                          }}
                        >
                          Save
                        </button>
                        <button onClick={() => setEditingCar(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="rate">Base Rate: ${car.baseRate}/day</p>
                        <p className="rate">
                          Stalling: ${car.stallingCharge}/hr
                        </p>
                      </>
                    )}

                    <p
                      className={`availability ${
                        car.isAvailable ? "available" : "unavailable"
                      }`}
                    >
                      {car.isAvailable ? "✓ Available" : "✗ Rented"}
                    </p>
                  </div>

                  <div className="car-actions">
                    <button
                      className="edit-btn"
                      onClick={() => setEditingCar(car.carId)}
                    >
                      <Edit2 size={16} /> Edit Rates
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteCar(car.carId)}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "users" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="content-section"
          >
            <h2>User Management</h2>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.userId}>
                      <td>{user.userId}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${user.userType}`}>
                          {user.userType}
                        </span>
                      </td>
                      <td>
                        {user.userType !== "admin" && (
                          <button
                            className="delete-btn-small"
                            onClick={() => handleDeleteUser(user.userId)}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === "bookings" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="content-section"
          >
            <h2>All System Bookings</h2>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>User</th>
                    <th>Vehicle</th>
                    <th>Dates</th>
                    <th>Total ($)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.bookingId}>
                      <td>{b.bookingId}</td>
                      <td>{b.username || b.userId}</td>
                      <td>{b.carBrand} {b.carModel}</td>
                      <td>{b.pickupDate} to {b.returnDate} ({b.numDays}d)</td>
                      <td>${b.totalCost?.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${b.status}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        {b.status === "active" ? (
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              style={{
                                background: "#4CAF50",
                                color: "white",
                                border: "none",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                              onClick={() => handleCompleteBooking(b.bookingId)}
                              title="Mark Returned / Completed"
                            >
                              <CheckCircle size={13} /> Complete
                            </button>
                            <button
                              style={{
                                background: "#f44336",
                                color: "white",
                                border: "none",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                              onClick={() => handleCancelBooking(b.bookingId)}
                              title="Cancel Booking"
                            >
                              <XCircle size={13} /> Cancel
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: "#999", fontSize: "12px" }}>Closed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === "stats" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="content-section"
          >
            <h2>System Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Cars</h3>
                <p className="stat-number">{cars.length}</p>
              </div>
              <div className="stat-card">
                <h3>Available Cars</h3>
                <p className="stat-number">
                  {cars.filter((c) => c.isAvailable).length}
                </p>
              </div>
              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-number">
                  {users.filter((u) => u.userType === "customer").length}
                </p>
              </div>
              <div className="stat-card">
                <h3>Admins</h3>
                <p className="stat-number">
                  {users.filter((u) => u.userType === "admin").length}
                </p>
              </div>
              <div className="stat-card">
                <h3>Total Bookings</h3>
                <p className="stat-number">{bookings.length}</p>
              </div>
              <div className="stat-card">
                <h3>Active Rentals</h3>
                <p className="stat-number">{bookings.filter((b) => b.status === "active").length}</p>
              </div>
              <div className="stat-card" style={{ gridColumn: "span 2" }}>
                <h3>Total Revenue</h3>
                <p className="stat-number" style={{ color: "#4CAF50" }}>
                  ${totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
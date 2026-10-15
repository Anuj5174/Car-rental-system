import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar, DollarSign, Clock, Car, CreditCard, X } from "lucide-react";
import "../styles/BookingPage.css";

const BookingPage = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [numDays, setNumDays] = useState(1);
  const [stallingHours, setStallingHours] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (!userData.userId) {
      alert("Please login first!");
      navigate("/auth");
      return;
    }
    setUser(userData);
    loadCars();
  }, [navigate]);

  const loadCars = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/cars");
      const data = await response.json();
      setCars(data.cars.filter((car) => car.isAvailable) || []);
    } catch (error) {
      console.error("Error loading cars:", error);
    }
  };

  useEffect(() => {
    if (selectedCar && numDays > 0) {
      const baseCost = selectedCar.baseRate * numDays;
      const stallingCost = selectedCar.stallingCharge * stallingHours;
      setTotalCost(baseCost + stallingCost);
    }
  }, [selectedCar, numDays, stallingHours]);

  const calculateDays = (pickup, returnD) => {
    if (!pickup || !returnD) return 1;
    const pickupTime = new Date(pickup);
    const returnTime = new Date(returnD);
    const diffTime = Math.abs(returnTime - pickupTime);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const handleDateChange = (pickup, returnD) => {
    setPickupDate(pickup);
    setReturnDate(returnD);
    const days = calculateDays(pickup, returnD);
    setNumDays(days);
  };

  const handleBooking = () => {
    if (!selectedCar) {
      alert("Please select a car!");
      return;
    }
    if (!pickupDate || !returnDate) {
      alert("Please select pickup and return dates!");
      return;
    }
    setShowPayment(true);
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!cardNumber || !cardName) {
      alert("Please fill in all card details!");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          carId: selectedCar.carId,
          pickupDate,
          returnDate,
          numDays,
          stallingHours,
          totalCost,
          cardNumber,
          cardName,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowPayment(false);
        setShowConfirm(true);
      } else {
        alert("Booking failed! Please try again.");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Error processing booking!");
    }
  };

  const getCarTypeColor = (type) => {
    switch (type) {
      case "economy":
        return "#4CAF50";
      case "luxury":
        return "#FF9800";
      case "suv":
        return "#2196F3";
      default:
        return "#9C27B0";
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="booking-header"
        >
          <h1>🚗 Book Your Ride</h1>
          <button className="back-btn" onClick={() => navigate("/")}>
            ← Back to Home
          </button>
        </motion.div>

        <div className="booking-content">
          <div className="cars-section">
            <h2>Available Cars</h2>
            <div className="cars-list">
              {cars.map((car) => (
                <motion.div
                  key={car.carId}
                  whileHover={{ scale: 1.02 }}
                  className={`car-item ${
                    selectedCar?.carId === car.carId ? "selected" : ""
                  }`}
                  onClick={() => setSelectedCar(car)}
                  style={{
                    borderColor: getCarTypeColor(car.carType),
                  }}
                >
                  <div className="car-icon">
                    <Car size={40} color={getCarTypeColor(car.carType)} />
                  </div>
                  <div className="car-details">
                    <h3>
                      {car.brand} {car.model}
                    </h3>
                    <p className="car-type-badge">{car.carType.toUpperCase()}</p>
                    <p className="car-reg">Reg: {car.regNumber}</p>
                    <div className="car-pricing">
                      <span className="price">${car.baseRate}/day</span>
                      <span className="stalling">
                        +${car.stallingCharge}/hr stalling
                      </span>
                    </div>
                  </div>
                  {selectedCar?.carId === car.carId && (
                    <div className="selected-badge">✓ Selected</div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="booking-form-section">
            <h2>Booking Details</h2>
            <div className="form-card">
              <div className="form-group">
                <label>
                  <Calendar size={18} /> Pickup Date
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => handleDateChange(e.target.value, returnDate)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="form-group">
                <label>
                  <Calendar size={18} /> Return Date
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => handleDateChange(pickupDate, e.target.value)}
                  min={pickupDate || new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="form-group">
                <label>
                  <Clock size={18} /> Stalling Hours (optional)
                </label>
                <input
                  type="number"
                  value={stallingHours}
                  onChange={(e) =>
                    setStallingHours(parseInt(e.target.value) || 0)
                  }
                  min="0"
                  placeholder="0"
                />
                <small>Extra charges if you keep the car longer</small>
              </div>

              {selectedCar && (
                <div className="cost-breakdown">
                  <h3>Cost Breakdown</h3>
                  <div className="breakdown-item">
                    <span>Base Rate ({numDays} days):</span>
                    <span>${(selectedCar.baseRate * numDays).toFixed(2)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Stalling Charges ({stallingHours} hrs):</span>
                    <span>
                      ${(selectedCar.stallingCharge * stallingHours).toFixed(2)}
                    </span>
                  </div>
                  <div className="breakdown-total">
                    <span>Total Cost:</span>
                    <span className="total-amount">${totalCost.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button
                className="book-btn"
                onClick={handleBooking}
                disabled={!selectedCar || !pickupDate || !returnDate}
              >
                <DollarSign size={18} /> Proceed to Payment
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showPayment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setShowPayment(false)}
            >
              <motion.div
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                className="payment-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="close-modal"
                  onClick={() => setShowPayment(false)}
                >
                  <X size={24} />
                </button>

                <h2>
                  <CreditCard size={24} /> Payment Details
                </h2>

                <form onSubmit={handlePayment}>
                  <div className="payment-summary">
                    <p>
                      Total Amount: <strong>${totalCost.toFixed(2)}</strong>
                    </p>
                  </div>

                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 16) {
                          setCardNumber(
                            val.replace(/(\d{4})(?=\d)/g, "$1 ").trim()
                          );
                        }
                      }}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input type="text" placeholder="MM/YY" required />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        maxLength="3"
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="pay-btn">
                    Confirm Payment - ${totalCost.toFixed(2)}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
            >
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.5 }}
                className="confirm-modal"
              >
                <div className="success-icon">✓</div>
                <h2>Booking Confirmed!</h2>
                <p>Your car has been booked successfully.</p>
                <p className="booking-details">
                  {selectedCar?.brand} {selectedCar?.model}
                  <br />
                  {pickupDate} to {returnDate}
                  <br />
                  Total: ${totalCost.toFixed(2)}
                </p>
                <div className="confirm-actions">
                  <button
                    className="view-dashboard-btn"
                    onClick={() => navigate("/dashboard")}
                  >
                    View Dashboard
                  </button>
                  <button className="close-btn" onClick={() => navigate("/")}>
                    Back to Home
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookingPage;
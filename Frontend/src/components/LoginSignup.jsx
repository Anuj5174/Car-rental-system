import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import LightRays from "./LightRays";
import "../styles/LoginSignup.css";

const LoginSignup = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignup) {
      // Register new user
      try {
        const response = await fetch("http://localhost:8080/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.success) {
          alert("Account created successfully! Please login.");
          setIsSignup(false);
          setFormData({ username: "", email: "", password: "" });
        } else {
          alert(data.message || "Registration failed!");
        }
      } catch (error) {
        console.error("Registration error:", error);
        alert("Error connecting to server!");
      }
    } else {
      // Login existing user
      try {
        const response = await fetch("http://localhost:8080/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Save user data to localStorage
          localStorage.setItem("user", JSON.stringify(data));

          // friendly welcome message
          alert(`Welcome back, ${data.username}!`);

          // Redirect based on user type
          if (data.userType === "admin") {
            navigate("/admin");
          } else {
            navigate("/dashboard");
          }
        } else {
          alert(data.message || "Invalid credentials!");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("Error connecting to server!");
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="auth-page">
      {/* 🌈 Dynamic Light Rays Background */}
      <div className="rays-bg">
        <LightRays
          raysOrigin="top-center"
          raysColor="#00ffff"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.15}
          noiseAmount={0.1}
          distortion={0.05}
        />
      </div>

      {/* ✨ Glowing Login/Signup Form */}
      <motion.div
        className="form-container"
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <form className="form" onSubmit={handleSubmit}>
          <h2>{isSignup ? "Create Account" : "Login to Your Account"}</h2>

          {isSignup && (
            <div className="input">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <label>Username</label>
            </div>
          )}

          <div className="input">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <label>Email</label>
          </div>

          <div className="input">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <label>Password</label>
          </div>

          <button type="submit">
            {isSignup ? "Sign Up" : "Sign In"}
          </button>

          <p className="switch-text">
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <span onClick={() => setIsSignup(!isSignup)}>
              {isSignup ? "Sign In" : "Sign Up"}
            </span>
          </p>

          <p className="back-home" onClick={() => navigate("/")}>
            ← Back to Home
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginSignup;
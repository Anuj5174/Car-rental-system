# Car Rental System (OOPS Project)

A full-fledged Car Rental Management System built using **Object-Oriented Programming (OOP) in C++** with a modern **React + Vite** frontend.

---

## 📌 Team Members
1. **Aditi Thakre** (BT24CSE152)
2. **Anuj Partani** (BT24CSE163)
3. **Anshumaan Singh** (BT24CSE169)
4. **Akshay Gupta** (BT24CSE179)
5. **Pranshu Jain** (BT24CSE175)

---

## 🧠 Object-Oriented Programming (OOP) Concepts Implemented

1. **Inheritance**:
   - `Vehicle` (Abstract Base Class in `include/Vehicle.h`) $\rightarrow$ `Car` (Derived Class in `include/Car.h`).
   - `User` (Abstract Base Class in `include/User.h`) $\rightarrow$ `Customer` (`include/Customer.h`) & `Admin` (`include/Admin.h`).

2. **Polymorphism**:
   - Virtual Destructors in base classes (`virtual ~Vehicle()`, `virtual ~User()`).
   - Pure Virtual Functions overridden by derived classes:
     - `virtual double calculateRentalFee(int days) const = 0` $\rightarrow$ overridden in `Car` to compute fees based on car tier and daily base rates.
     - `virtual double calculateTotalRentalFee(int days, int stallingHours) const = 0` $\rightarrow$ calculates rental fee plus dynamic stalling charges.
     - `virtual std::string getDetailsString() const = 0` $\rightarrow$ polymorphic vehicle representation.
     - `virtual std::string getUserType() const = 0` $\rightarrow$ returns `"customer"` vs `"admin"`.
     - `virtual std::string toFileString() const = 0` $\rightarrow$ polymorphic CSV file serialization.

3. **Encapsulation**:
   - All state attributes (`vehicleID`, `make`, `model`, `baseRate`, `stallingCharge`, `regNumber`, `password`, `totalCost`) are strictly `private` or `protected`.
   - Access and mutations are provided via public getters, setters, and business methods (`setRates()`, `setAvailability()`, `setStatus()`).

4. **Abstraction**:
   - Complex file reading, splitting, and serialization operations are abstracted inside the `Database` class (`include/Database.h`).
   - Complete rental transactions, authentication, and fleet operations are encapsulated inside `CarRentalSystem` (`include/CarRentalSystem.h`).

5. **Data Persistence**:
   - All data is persisted directly to formatted text files in `data/`:
     - `data/cars.txt`: Fleet catalog and availability status.
     - `data/users.txt`: User accounts and roles.
     - `data/bookings.txt`: Active and completed rental records.

---

## 🚀 How to Run the Project

### Option A: Standalone C++ Console CLI (For Terminal Evaluation)
You can compile and run the interactive C++ OOP console application directly:

```powershell
# 1. Compile with standard g++ (C++11/C++14/C++17)
g++ -std=c++14 src/cli_main.cpp src/Vehicle.cpp src/Car.cpp src/User.cpp src/Customer.cpp src/Admin.cpp src/Booking.cpp src/Database.cpp -Iinclude -o car_rental_cli.exe

# 2. Run the application
.\car_rental_cli.exe
```

The CLI includes:
- Interactive login and registration
- Dedicated **Polymorphism Demonstration** menu
- Customer car browsing, renting, returning, and cancellation
- Admin fleet management, rate updates, revenue calculation, and user listings

---

### Option B: Full-Stack Web Application (React + REST API)

1. **Start the Backend API Server**:
   ```powershell
   python server.py
   ```
   *Runs on `http://localhost:8080` with full CORS support.*

2. **Start the React Frontend**:
   ```powershell
   cd Frontend
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser.*

---

## 🔑 Default Credentials
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@rentify.com` | `admin123` |
| **Customer** | `john@example.com` | `pass123` |
| **Customer** | `alice@example.com` | `pass123` |

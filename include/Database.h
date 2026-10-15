#pragma once
#include "Car.h"
#include "User.h"
#include "Customer.h"
#include "Admin.h"
#include "Booking.h"
#include <vector>
#include <memory>

// Abstraction Class for File Handling & Persistence
class Database {
private:
    const std::string usersFile = "data/users.txt";
    const std::string carsFile = "data/cars.txt";
    const std::string bookingsFile = "data/bookings.txt";

    // Helper to split CSV lines
    std::vector<std::string> split(const std::string& s, char delimiter);

public:
    Database(); // Constructor initializes directories and seeds default records if empty

    // --- User Management ---
    std::vector<std::shared_ptr<User>> loadUsers();
    bool saveUser(const User& user); // Appends a new user
    bool saveAllUsers(const std::vector<std::shared_ptr<User>>& users); // Overwrites users

    // --- Car Management ---
    std::vector<Car> loadCars();
    bool saveCars(const std::vector<Car>& cars); // Overwrites all cars
    bool saveAllCars(const std::vector<Car>& cars); // Alias for saveCars

    // --- Booking Management ---
    std::vector<Booking> loadBookings();
    bool saveBooking(const Booking& booking); // Appends a new booking
    bool saveAllBookings(const std::vector<Booking>& bookings); // Overwrites all bookings
};
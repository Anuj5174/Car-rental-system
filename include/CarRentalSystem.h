#pragma once
#include "Database.h"
#include "crow_all.h"
#include <vector>
#include <memory>
#include <mutex>

class CarRentalSystem {
private:
    Database db;
    std::vector<std::shared_ptr<User>> users;
    std::vector<Car> cars;
    std::vector<Booking> bookings;
    
    std::mutex dataMutex; 

    // Private helpers
    std::shared_ptr<User> findUserByEmail(const std::string& email);
    std::shared_ptr<User> findUserByID(const std::string& userID);
    Car* findCarByID(const std::string& carID);
    Car* findCarByReg(const std::string& regNumber);
    Booking* findBookingByID(const std::string& bookingID);
    std::string generateUniqueID(const std::string& prefix);
    void loadData();

public:
    CarRentalSystem();

    // --- Auth API ---
    crow::json::wvalue registerUser(const std::string& username, const std::string& email, const std::string& password);
    crow::json::wvalue loginUser(const std::string& email, const std::string& password);

    // --- Car API ---
    crow::json::wvalue getAllCars();

    // --- Booking API ---
    crow::json::wvalue createBooking(const crow::json::rvalue& data);
    crow::json::wvalue getUserBookings(const std::string& userID);
    crow::json::wvalue cancelBooking(const std::string& bookingID, const std::string& userID = "");
    crow::json::wvalue returnCar(const std::string& bookingID);

    // --- Admin API ---
    crow::json::wvalue getAdminUsers();
    crow::json::wvalue getAllBookings();
    crow::json::wvalue addNewCar(const crow::json::rvalue& data);
    crow::json::wvalue deleteCar(const std::string& carID);
    crow::json::wvalue updateCarRates(const std::string& carID, const crow::json::rvalue& data);
    crow::json::wvalue deleteUser(const std::string& userID);
};
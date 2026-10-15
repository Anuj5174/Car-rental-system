#pragma once
#include <string>
#include "Vehicle.h"

#if defined(USE_CROW) || defined(CROW_VERSION)
#include "crow_all.h"
#define HAS_CROW 1
#endif

class Car : public Vehicle {
private:
    std::string carType;
    double baseRate;
    double stallingCharge;
    std::string regNumber;

public:
    Car(std::string id, std::string brand, std::string model, std::string type,
        double rate, double stall, std::string reg, bool available, int year = 2023)
        : Vehicle(id, brand, model, year, available),
          carType(type), baseRate(rate), stallingCharge(stall), regNumber(reg) {}

    // --- Encapsulation (Getters) ---
    std::string getCarID() const { return vehicleID; }
    std::string getBrand() const { return make; }
    std::string getModel() const { return model; }
    std::string getCarType() const { return carType; }
    double getBaseRate() const { return baseRate; }
    double getStallingCharge() const { return stallingCharge; }
    std::string getRegNumber() const { return regNumber; }
    bool getAvailability() const { return isAvailable; }

    // --- Encapsulation (Setters) ---
    void setCarType(const std::string& type) { carType = type; }
    void setRates(double newRate, double newStall) {
        if (newRate >= 0) baseRate = newRate;
        if (newStall >= 0) stallingCharge = newStall;
    }
    void setRegNumber(const std::string& reg) { regNumber = reg; }

    // --- Polymorphism (Overriding Pure Virtual Functions) ---
    double calculateRentalFee(int days) const override {
        return baseRate * (days > 0 ? days : 1);
    }

    double calculateTotalRentalFee(int days, int stallingHours) const override {
        double rental = calculateRentalFee(days);
        double stall = (stallingHours > 0) ? (stallingCharge * stallingHours) : 0.0;
        return rental + stall;
    }

    std::string getDetailsString() const override;

    // File I/O
    std::string toFileString() const;
    
#ifdef HAS_CROW
    // JSON Conversion for Web API
    crow::json::wvalue toJson() const;
#endif
};
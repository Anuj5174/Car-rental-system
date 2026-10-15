#pragma once
#include <string>

// Abstract Base Class for Inheritance
class Vehicle {
protected:
    std::string vehicleID;
    std::string make;
    std::string model;
    int year;
    bool isAvailable;

public:
    Vehicle(std::string id, std::string make, std::string model, int year, bool available);
    virtual ~Vehicle();

    // --- Encapsulation (Getters) ---
    std::string getVehicleID() const { return vehicleID; }
    std::string getMake() const { return make; }
    std::string getModel() const { return model; }
    int getYear() const { return year; }
    bool getAvailability() const { return isAvailable; }

    // --- Encapsulation (Setters) ---
    void setAvailability(bool available) { isAvailable = available; }
    void setMake(const std::string& newMake) { make = newMake; }
    void setModel(const std::string& newModel) { model = newModel; }
    void setYear(int newYear) { year = newYear; }

    // --- Polymorphism (Pure Virtual Functions) ---
    virtual double calculateRentalFee(int days) const = 0;
    virtual double calculateTotalRentalFee(int days, int stallingHours) const = 0;
    virtual std::string getDetailsString() const = 0;
};
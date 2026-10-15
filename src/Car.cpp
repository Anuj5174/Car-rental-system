#include "Car.h"
#include <sstream>

std::string Car::getDetailsString() const {
    std::ostringstream oss;
    oss << make << " " << model << " [" << carType << "] (Reg: " << regNumber 
        << ", Year: " << year << ") - $" << baseRate << "/day, Stall: $" << stallingCharge << "/hr";
    return oss.str();
}

std::string Car::toFileString() const {
    std::ostringstream oss;
    oss << vehicleID << ","
        << make << ","
        << model << ","
        << carType << ","
        << baseRate << ","
        << stallingCharge << ","
        << regNumber << ","
        << (isAvailable ? "1" : "0");
    return oss.str();
}

#ifdef HAS_CROW
crow::json::wvalue Car::toJson() const {
    return {
        {"carId", vehicleID},
        {"brand", make},
        {"model", model},
        {"carType", carType},
        {"baseRate", baseRate},
        {"stallingCharge", stallingCharge},
        {"regNumber", regNumber},
        {"isAvailable", isAvailable}
    };
}
#endif
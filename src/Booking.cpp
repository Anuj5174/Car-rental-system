#include "Booking.h"
#include <sstream>

std::string Booking::toFileString() const {
    std::ostringstream oss;
    oss << bookingId << ","
        << userId << ","
        << carId << ","
        << pickupDate << ","
        << returnDate << ","
        << numDays << ","
        << stallingHours << ","
        << totalCost << ","
        << status << ","
        << paymentId << ","
        << paymentStatus;
    return oss.str();
}

#ifdef HAS_CROW
crow::json::wvalue Booking::toJson(const std::string& carBrand, const std::string& carModel, const std::string& carType) const {
    return {
        {"bookingId", bookingId},
        {"userId", userId},
        {"carId", carId},
        {"carBrand", carBrand}, 
        {"carModel", carModel}, 
        {"carType", carType},  
        {"pickupDate", pickupDate},
        {"returnDate", returnDate},
        {"numDays", numDays},
        {"stallingHours", stallingHours},
        {"totalCost", totalCost},
        {"status", status},
        {"paymentId", paymentId},
        {"paymentStatus", paymentStatus}
    };
}
#endif
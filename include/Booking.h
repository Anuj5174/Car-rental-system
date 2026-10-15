#pragma once
#include <string>

#if defined(USE_CROW) || defined(CROW_VERSION)
#include "crow_all.h"
#define HAS_CROW 1
#endif

class Booking {
private:
    std::string bookingId;
    std::string userId;
    std::string carId;
    std::string pickupDate;
    std::string returnDate;
    int numDays;
    int stallingHours;
    double totalCost;
    std::string status; // "active", "completed", "cancelled"
    std::string paymentId;
    std::string paymentStatus; // "success", "pending"

public:
    Booking(std::string bId, std::string uId, std::string cId, std::string pDate,
            std::string rDate, int days, int stall, double cost, 
            std::string status, std::string pmtId, std::string pmtStatus)
        : bookingId(bId), userId(uId), carId(cId), pickupDate(pDate),
          returnDate(rDate), numDays(days), stallingHours(stall), totalCost(cost),
          status(status), paymentId(pmtId), paymentStatus(pmtStatus) {}

    // --- Encapsulation (Getters) ---
    std::string getBookingID() const { return bookingId; }
    std::string getCustomerID() const { return userId; }
    std::string getCarID() const { return carId; }
    std::string getPickupDate() const { return pickupDate; }
    std::string getReturnDate() const { return returnDate; }
    int getNumDays() const { return numDays; }
    int getStallingHours() const { return stallingHours; }
    double getTotalCost() const { return totalCost; }
    std::string getStatus() const { return status; }
    std::string getPaymentId() const { return paymentId; }
    std::string getPaymentStatus() const { return paymentStatus; }

    // --- Encapsulation (Setters) ---
    void setStatus(const std::string& newStatus) { status = newStatus; }
    void setPaymentStatus(const std::string& newStatus) { paymentStatus = newStatus; }
    
    std::string toFileString() const;
    
#ifdef HAS_CROW
    // JSON Conversion
    crow::json::wvalue toJson(const std::string& carBrand, const std::string& carModel, const std::string& carType) const;
#endif
};
#include "Vehicle.h"

Vehicle::Vehicle(std::string id, std::string make, std::string model, int year, bool available)
    : vehicleID(id), make(make), model(model), year(year), isAvailable(available) {}

Vehicle::~Vehicle() {}

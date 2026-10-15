cmake_minimum_required(VERSION 3.15)
project(CarRentalSystem CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find Crow (and its dependencies like Boost)
# If using vcpkg, set -DCMAKE_TOOLCHAIN_FILE=[path/to/vcpkg.cmake]
find_package(Crow REQUIRED)

# Include directories
include_directories(include)

# Add our executable
add_executable(car_rental_server
    src/main.cpp
    src/Vehicle.cpp
    src/Car.cpp
    src/User.cpp
    src/Customer.cpp
    src/Admin.cpp
    src/Booking.cpp
    src/Database.cpp
    src/CarRentalSystem.cpp
)

# Link against Crow
target_link_libraries(car_rental_server PRIVATE Crow::Crow)

message(STATUS "Crow include dirs: ${Crow_INCLUDE_DIRS}")
message(STATUS "Crow libraries: ${Crow_LIBRARIES}")

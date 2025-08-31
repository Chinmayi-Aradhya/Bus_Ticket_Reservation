**🚌 Bus Reservation System – AWS Deployment**
**📌 Project Overview**
This project is a Bus Reservation System that allows users to:
    • Search available buses by route and date.
    • View seat availability.
    • Book tickets online.
    • Cancel bookings.
The project demonstrates end-to-end cloud deployment using AWS services:
    • EC2 → Hosts the Node.js + Express backend API.
    • RDS (MySQL) → Stores buses and bookings data.
    • S3 → Hosts static frontend (HTML, CSS, JS).
    • VPC → Provides an isolated and secure network environment.

**📂 Tech Stack**
    • Frontend: HTML, CSS, JavaScript
    • Backend: Node.js, Express.js
    • Database: MySQL (AWS RDS)
    • Cloud Provider: AWS (EC2, RDS, S3, VPC)

**🌐 System Architecture**
    [ User Browser ]
           |
           |
    [S3 Bucket - Static Frontend]
           |
           |
    [EC2 Instance - Node.js Backend API]
           |
           |
    [RDS MySQL Database]
**🚀 Features**
    • Search buses by route and travel date.
    • Real-time seat availability check.
    • Booking with unique booking reference.
    • View and cancel bookings.
    • Cloud-hosted and globally accessible.

**⚙️ Setup & Deployment Steps**
**1. AWS Setup**
    • Create a VPC with public + private subnets.
    • Launch an EC2 instance (Ubuntu) inside the VPC.
    • Create an RDS MySQL instance in the same VPC.
    • Create an S3 bucket for frontend hosting.

**2. Backend (Node.js + Express on EC2)**
# Update system and install Node.js
sudo apt update && sudo apt upgrade -y
sudo apt install nodejs npm -y

# Upload project files
scp -i key.pem Node_Pro.zip ubuntu@<EC2_PUBLIC_IP>:/home/ubuntu/

# Extract and install dependencies
unzip Node_Pro.zip
cd Node_Pro/backend
npm install

# Run server
node server.js

**3. Database (AWS RDS – MySQL)**
    • Create database bus_reservation.
    • Create tables buses and bookings.
    • Insert sample bus data.
    • Update server.js with RDS endpoint, username, password.
**4. Frontend (S3 Static Website)**
    • Upload index.html and static files to S3 bucket.
    • Enable Static Website Hosting in S3.
    • Update frontend JS with API base URL:
const API_BASE = "http://<EC2_PUBLIC_IP>:3000/api";

**📜 API Endpoints**
🔹 Bus APIs
    • GET /api/buses → Fetch all buses
    • GET /api/buses/search?route=<route>&date=<yyyy-mm-dd> → Search buses
🔹 Booking APIs
    • POST /api/bookings → Create booking
    • GET /api/bookings/:reference → Get booking details
    • PUT /api/bookings/:reference/cancel → Cancel booking

**🧪 Testing the Project**
    1. Access frontend via S3 website URL.
    2. Search buses → See results.
    3. Book seats → Get booking reference.
    4. View/cancel booking → Confirm changes in DB.


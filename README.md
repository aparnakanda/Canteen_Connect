# 🍴 Canteen Connect

Canteen Connect is a mobile application designed to streamline the food ordering experience within college campuses. It enables students to explore multiple canteens, browse real-time menus, place and track orders, write reviews, raise issues, and enjoy a seamless ordering experience. Admins and canteen staff can view orders and manage items efficiently.

---

## 🎯 Project Goals

- Reduce long queues in college canteens by enabling online food ordering.
- Provide a transparent and interactive food ordering system.
- Display real-time food availability.
- Enable users to view and navigate to different canteens within the college.
- Help new users easily locate canteen locations with integrated navigation support (e.g., maps or directions).

---

## 🚀 Features

- 🔍 View and filter food items from different canteens
- 📦 Place and track food orders
- 📊 View order history with date and price
- ✍️ Post reviews and rate menu items
- 🛠️ Raise issues directly integrated with **ServiceNow**
- 🔐 Secure authentication for users and admins
- 🧑‍💼 Admin dashboard to manage:
  - Menu items
  - Order details
  - User feedback
- 🗂️ Menu filters based on availability and type (Veg/Non-Veg/Beverages)
- 💬 Rule-based chatbot for quick assistance
- 🔁 Dynamic data loading via ServiceNow REST APIs

---

## 🧑‍💻 Tech Stack

| Layer          | Tech                          |
| -------------- | ----------------------------- |
| Frontend       | React Native                  |
| Backend        | Node.js, Express.js           |
| Database       | ServiceNow                    |
| Integration    | ServiceNow REST APIs          |
| Authentication | AsyncStorage (React Native)   |

---

## 🔗 ServiceNow Integration

The app uses ServiceNow as the backend system to manage canteen operations:

- **Canteen List (`canteen_list`)** – Stores canteen details like name, image, timings, and ratings.
- **Menu Items (`u_canteen_menu`)** – Stores food items with fields such as item name, price, availability (yes/no), and type (veg, non-veg, beverages).
- **Orders (`u_order_details`)** – Captures order details including user, items, price, and order status.
- **User Profiles (`u_canteen_user`)** – Stores user details like email, username, and photo URL.
- **Issues (`u_issues`)** – Allows students to raise issues (service-related, billing, delays), integrated with ServiceNow workflows.

---

## 📱 Key Screens

- **Home Screen** – Displays all available canteens dynamically.
- **Menu Page** – Shows items with availability and filters.
- **Cart & Orders** – Add items, confirm orders, and track them.
- **Profile** – View user info, past orders, and reviews.
- **Issue Raising** – Submit issues directly linked to ServiceNow.
- **Admin Dashboard** – Manage menu items, orders, and user feedback.

---

## ⚡ Installation & Setup

1. **Clone the repository**  
git clone https://github.com/aparnakanda/Canteen_Connect.git  
cd Canteen_Connect

2. **Install dependencies**  
npm install

3. **Start the application**  
npm start

4. **Backend Configuration (Node.js + Express)**  
- Configure your **ServiceNow instance URL**  
- Set up **REST API credentials**  
- Ensure the following **tables exist in ServiceNow**:  
  - canteen_list  
  - u_canteen_menu  
  - u_order_details  
  - u_canteen_user  
  - u_issues

---

## 📌 Future Enhancements

- 🔔 Push notifications for order status updates  
- 💳 Online payment integration  
- 🗺️ Live tracking of order preparation and pickup  
- 🌐 Multi-campus support

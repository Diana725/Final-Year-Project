import React from "react";
import "./App.css";
import Login from "./components/Login";
import Register from "./components/Register";
import Navbar from "./components/Navbar/Navbar";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout"; // Import the new Layout component
import ProductList from "./components/Products";
import SearchResults from "./components/Search";
import AddProduct from "./components/AddProduct";
import UpdateProduct from "./components/UpdateProduct";
import PricePredictions from "./components/PricePredictions";
import Home from "./components/Home/Home";
import ChatPage from "./components/ChatPage";
import FarmerPayments from "./components/FarmerPayments";

function App() {
  return (
    <Router>
      <Layout>
        {" "}
        {/* Wrap your routes with the Layout component */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/farmer/payments" element={<FarmerPayments />} />
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/add" element={<AddProduct />} />
          <Route path="/price_prediction" element={<PricePredictions />} />
          <Route path="/update/:id" element={<UpdateProduct />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

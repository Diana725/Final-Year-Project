import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Function to handle the login process
  const handleLogin = async (e) => {
    e.preventDefault();

    let item = { name, password };

    try {
      // Call the Laravel API to login the user
      let response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(item),
      });

      // Check if the response is successful
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error during login:", errorData);
        setErrorMessage(errorData.message || "Failed to login.");
        return;
      }

      let result = await response.json();
      // Clear the error message if login is successful
      setErrorMessage("");

      // Store user info and token in local storage
      localStorage.setItem("user-info", JSON.stringify(result.user));
      localStorage.setItem("token", result.token);

      // Redirect to the home page after successful login
      navigate("/products");
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("Failed to login. Please try again.");
    }
  };

  // Function to make authenticated requests
  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem("token");

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    // Handle errors
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error during fetch:", errorData);
      throw new Error(errorData.message || "Failed to fetch.");
    }

    return response.json();
  };

  return (
    <div className="container mt-5">
      <div className="col-md-6 offset-md-3">
        <h2>Login Page</h2>
        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              className="form-control"
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group mt-3">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary mt-4">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

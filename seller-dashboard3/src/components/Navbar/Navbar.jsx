import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { Dropdown } from "react-bootstrap";

const Navbar = () => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [hasNewPayments, setHasNewPayments] = useState(false); // Track new payments

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("user-info"));
    if (userInfo) {
      setIsLoggedIn(true);
      setUserName(userInfo.name);
    }
  }, []);

  // Poll for new payment updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/farmer/check-new-payments",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.hasNewPayments) {
            // Assuming backend returns { hasNewPayments: true }
            setHasNewPayments(true);
          }
        }
      } catch (error) {
        console.error("Error checking new payments:", error);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user-info");
    setIsLoggedIn(false);
    setUserName("");
    navigate("/login"); // Redirect to home page or login page after logout
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?query=${searchQuery}`);
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-white py-2 shadow-sm">
        <div className="container">
          <img className="icon" src="../../assets/corn.png" alt="Logo" />
          <NavLink className="navbar-brand fw-bold fs-3" to="/">
            MaizeAI
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/products"
                  activeClassName="active"
                >
                  Products
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/add"
                  activeClassName="active"
                >
                  Add Product
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/price_predictions"
                  activeClassName="active"
                >
                  Price Predictions
                </NavLink>
              </li>
              {/* Payment Details link with blue dot if there are new payments */}
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/farmer/payments"
                  activeClassName="active"
                >
                  Payment Details{" "}
                  {hasNewPayments && <span className="blue-dot"></span>}
                </NavLink>
              </li>
            </ul>
            <form className="d-flex me-3" onSubmit={handleSearchSubmit}>
              <input
                className="form-control me-2"
                type="search"
                placeholder="Search"
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-outline-dark" type="submit">
                Search
              </button>
            </form>
            {isLoggedIn && (
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-outline-dark d-flex align-items-center"
                  type="button"
                >
                  <i className="fa fa-user me-1"></i> {userName}
                  <Dropdown>
                    <Dropdown.Toggle
                      as="span"
                      className="dropdown-toggle-split"
                      id="dropdownMenuButton"
                    />
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={handleLogout}>
                        Log Out
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;

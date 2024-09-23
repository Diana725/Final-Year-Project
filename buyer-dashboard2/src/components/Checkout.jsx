import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { Button, Form } from "react-bootstrap"; // Bootstrap styling
import { removeFromCart } from "../redux/action"; // Import your action to remove item from cart

const Checkout = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const dispatch = useDispatch(); // Initialize useDispatch

  // Fetch the cart from the Redux store
  const cartItems = useSelector((state) => state.cart.items);

  // State to hold the products with their details
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State to hold payment proof for each item
  const [paymentProofs, setPaymentProofs] = useState({});

  // Fetch product details for each product in the cart
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const productDetails = await Promise.all(
          cartItems.map(async (item) => {
            const response = await fetch(
              `http://localhost:8000/api/buyer/products/${item.product.id}`
            );
            if (!response.ok) {
              throw new Error("Failed to fetch product details");
            }
            const productData = await response.json();
            return { ...item, productDetails: productData }; // Store product details alongside cart item
          })
        );
        setProducts(productDetails);
      } catch (err) {
        setError("Error fetching product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [cartItems]);

  // Handle Confirm Payment for each item
  const handlePayment = async (item) => {
    try {
      const response = await fetch("http://localhost:8000/api/buyer/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          farmer_id: item.productDetails.user_id, // Farmer's ID from product details
          product_id: item.product.id, // Product ID from the cart item
          payment_reference: "Direct Transfer", // Example reference, adjust as needed
          proof_of_payment: paymentProofs[item.product.id] || "", // Use the uploaded payment proof
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to confirm payment");
      }

      const result = await response.json();
      alert(`Payment confirmed for ${item.productDetails.name}!`);

      // Remove item from cart
      dispatch(removeFromCart(item.product.id));

      // Navigate to Payment Details page with the payment ID
      navigate(`/payment-details/${result.payment_id}`);
    } catch (err) {
      console.error("Payment Error:", err); // Log the error for debugging
      alert(err.message); // Show the error message to the user
    }
  };

  // Handle change for payment proof input
  const handleProofChange = (productId, value) => {
    setPaymentProofs((prev) => ({
      ...prev,
      [productId]: value, // Update the payment proof for the specific product
    }));
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <h2 className="mb-4">Checkout</h2>

          {/* Display Total Price */}
          <h4>
            Total Amount: Ksh{" "}
            {products
              .reduce(
                (acc, item) =>
                  acc +
                  item.quantity * parseFloat(item.productDetails?.price || 0),
                0
              )
              .toFixed(2)}
          </h4>

          {/* Display product details including payment method */}
          {products.map((item) => (
            <div key={item.product.id} className="mb-4">
              <h5>{item.productDetails.name}</h5>
              <p>Price: Ksh {item.productDetails.price * item.quantity}</p>
              <p>Quantity: {item.quantity}</p>

              {/* Display the payment method specified by the farmer */}
              <p>
                <strong>Payment Method:</strong>{" "}
                {item.productDetails.payment_method}
              </p>

              {/* Input for proof of payment */}
              <Form.Group controlId={`proofOfPayment-${item.product.id}`}>
                <Form.Label>Upload Payment Code</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter payment code"
                  onChange={(e) =>
                    handleProofChange(item.product.id, e.target.value)
                  }
                />
              </Form.Group>
              <br />
              {/* Confirm Payment Button */}
              <Button
                type="button"
                variant="dark"
                className="w-100"
                onClick={() => handlePayment(item)} // Handle payment for each product
              >
                Confirm Payment
              </Button>
            </div>
          ))}

          {/* Back to Cart Button */}
          <Button
            variant="outline-dark"
            className="mt-3 mb-5 w-100"
            onClick={() => navigate("/cart")}
          >
            Back to Cart
          </Button>
        </div>
      </div>
      <hr />
    </div>
  );
};

export default Checkout;

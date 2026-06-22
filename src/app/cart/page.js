"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { api } from "../../lib/api";
import { ShoppingCart, ArrowRight, Loader2, Trash2 } from "lucide-react";

export default function CartPage() {
  const { role, isAuthenticated, loading: authLoading } = useAuth();
  const { showSuccess, showDanger, showWarning } = useToast();
  const router = useRouter();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || role !== "CUSTOMER")) {
      showWarning("Access restricted. This page is only for registered CUSTOMERS.");
      router.push("/");
    }
  }, [isAuthenticated, role, authLoading]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await api.get("/backend/cart/me");
      setCart(data);
    } catch (e) {
      showDanger("Could not fetch cart items. Verify cart-service is online.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && role === "CUSTOMER") {
      fetchCart();
    }
  }, [isAuthenticated, role]);

  const handleCheckout = async () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      showWarning("Your cart is empty!");
      return;
    }

    setCheckoutLoading(true);
    try {
      const checkoutOrder = await api.post("/backend/checkout", {
        cartId: cart.id
      });
      
      // Store checkout order in localStorage to be read by payment page
      localStorage.setItem("checkoutOrder", JSON.stringify(checkoutOrder));
      
      showSuccess("Checkout generated! Directing to Payment Portal.");
      router.push("/payment");
    } catch (err) {
      showDanger(err.message || "Failed to generate checkout order.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (role !== "CUSTOMER") {
    return (
      <div className="glass-card" style={{ maxWidth: "500px", margin: "3rem auto", textAlign: "center", padding: "2rem" }}>
        <ShoppingCart size={48} style={{ color: "var(--danger)", marginBottom: "1rem" }} />
        <h2>Access Forbidden</h2>
        <p>You must login as a Customer to manage shopping carts.</p>
      </div>
    );
  }

  const hasItems = cart && cart.items && cart.items.length > 0;
  const subtotal = hasItems ? cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0) : 0;

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2>Your Shopping Cart</h2>
        <p>Manage items added from direct catalog listing</p>
      </div>

      <div className="glass-card">
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : !hasItems ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <ShoppingCart size={48} style={{ color: "#4b5563", marginBottom: "1rem" }} />
            <p style={{ fontSize: "1.1rem" }}>Your cart is empty.</p>
            <p className="text-sm" style={{ marginTop: "0.25rem" }}>
              Go browse the Catalog and add some fresh organic items first!
            </p>
          </div>
        ) : (
          <div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--card-border)", color: "#9ca3af" }}>
                    <th style={{ padding: "0.75rem" }}>Product ID</th>
                    <th style={{ padding: "0.75rem" }}>Product Name</th>
                    <th style={{ padding: "0.75rem" }}>Unit Price</th>
                    <th style={{ padding: "0.75rem" }}>Quantity</th>
                    <th style={{ padding: "0.75rem" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "0.75rem" }}>{item.productId}</td>
                      <td style={{ padding: "0.75rem", fontWeight: "700", color: "#fff" }}>{item.productName}</td>
                      <td style={{ padding: "0.75rem" }}>₹{item.price.toFixed(2)}</td>
                      <td style={{ padding: "0.75rem" }}>{item.quantity}</td>
                      <td style={{ padding: "0.75rem", fontWeight: "600" }}>₹{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-2 flex-between" style={{ borderTop: "1px solid var(--card-border)", paddingTop: "1.5rem" }}>
              <div>
                <p>Subtotal Amount:</p>
                <span style={{ fontSize: "1.6rem", fontWeight: "800", color: "#fff" }}>
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>

              <button 
                onClick={handleCheckout} 
                className="btn btn-primary" 
                style={{ width: "auto" }} 
                disabled={checkoutLoading}
              >
                {checkoutLoading ? <Loader2 className="animate-spin" size={16} /> : <span className="flex-gap-sm">Proceed to Checkout <ArrowRight size={16} /></span>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

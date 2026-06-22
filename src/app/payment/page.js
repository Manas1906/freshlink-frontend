"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { api } from "../../lib/api";
import { CreditCard, Wallet, Activity, AlertCircle, Loader2, DollarSign } from "lucide-react";

export default function PaymentPage() {
  const { role, isAuthenticated, loading: authLoading } = useAuth();
  const { showSuccess, showDanger, showWarning } = useToast();
  const router = useRouter();

  const [checkoutOrder, setCheckoutOrder] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || role !== "CUSTOMER")) {
      showWarning("Access restricted. This page is only for registered CUSTOMERS.");
      router.push("/");
    }
  }, [isAuthenticated, role, authLoading]);

  const fetchWalletBalance = async () => {
    try {
      const balance = await api.get("/backend/wallet/balance");
      setWalletBalance(parseFloat(balance) || 0);
    } catch (e) {
      console.warn("Could not retrieve wallet balance. Verify payment-service is online.", e);
    }
  };

  useEffect(() => {
    if (isAuthenticated && role === "CUSTOMER") {
      // Retrieve checkout order from localStorage
      const savedCheckout = localStorage.getItem("checkoutOrder");
      if (savedCheckout) {
        setCheckoutOrder(JSON.parse(savedCheckout));
      }
      fetchWalletBalance().then(() => setLoading(false));
    }
  }, [isAuthenticated, role]);

  const handlePayment = async (mode) => {
    if (!checkoutOrder) {
      showDanger("No active checkout session found.");
      return;
    }

    if (mode === "WALLET" && walletBalance < checkoutOrder.payableAmount) {
      showDanger("Insufficient wallet balance. Please use Credit Card or UPI, or add test funds.");
      return;
    }

    setPaymentLoading(true);
    try {
      const pIntent = await api.post("/backend/payments/pay", {
        checkoutId: checkoutOrder.id,
        amount: checkoutOrder.payableAmount,
        paymentMode: mode
      });

      if (pIntent && pIntent.status === "SUCCESS") {
        showSuccess(`Payment completed successfully! Txn Ref: ${pIntent.gatewayTxnId}`);
        // Clear checkout session
        localStorage.removeItem("checkoutOrder");
        setCheckoutOrder(null);
        
        // Refresh balance and redirect to orders
        await fetchWalletBalance();
        router.push("/orders");
      } else {
        throw new Error("Transaction rejected by payment gateway.");
      }
    } catch (err) {
      showDanger(err.message || "Payment transaction failed.");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2>Billing & Payment Gateway</h2>
        <p>Finalize checkout order using secure microservices payment channels</p>
      </div>

      <div className="grid-2">
        {/* Left Card: Checkout Order breakdown */}
        <div className="glass-card">
          <h2>Pending Checkout Order</h2>
          <p className="mb-2">Aggregated checkout totals generated from checkout-service</p>

          {checkoutOrder ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
              <div className="flex-between text-sm" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
                <span>Checkout Reference ID:</span>
                <span style={{ color: "#fff", fontWeight: "700" }}>{checkoutOrder.id}</span>
              </div>
              <div className="flex-between text-sm" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
                <span>Subtotal Amount:</span>
                <span style={{ color: "#fff" }}>₹{checkoutOrder.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="flex-between text-sm" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
                <span>Taxes & GST (5%):</span>
                <span style={{ color: "#fff" }}>₹{checkoutOrder.taxAmount?.toFixed(2)}</span>
              </div>
              <div className="flex-between text-sm" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
                <span>Delivery Fee:</span>
                <span style={{ color: "#fff" }}>₹{checkoutOrder.deliveryFee?.toFixed(2)}</span>
              </div>
              <div className="flex-between" style={{ padding: "0.5rem 0" }}>
                <span style={{ fontWeight: "700" }}>Payable Total:</span>
                <span style={{ fontSize: "1.6rem", fontWeight: "800", color: "#fff" }}>₹{checkoutOrder.payableAmount?.toFixed(2)}</span>
              </div>
              <span className="badge badge-warning" style={{ alignSelf: "flex-start" }}>{checkoutOrder.status}</span>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "2.5rem", color: "#9ca3af" }}>
              <AlertCircle size={36} style={{ color: "var(--warning)", marginBottom: "0.75rem" }} />
              <p>No active checkout session.</p>
              <p className="text-sm" style={{ marginTop: "0.25rem" }}>
                Go to your Cart and click 'Proceed to Checkout' first!
              </p>
            </div>
          )}
        </div>

        {/* Right Card: Select payment method */}
        <div className="glass-card">
          <h2>Select Payment Method</h2>
          <p className="mb-3">Integrates with payment-service and local wallet balance</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="flex-between" style={{ 
              background: "rgba(16,185,129,0.04)", 
              padding: "1rem 1.25rem", 
              borderRadius: "12px", 
              border: "1px solid rgba(16,185,129,0.15)" 
            }}>
              <div className="flex-gap-md">
                <Wallet style={{ color: "var(--success)" }} />
                <div>
                  <h3 style={{ color: "#fff" }}>Wallet Account Balance</h3>
                  <p className="text-sm">Instant ledger-backed debit</p>
                </div>
              </div>
              <span style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--success)" }}>₹{walletBalance.toFixed(2)}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button 
                onClick={() => handlePayment("CARD")} 
                className="btn btn-secondary flex-between" 
                disabled={!checkoutOrder || paymentLoading}
              >
                <span>Pay with Credit / Debit Card</span>
                <CreditCard size={16} />
              </button>
              
              <button 
                onClick={() => handlePayment("UPI")} 
                className="btn btn-secondary flex-between" 
                disabled={!checkoutOrder || paymentLoading}
              >
                <span>Pay with Unified Payments Interface (UPI)</span>
                <Activity size={16} />
              </button>
              
              <button 
                onClick={() => handlePayment("WALLET")} 
                className="btn btn-primary flex-between" 
                disabled={!checkoutOrder || paymentLoading || walletBalance < checkoutOrder?.payableAmount}
              >
                <span>Pay using Wallet Balance</span>
                <Wallet size={16} />
              </button>

              {checkoutOrder && walletBalance < checkoutOrder.payableAmount && (
                <p className="text-sm" style={{ color: "var(--danger)", textAlign: "center", marginTop: "0.25rem" }}>
                  ⚠️ Insufficient wallet balance. Please use Card, UPI or register a new customer to reset funds.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

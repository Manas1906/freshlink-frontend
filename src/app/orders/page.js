"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { api } from "../../lib/api";
import { Package, Wallet, Clock, CreditCard, Loader2 } from "lucide-react";

export default function OrdersPage() {
  const { role, isAuthenticated, loading: authLoading } = useAuth();
  const { showDanger, showWarning } = useToast();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || role !== "CUSTOMER")) {
      showWarning("Access restricted. This page is only for registered CUSTOMERS.");
      router.push("/");
    }
  }, [isAuthenticated, role, authLoading]);

  const fetchOrdersAndBalance = async () => {
    setLoading(true);
    try {
      // Parallel fetch for orders and wallet balance
      const [orderList, balance] = await Promise.all([
        api.get("/backend/orders/me"),
        api.get("/backend/wallet/balance")
      ]);
      
      setOrders(Array.isArray(orderList) ? orderList : []);
      setWalletBalance(parseFloat(balance) || 0);
    } catch (e) {
      showDanger("Could not fetch orders. Verify order-service and payment-service are online.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && role === "CUSTOMER") {
      fetchOrdersAndBalance();
    }
  }, [isAuthenticated, role]);

  if (authLoading || loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Wallet overview card */}
      <section className="glass-card flex-between" style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(168,85,247,0.05) 100%)",
        border: "1px solid rgba(255, 255, 255, 0.1)"
      }}>
        <div className="flex-gap-md">
          <Wallet size={36} style={{ color: "var(--success)" }} />
          <div>
            <h2>My Digital Wallet</h2>
            <p className="text-sm">Account balance used for direct payments verification</p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>Available Funds</span>
          <h2 style={{ fontSize: "2.2rem", fontWeight: "800", color: "var(--success)" }}>₹{walletBalance.toFixed(2)}</h2>
        </div>
      </section>

      {/* Orders section */}
      <section className="glass-card">
        <div style={{ marginBottom: "1.5rem" }}>
          <h2>Order History</h2>
          <p>Trace and monitor finalized order logs recorded by order-service</p>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#9ca3af" }}>
            <Package size={48} style={{ color: "#4b5563", marginBottom: "1rem" }} />
            <p style={{ fontSize: "1.1rem" }}>No orders placed yet.</p>
            <p className="text-sm">Add approved products to your Cart and finalize payments to see them here.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--card-border)", color: "#9ca3af" }}>
                  <th style={{ padding: "0.75rem" }}>Order ID</th>
                  <th style={{ padding: "0.75rem" }}>Date & Time</th>
                  <th style={{ padding: "0.75rem" }}>Delivery Address</th>
                  <th style={{ padding: "0.75rem" }}>Total Paid</th>
                  <th style={{ padding: "0.75rem", textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const dateStr = order.createdAt 
                    ? new Date(order.createdAt).toLocaleString() 
                    : "Recently Placed";
                  
                  return (
                    <tr key={order.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "0.75rem" }}>
                        <span className="badge badge-info">#{order.id}</span>
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <span className="flex-gap-sm text-sm" style={{ color: "#d1d5db" }}>
                          <Clock size={14} />
                          {dateStr}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem" }}>{order.address}</td>
                      <td style={{ padding: "0.75rem", fontWeight: "700", color: "#fff" }}>
                        ₹{order.totalAmount?.toFixed(2)}
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>
                        <span className={`badge ${
                          order.status === "DELIVERED" || order.status === "CONFIRMED"
                            ? "badge-success"
                            : order.status === "PENDING"
                            ? "badge-warning"
                            : "badge-danger"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Ledger explanation note */}
      <section className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <h3>Immutable Ledger Verification</h3>
        <p className="text-sm">
          For auditing safety, each payment debit writes consecutive rows to the `ledger_entry` schema (with columns: `intent_id`, `user_email`, `type`, `amount`, `balance_after`). 
          Double-entry ledger status is maintained programmatically by the Spring Boot payment-service database cluster.
        </p>
      </section>
    </div>
  );
}

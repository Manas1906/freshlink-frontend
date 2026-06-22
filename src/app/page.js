"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { 
  Activity, ShoppingBag, PlusCircle, LayoutDashboard, 
  ArrowRight, ShieldCheck, Zap, Server, RefreshCw
} from "lucide-react";

export default function Home() {
  const { role, fullName, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  // Local Microservices Status Tracking
  const [services, setServices] = useState([
    { name: "Authentication Service (auth-service)", port: 8080, path: "/backend/auth/register", status: "checking" },
    { name: "User Profile Service (user-service)", port: 8081, path: "/backend/user/me", status: "checking" },
    { name: "Product Inventory Service (product-service)", port: 8082, path: "/backend/products", status: "checking" },
    { name: "Order Management Service (order-service)", port: 8083, path: "/backend/orders/me", status: "checking" },
    { name: "Shopping Cart Service (cart-service)", port: 8084, path: "/backend/cart/me", status: "checking" },
    { name: "Checkout Service (checkout-service)", port: 8085, path: "/backend/checkout/1", status: "checking" },
    { name: "Payments Gateway Service (payment-service)", port: 8086, path: "/backend/payments/pay", status: "checking" },
  ]);

  const checkHealth = async () => {
    setLoading(true);
    const updated = await Promise.all(
      services.map(async (service) => {
        try {
          const res = await fetch(service.path, {
            method: service.name.includes("Payments") || service.name.includes("Authentication") ? "POST" : "GET",
            headers: { "Content-Type": "application/json" }
          });
          if (res.status) {
            return { ...service, status: "online" };
          }
        } catch (e) {}
        return { ...service, status: "offline" };
      })
    );
    setServices(updated);
    setLoading(false);
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      {/* Hero Welcome Banner */}
      <section className="glass-card" style={{
        padding: "3rem 2rem",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.25rem",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          top: "-50%",
          left: "-20%",
          width: "60%",
          height: "200%",
          background: "linear-gradient(90deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0) 100%)",
          transform: "rotate(-15deg)",
          pointerEvents: "none"
        }} />
        
        <span className="badge badge-info" style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}>
          Next-Gen Microservices Architecture
        </span>
        
        <h2 style={{ fontSize: "2.5rem", lineHeight: "1.2", maxWidth: "800px" }}>
          The Future of Direct Farm-to-Table Trade & Secure Payments
        </h2>
        
        <p style={{ fontSize: "1.1rem", maxWidth: "600px" }}>
          FreshLink connects local farmers directly with customers, powered by a robust distributed cluster of Spring Boot microservices and automated wallet ledgers.
        </p>

        {isAuthenticated ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
            <p style={{ color: "#fff", fontWeight: "700" }}>Welcome back, {fullName}!</p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              {role === "CUSTOMER" && (
                <Link href="/products" className="btn btn-primary" style={{ width: "auto", textDecoration: "none" }}>
                  Shop Fresh Catalog <ArrowRight size={16} />
                </Link>
              )}
              {role === "FARMER" && (
                <Link href="/products/create" className="btn btn-primary" style={{ width: "auto", textDecoration: "none" }}>
                  Farmer Inventory Dashboard <ArrowRight size={16} />
                </Link>
              )}
              {role === "ADMIN" && (
                <Link href="/admin/dashboard" className="btn btn-primary" style={{ width: "auto", textDecoration: "none" }}>
                  Admin Review Dashboard <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
            <Link href="/auth/login" className="btn btn-primary" style={{ width: "auto", textDecoration: "none" }}>
              Sign In to Your Account <ArrowRight size={16} />
            </Link>
            <Link href="/auth/register" className="btn btn-secondary" style={{ width: "auto", textDecoration: "none" }}>
              Register Account
            </Link>
          </div>
        )}
      </section>

      {/* Core Platform Pillars */}
      <section className="grid-3">
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ background: "rgba(99, 102, 241, 0.15)", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap style={{ color: "var(--primary)" }} size={20} />
          </div>
          <h3>Reactive Broker System</h3>
          <p>Utilizes Spring Cloud Kafka integration to sync checkout inventories and trigger instant ledger updates asynchronously.</p>
        </div>

        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.15)", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck style={{ color: "var(--success)" }} size={20} />
          </div>
          <h3>Double-Entry Ledgers</h3>
          <p>All wallet activities write immutable credit/debit records directly into the payments schema to guarantee zero transactional drift.</p>
        </div>

        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ background: "rgba(14, 165, 233, 0.15)", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Server style={{ color: "var(--info)" }} size={20} />
          </div>
          <h3>Service Redundancy</h3>
          <p>Independent security bounds, token parsing guards, and method-level access controls protect each microservice endpoint.</p>
        </div>
      </section>

      {/* Connection Monitor */}
      <section className="glass-card">
        <div className="flex-between mb-2">
          <div>
            <h2>Local Microservices Cluster Health</h2>
            <p className="text-sm">Verifies active listeners across configured localhost port boundaries.</p>
          </div>
          <button 
            onClick={checkHealth} 
            className="btn btn-secondary flex-gap-sm" 
            style={{ width: "auto" }}
            disabled={loading}
          >
            <RefreshCw className={loading ? "animate-spin" : ""} size={14} /> 
            {loading ? "Scanning..." : "Ping Port Services"}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
          {services.map((service, idx) => (
            <div key={idx} className="service-pill">
              <div className="flex-gap-md">
                <span className="badge badge-info" style={{ minWidth: "85px", textAlign: "center" }}>Port {service.port}</span>
                <h3 style={{ color: "#fff", fontSize: "0.95rem" }}>{service.name}</h3>
              </div>
              <span className={`badge ${service.status === "online" ? "badge-success" : service.status === "checking" ? "badge-warning" : "badge-danger"}`}>
                {service.status === "online" ? "Online" : service.status === "checking" ? "Checking" : "Offline"}
              </span>
            </div>
          ))}
        </div>
      </section>
      
      <style jsx global>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

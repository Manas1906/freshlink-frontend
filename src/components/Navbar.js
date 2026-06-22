"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { 
  ShoppingBag, ShoppingCart, Activity, ShieldCheck, 
  Package, PlusCircle, LayoutDashboard, LogOut, User, Menu, X
} from "lucide-react";
import { api } from "../lib/api";

export default function Navbar() {
  const { token, fullName, role, email, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [systemOnline, setSystemOnline] = useState("checking");
  const [cartCount, setCartCount] = useState(0);

  // Monitor microservices health (ping auth service at 8080)
  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const res = await fetch("/backend/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });
        if (res.status) {
          setSystemOnline("online");
          return;
        }
      } catch (e) {}
      setSystemOnline("offline");
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  // Monitor cart item counts dynamically
  useEffect(() => {
    if (!isAuthenticated || role !== "CUSTOMER") {
      setCartCount(0);
      return;
    }

    const fetchCartCount = async () => {
      try {
        const cart = await api.get("/backend/cart/me");
        if (cart && cart.items) {
          const totalQty = cart.items.reduce((acc, item) => acc + item.quantity, 0);
          setCartCount(totalQty);
        }
      } catch (e) {
        console.warn("Error reading cart count:", e);
      }
    };

    fetchCartCount();
    // Refresh cart count periodically or let individual actions trigger it
    const interval = setInterval(fetchCartCount, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, role, pathname]);

  const navLinks = [
    { name: "Catalog", href: "/products", roles: ["CUSTOMER", "FARMER", "ADMIN"], icon: <ShoppingBag size={16} /> },
    { name: "My Cart", href: "/cart", roles: ["CUSTOMER"], icon: <ShoppingCart size={16} />, badge: cartCount },
    { name: "Payments", href: "/payment", roles: ["CUSTOMER"], icon: <Activity size={16} /> },
    { name: "My Orders", href: "/orders", roles: ["CUSTOMER"], icon: <Package size={16} /> },
    { name: "Submit Product", href: "/products/create", roles: ["FARMER"], icon: <PlusCircle size={16} /> },
    { name: "Review Panel", href: "/admin/dashboard", roles: ["ADMIN"], icon: <LayoutDashboard size={16} /> },
  ];

  const visibleLinks = navLinks.filter(
    (link) => !link.roles || (isAuthenticated && link.roles.includes(role))
  );

  return (
    <nav className="glass-card" style={{
      marginBottom: "2rem",
      borderRadius: "16px",
      padding: "0.75rem 1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem"
    }}>
      <div className="flex-between">
        {/* Logo Branding */}
        <Link href="/" className="flex-gap-md" style={{ textDecoration: "none" }}>
          <h1 style={{ fontSize: "1.6rem", margin: 0, cursor: "pointer" }}>FreshLink</h1>
          <div className="flex-gap-sm text-sm" style={{ background: "rgba(255,255,255,0.03)", padding: "0.25rem 0.6rem", borderRadius: "20px", border: "1px solid var(--card-border)" }}>
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: systemOnline === "online" ? "var(--success)" : systemOnline === "checking" ? "var(--warning)" : "var(--danger)",
              display: "inline-block"
            }}></span>
            <span style={{ color: "#9ca3af" }}>
              {systemOnline === "online" ? "Services Online" : systemOnline === "checking" ? "Verifying..." : "Services Offline"}
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="flex-gap-md" style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <Link href="/" className={`tab-btn ${pathname === "/" ? "active" : ""}`} style={{ textDecoration: "none" }}>
              Home
            </Link>
            {visibleLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`tab-btn ${pathname === link.href ? "active" : ""}`}
                style={{ textDecoration: "none", position: "relative" }}
              >
                <span className="flex-gap-sm">
                  {link.icon}
                  {link.name}
                </span>
                {link.badge > 0 && (
                  <span style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    background: "var(--danger)",
                    color: "#fff",
                    borderRadius: "50%",
                    fontSize: "0.7rem",
                    padding: "1px 6px",
                    fontWeight: "800"
                  }}>{link.badge}</span>
                )}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div style={{ borderLeft: "1px solid var(--card-border)", paddingLeft: "1rem", display: "flex", alignItems: "center" }}>
            {isAuthenticated ? (
              <div className="flex-gap-md">
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#fff", fontWeight: "700", fontSize: "0.9rem" }}>{fullName}</div>
                  <div className="text-sm" style={{ color: "#9ca3af", display: "flex", gap: "0.25rem", justifyContent: "flex-end" }}>
                    <span className="badge badge-info" style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem" }}>{role}</span>
                  </div>
                </div>
                <button onClick={logout} className="btn btn-secondary" style={{ padding: "0.5rem", width: "auto" }}>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="btn btn-primary" style={{ width: "auto", textDecoration: "none" }}>
                <User size={16} /> Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

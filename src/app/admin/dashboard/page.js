"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../components/Toast";
import { api } from "../../../lib/api";
import { Loader2, Check, X, ShieldAlert, AlertTriangle } from "lucide-react";

export default function AdminDashboardPage() {
  const { role, isAuthenticated, loading: authLoading } = useAuth();
  const { showSuccess, showDanger, showWarning } = useToast();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || role !== "ADMIN")) {
      showWarning("Access restricted. This page is only for registered ADMINS.");
      router.push("/");
    }
  }, [isAuthenticated, role, authLoading]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const list = await api.get("/backend/products");
      setProducts(Array.isArray(list) ? list : []);
    } catch (e) {
      showDanger("Could not retrieve products. Verify product-service is online.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && role === "ADMIN") {
      fetchProducts();
    }
  }, [isAuthenticated, role]);

  const handleApproveProduct = async (id) => {
    setActioningId(id);
    try {
      await api.put(`/backend/products/approve/${id}`);
      showSuccess(`Product ${id} has been approved and catalog listing activated.`);
      fetchProducts();
    } catch (err) {
      showDanger(err.message || "Failed to approve product.");
    } finally {
      setActioningId(null);
    }
  };

  const handleRejectProduct = async (id) => {
    setActioningId(id);
    try {
      await api.put(`/backend/products/reject/${id}`);
      showSuccess(`Product ${id} has been rejected.`);
      fetchProducts();
    } catch (err) {
      showDanger(err.message || "Failed to reject product.");
    } finally {
      setActioningId(null);
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (role !== "ADMIN") {
    return (
      <div className="glass-card" style={{ maxWidth: "500px", margin: "3rem auto", textAlign: "center", padding: "2rem" }}>
        <ShieldAlert size={48} style={{ color: "var(--danger)", marginBottom: "1rem" }} />
        <h2>Access Forbidden</h2>
        <p>You must login as an Admin to approve/reject product submissions.</p>
      </div>
    );
  }

  const pendingProducts = products.filter((p) => p.status === "PENDING");

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2>Product Review Dashboard (Admin Portal)</h2>
        <p>Authorize or reject newly submitted catalog items</p>
      </div>

      <div className="glass-card">
        <h3>Pending Approval Requests ({pendingProducts.length})</h3>
        
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : pendingProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
            <p>All listings are reviewed. There are no pending product approvals.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto", marginTop: "1rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--card-border)", color: "#9ca3af" }}>
                  <th style={{ padding: "0.75rem" }}>ID</th>
                  <th style={{ padding: "0.75rem" }}>Product Name</th>
                  <th style={{ padding: "0.75rem" }}>Price</th>
                  <th style={{ padding: "0.75rem" }}>Stock</th>
                  <th style={{ padding: "0.75rem" }}>Farmer (Email)</th>
                  <th style={{ padding: "0.75rem" }}>Status</th>
                  <th style={{ padding: "0.75rem", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingProducts.map((prod) => (
                  <tr key={prod.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "0.75rem" }}>{prod.id}</td>
                    <td style={{ padding: "0.75rem", fontWeight: "700", color: "#fff" }}>{prod.name}</td>
                    <td style={{ padding: "0.75rem" }}>₹{prod.price.toFixed(2)}</td>
                    <td style={{ padding: "0.75rem" }}>{prod.stock}</td>
                    <td style={{ padding: "0.75rem" }}>{prod.createdBy}</td>
                    <td style={{ padding: "0.75rem" }}>
                      <span className="badge badge-warning">{prod.status}</span>
                    </td>
                    <td style={{ padding: "0.75rem", display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                      <button 
                        onClick={() => handleApproveProduct(prod.id)} 
                        className="btn btn-success" 
                        style={{ padding: "0.4rem 0.8rem", width: "auto" }}
                        disabled={actioningId !== null}
                      >
                        {actioningId === prod.id ? <Loader2 className="animate-spin" size={14} /> : <span className="flex-gap-sm"><Check size={14} /> Approve</span>}
                      </button>
                      <button 
                        onClick={() => handleRejectProduct(prod.id)} 
                        className="btn btn-danger" 
                        style={{ padding: "0.4rem 0.8rem", width: "auto" }}
                        disabled={actioningId !== null}
                      >
                        {actioningId === prod.id ? <Loader2 className="animate-spin" size={14} /> : <span className="flex-gap-sm"><X size={14} /> Reject</span>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

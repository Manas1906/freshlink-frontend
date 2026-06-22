"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../components/Toast";
import { api } from "../../../lib/api";
import { Loader2, PlusCircle, AlertTriangle } from "lucide-react";

export default function CreateProductPage() {
  const { role, isAuthenticated, loading: authLoading } = useAuth();
  const { showSuccess, showDanger, showWarning } = useToast();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || role !== "FARMER")) {
      showWarning("Access restricted. This page is only for registered FARMERS.");
      router.push("/");
    }
  }, [isAuthenticated, role, authLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/backend/products", {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
      });

      showSuccess("Product submitted successfully! Pending Admin approval.");
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
    } catch (err) {
      showDanger(err.message || "Failed to submit product.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (role !== "FARMER") {
    return (
      <div className="glass-card" style={{ maxWidth: "500px", margin: "3rem auto", textAlign: "center", padding: "2rem" }}>
        <AlertTriangle size={48} style={{ color: "var(--danger)", marginBottom: "1rem" }} />
        <h2>Access Forbidden</h2>
        <p>You must login as a Farmer to register new agricultural goods.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
      <div className="glass-card">
        <div style={{ marginBottom: "1.5rem" }}>
          <h2>Submit New Product (Farmer Portal)</h2>
          <p>Register fresh organic goods for Admin verification and catalog listing</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="form-group">
            <label>Product Name</label>
            <input 
              type="text" 
              placeholder="Fresh Organic Mangoes" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              placeholder="Sweet and juicy Alphonsos directly from local orchards" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={3}
              required 
            />
          </div>

          <div className="grid-2" style={{ gap: "1rem", margin: 0 }}>
            <div className="form-group">
              <label>Price (INR / kg or unit)</label>
              <input 
                type="number" 
                step="0.01" 
                placeholder="150.00" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Available Stock</label>
              <input 
                type="number" 
                placeholder="100" 
                value={stock} 
                onChange={(e) => setStock(e.target.value)} 
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-2" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" size={16} /> : <span className="flex-gap-sm"><PlusCircle size={16} /> Submit Product Listing</span>}
          </button>
        </form>
      </div>
    </div>
  );
}

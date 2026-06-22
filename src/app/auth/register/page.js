"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../components/Toast";
import { Loader2, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const { showSuccess, showDanger } = useToast();
  const router = useRouter();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(fullName, email, password, role);
      showSuccess(`Account created successfully! Welcome, ${user.fullName}.`);
      
      // Dynamic routing based on account profile role
      if (user.role === "FARMER") {
        router.push("/products/create");
      } else if (user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/products");
      }
    } catch (err) {
      showDanger(err.message || "Registration failed. Email might already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "450px", margin: "3rem auto" }}>
      <div className="glass-card">
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h2>Create Account</h2>
          <p>Join the FreshLink supply chain marketplace</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              placeholder="Alice Smith" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="alice@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Select Profile Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="CUSTOMER">CUSTOMER (Buy Products)</option>
              <option value="FARMER">FARMER (Submit Products)</option>
              <option value="ADMIN">ADMIN (Approve Products)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={16} /> : <span className="flex-gap-sm"><UserPlus size={16} /> Create Account</span>}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
          <p>Already have an account? <Link href="/auth/login" style={{ color: "var(--primary)", fontWeight: "700" }}>Login Here</Link></p>
        </div>
      </div>
    </div>
  );
}

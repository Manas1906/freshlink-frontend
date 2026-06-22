"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../components/Toast";
import { Loader2, LogIn } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const { showSuccess, showDanger } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      showSuccess(`Welcome back, ${user.fullName}!`);
      
      // Dynamic routing based on account profile role
      if (user.role === "FARMER") {
        router.push("/products/create");
      } else if (user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/products");
      }
    } catch (err) {
      showDanger(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "450px", margin: "3rem auto" }}>
      <div className="glass-card">
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h2>Access Your Portal</h2>
          <p>Login to connect to your FreshLink dashboard</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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

          <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={16} /> : <span className="flex-gap-sm"><LogIn size={16} /> Sign In</span>}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
          <p>Don't have an account? <Link href="/auth/register" style={{ color: "var(--primary)", fontWeight: "700" }}>Register Here</Link></p>
        </div>
      </div>
    </div>
  );
}

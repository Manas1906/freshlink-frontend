"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { api } from "../../lib/api";
import { ShoppingCart, AlertCircle, ShoppingBag, Loader2 } from "lucide-react";

export default function CatalogPage() {
  const { token, role, isAuthenticated } = useAuth();
  const { showSuccess, showDanger, showWarning } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const list = await api.get("/backend/products");
      // Fallback if list is not an array (e.g. backend offline or empty)
      setProducts(Array.isArray(list) ? list : []);
    } catch (e) {
      showDanger("Could not fetch product catalog. Verify product-service is online.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCart = async (product, qty) => {
    if (!isAuthenticated) {
      showWarning("Please sign in to buy groceries!");
      return;
    }
    if (role !== "CUSTOMER") {
      showWarning("Only CUSTOMER accounts can add items to the cart.");
      return;
    }

    try {
      await api.post("/backend/cart/add", {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: parseInt(qty)
      });
      showSuccess(`Successfully added ${qty}x ${product.name} to your Cart!`);
    } catch (err) {
      showDanger(err.message || "Failed to add product to Cart.");
    }
  };

  const approvedProducts = products.filter(p => p.status === "APPROVED");

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2>Approved Groceries Catalog</h2>
        <p>Direct organic supplies verified by FreshLink Admins</p>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : approvedProducts.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "4rem" }}>
          <ShoppingBag size={48} style={{ color: "#4b5563", marginBottom: "1rem" }} />
          <p>No products are currently approved in the catalog.</p>
          <p className="text-sm">Farmers must submit new items and Admins must review/approve them first!</p>
        </div>
      ) : (
        <div className="grid-3">
          {approvedProducts.map((prod) => {
            return (
              <ProductCard 
                key={prod.id} 
                product={prod} 
                role={role} 
                onAdd={handleAddToCart} 
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// Inner helper component to manage individual quantity inputs cleanly
function ProductCard({ product, role, onAdd }) {
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const handleAddClick = async () => {
    setSubmitting(true);
    await onAdd(product, quantity);
    setSubmitting(false);
  };

  return (
    <div className="glass-card product-card flex-between">
      <div style={{ width: "100%" }}>
        <div className="flex-between mb-1">
          <span className="badge badge-success">Approved</span>
          <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Stock: {product.stock}</span>
        </div>
        <h3 style={{ fontSize: "1.25rem", margin: "0.25rem 0", color: "#fff" }}>{product.name}</h3>
        <p className="text-sm mb-2">{product.description}</p>
      </div>

      <div className="mt-2" style={{ width: "100%" }}>
        <div className="flex-between mb-2">
          <span className="product-price">₹{product.price.toFixed(2)}</span>
          {role === "CUSTOMER" && (
            <input 
              type="number" 
              min="1" 
              max={product.stock} 
              value={quantity} 
              onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
              style={{ width: "70px", padding: "0.4rem", textAlign: "center" }} 
            />
          )}
        </div>

        {role === "CUSTOMER" ? (
          <button onClick={handleAddClick} className="btn btn-primary" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" size={16} /> : <span className="flex-gap-sm"><ShoppingCart size={16} /> Add to Cart</span>}
          </button>
        ) : role ? (
          <p className="text-sm" style={{ textAlign: "center", color: "#9ca3af", padding: "0.5rem 0" }}>
            Account type ({role}) cannot buy
          </p>
        ) : (
          <p className="text-sm" style={{ textAlign: "center", color: "#9ca3af", padding: "0.5rem 0" }}>
            Sign in as CUSTOMER to buy
          </p>
        )}
      </div>
    </div>
  );
}

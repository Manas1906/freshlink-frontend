import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../components/Toast";
import Navbar from "../components/Navbar";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "FreshLink Test Portal",
  description: "Enterprise Microservices Checkout & Payments Verification Portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <div className="bg-glow-top"></div>
        <div className="bg-glow-bottom"></div>
        <AuthProvider>
          <ToastProvider>
            <div className="glass-container">
              <Navbar />
              {children}
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/backend/auth/:path*',
        destination: 'http://localhost:8080/api/auth/:path*',
      },
      {
        source: '/backend/user/:path*',
        destination: 'http://localhost:8081/api/user/:path*',
      },
      {
        source: '/backend/products/:path*',
        destination: 'http://localhost:8082/api/products/:path*',
      },
      {
        source: '/backend/orders/:path*',
        destination: 'http://localhost:8083/api/orders/:path*',
      },
      {
        source: '/backend/cart/:path*',
        destination: 'http://localhost:8084/api/cart/:path*',
      },
      {
        source: '/backend/checkout/:path*',
        destination: 'http://localhost:8085/api/checkout/:path*',
      },
      {
        source: '/backend/payments/:path*',
        destination: 'http://localhost:8086/api/payments/:path*',
      },
      {
        source: '/backend/wallet/:path*',
        destination: 'http://localhost:8086/api/wallet/:path*',
      },
    ];
  },
};

export default nextConfig;

// Centralized API Client for FreshLink Microservices

const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};

const handleResponse = async (res) => {
  if (!res.ok) {
    let errMsg = "An error occurred";
    try {
      const data = await res.json();
      errMsg = data.message || data.error || errMsg;
    } catch (e) {
      try {
        const text = await res.text();
        if (text) errMsg = text;
      } catch (err) {}
    }
    throw new Error(errMsg);
  }

  // Handle empty responses or plain string responses
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  
  return res.text();
};

export const api = {
  get: async (url) => {
    const res = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  post: async (url, body) => {
    const res = await fetch(url, {
      method: "POST",
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(res);
  },

  put: async (url, body) => {
    const res = await fetch(url, {
      method: "PUT",
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(res);
  },

  delete: async (url) => {
    const res = await fetch(url, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
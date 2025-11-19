const API_URL = "http://localhost:8000";

// Token management functions
const setAuthToken = (token) => {
  localStorage.setItem("token", token);
};

const getAuthToken = () => {
  return localStorage.getItem("token");
};

const removeAuthToken = () => {
  localStorage.removeItem("token");
};

// Helper functions for authenticated requests
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    alert("Session expired. Please login again.");
    removeAuthToken();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  return response;
};

// Login function
window.login = async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_URL}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Login successful:", data);
      setAuthToken(data.token);
      showSuccess("Login successful!");
      window.location.href = "/dashboard";
    } else {
      console.error("Login failed:", data);
      showError(data.error || "Login failed");
    }
  } catch (error) {
    console.error("Error:", error);
    showError("An error occurred during login");
  }
};

// Signup function
window.signup = async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (password !== confirmPassword) {
    showError("Passwords do not match");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/user/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstname: name,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showSuccess("Signup successful! Please login.");
      window.location.href = "/login";
    } else {
      showError(data.error || "Signup failed");
    }
  } catch (error) {
    console.error("Signup Error:", error);
    showError("An error occurred during signup");
  }
};

// Logout function
window.logout = () => {
  if (confirm("Are you sure you want to logout?")) {
    removeAuthToken();
    window.location.href = "/login";
  }
};

// Shorten URL function
window.shortenURL = async (event) => {
  event.preventDefault();

  const form = event.target;
  const urlInput = form.querySelector('input[type="url"]');
  const codeInput = form.querySelector('input[type="text"]');

  const url = urlInput.value.trim();
  const code = codeInput.value.trim();

  if (!url) {
    showError("Please enter a URL");
    return;
  }

  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/shorten`, {
      method: "POST",
      body: JSON.stringify({
        url,
        code: code || undefined,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showSuccess("URL shortened successfully!");
      form.reset();
      loadUserURLs();
    } else {
      showError(data.error || "Failed to shorten URL");
    }
  } catch (error) {
    console.error("Error shortening URL:", error);
    showError("An error occurred while shortening URL");
  }
};

// Load user URLs
window.loadUserURLs = async () => {
  const tbody = document.querySelector(".urls-table tbody");
  if (!tbody) return;

  try {
    tbody.innerHTML =
      '<tr><td colspan="4" style="text-align: center; color: #64748b;">Loading...</td></tr>';

    const response = await makeAuthenticatedRequest(`${API_URL}/codes`);
    const data = await response.json();

    if (response.ok && data.codes) {
      displayURLs(data.codes);
    } else {
      tbody.innerHTML =
        '<tr><td colspan="4" style="text-align: center; color: #64748b;">Failed to load URLs</td></tr>';
    }
  } catch (error) {
    console.error("Error loading URLs:", error);
    tbody.innerHTML =
      '<tr><td colspan="4" style="text-align: center; color: #64748b;">Error loading URLs</td></tr>';
  }
};

// Display URLs in table
const displayURLs = (urls) => {
  const tbody = document.querySelector(".urls-table tbody");
  if (!tbody) return;

  if (urls.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" style="text-align: center; color: #64748b; padding: 2rem;">No URLs yet. Create your first one!</td></tr>';
    return;
  }

  tbody.innerHTML = urls
    .map(
      (url) => `
    <tr>
      <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${
        url.targetURL
      }">
        ${url.targetURL}
      </td>
      <td>
        <a href="${API_URL}/${
        url.shortCode
      }" class="shortened-url" target="_blank">
          ${window.location.origin}/${url.shortCode}
        </a>
        <button class="copy-btn" onclick="copyToClipboard('${
          window.location.origin
        }/${url.shortCode}', this)">Copy</button>
      </td>
      <td>${formatDate(url.createdAt)}</td>
      <td>
        <button class="btn btn-delete" onclick="deleteURL('${
          url.id
        }')">Delete</button>
      </td>
    </tr>
  `
    )
    .join("");
};

// Copy to clipboard
window.copyToClipboard = async (text, button) => {
  try {
    await navigator.clipboard.writeText(text);
    const originalText = button.textContent;
    button.textContent = "Copied!";
    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  } catch (error) {
    console.error("Failed to copy:", error);
    showError("Failed to copy to clipboard");
  }
};

// Delete URL
window.deleteURL = async (id) => {
  if (!confirm("Are you sure you want to delete this URL?")) return;

  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      showSuccess("URL deleted successfully!");
      loadUserURLs();
    } else {
      const data = await response.json();
      showError(data.error || "Failed to delete URL");
    }
  } catch (error) {
    console.error("Error deleting URL:", error);
    showError("An error occurred while deleting URL");
  }
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return "Unknown";

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};

// Error display functions
const showError = (message) => {
  alert(`Error: ${message}`);
};

const showSuccess = (message) => {
  alert(message);
};

// Check authentication status
const isAuthenticated = () => {
  return !!getAuthToken();
};

// Protect routes that require authentication
const protectRoute = () => {
  if (!isAuthenticated()) {
    window.location.href = "/login";
  }
};

// Auto-initialize based on current page
document.addEventListener("DOMContentLoaded", () => {
  // Protect dashboard route
  if (window.location.pathname === "/dashboard") {
    protectRoute();
    loadUserURLs();
  }
});

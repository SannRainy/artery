import api from './api';

// Fungsi login dengan penanganan error yang rinci
export const login = async (email, password) => {
  try {
    const response = await api.post('/users/login', { email, password });

    if (response.data.token) {
      console.log("Received token:", response.data.token); // Debug token
      localStorage.setItem('token', response.data.token);
      // Set token ke header default axios agar tidak perlu di-set ulang tiap request
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Login error response:", error.response);
      const errorMessage = error.response.data.message || error.response.statusText || 'Something went wrong!';
      throw new Error(`Login failed: ${errorMessage}`);
    } else if (error.request) {
      console.error("Login no response:", error.request);
      throw new Error('No response from server. Please try again later.');
    } else {
      console.error("Login error message:", error.message);
      throw new Error('An unknown error occurred during login. Please try again later.');
    }
  }
};

// Fungsi registrasi user
export const register = async (username, email, password) => {
  try {
    const response = await api.post('/users/register', { username, email, password });

    console.log("Register response:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Registration error response:", error.response);
      const message = error.response.data?.message || error.response.statusText || 'Something went wrong!';
      throw new Error(`Registration failed: ${message}`);
    } else if (error.request) {
      console.error("Registration no response:", error.request);
      throw new Error('No response from server. Please try again later.');
    } else {
      console.error("Registration error message:", error.message);
      throw new Error('An unknown error occurred during registration. Please try again later.');
    }
  }
};

// Fungsi untuk mendapatkan data user yang sedang login
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No token found in localStorage');
      return null; // Tidak ada token, berarti belum login
    }

    // Set header Authorization secara eksplisit agar dipakai tiap request
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch current user:", error.response?.data || error.message || error);
    return null; // Kembalikan null jika gagal mengambil data user
  }
};

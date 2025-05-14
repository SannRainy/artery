import api from './api';

export const login = async (email, password) => {
  try {
    const response = await api.post('/users/login', { email, password });

    if (response.data.token) {
      console.log("Received token:", response.data.token); // Log token untuk debugging
      localStorage.setItem('token', response.data.token);  // Simpan token
    }

    return response.data;
  } catch (error) {
    // Menangani error dengan informasi lebih rinci
    if (error.response) {
      // Jika server merespons dengan status code selain 2xx
      console.error("Login error response:", error.response);
      const errorMessage = error.response.data.message || error.response.statusText || 'Something went wrong!';
      throw new Error(`Login failed: ${errorMessage}`);
    } else if (error.request) {
      // Tidak ada respons dari server
      console.error("Login no response:", error.request);
      throw new Error('No response from server. Please try again later.');
    } else {
      // Kesalahan lain yang terjadi di client-side
      console.error("Login error message:", error.message);
      throw new Error('An unknown error occurred during login. Please try again later.');
    }
  }
};


export const register = async (username, email, password) => {
  try {
    const response = await api.post('/users/register', { username, email, password });

    console.log("Register response:", response.data); // <== Tambahkan ini
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

export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token'); // Ambil token dari localStorage

    if (token) {
      api.defaults.headers['Authorization'] = `Bearer ${token}`;  // Set header authorization
    }

    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    // Menangani error saat mengambil data pengguna
    console.error("Failed to fetch current user", error);
    return null;  // Kembalikan null jika terjadi kesalahan
  }
};

export const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    console.error('API Error Response:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    });
    return error.response.data?.message || `API Error: ${error.response.status}`;
  } else if (error.request) {
    // The request was made but no response was received
    console.error('API Request Error:', error.request);
    return 'Network Error - Please check your internet connection';
  } else {
    // Something happened in setting up the request
    console.error('API Setup Error:', error.message);
    return 'Request Error - Please try again';
  }
};
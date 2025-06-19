export const handleApiError = (error) => {
  if (error.response) {

    console.error('API Error Response:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    });
    return error.response.data?.message || `API Error: ${error.response.status}`;
  } else if (error.request) {

    console.error('API Request Error:', error.request);
    return 'Network Error - Please check your internet connection';
  } else {

    console.error('API Setup Error:', error.message);
    return 'Request Error - Please try again';
  }
};
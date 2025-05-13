import axios from 'axios'

const apiUrl = 'http://localhost:3000'  // Change this to your backend API URL

export default async function handler(req, res) {
  try {
    // Forwarding the request to the backend API
    const { method, body, headers } = req

    // Create a configuration object for the API request
    const config = {
      method: method,  // Method (GET, POST, etc.)
      url: `${apiUrl}${req.url}`,  // Proxying the URL
      headers: {
        ...headers,  // Forward the headers (such as authorization)
        'Content-Type': 'application/json',
      },
      data: body,  // Send the request body
    }

    // Sending the request to the backend API
    const response = await axios(config)

    // Forward the response from the API back to the client
    res.status(response.status).json(response.data)
  } catch (error) {
    // Handle errors and send them to the client
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Something went wrong',
    })
  }
}

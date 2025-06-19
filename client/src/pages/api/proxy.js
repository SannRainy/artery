import axios from 'axios'

const apiUrl = 'http://localhost:3000'  

export default async function handler(req, res) {
  try {
    
    const { method, body, headers } = req

    
    const config = {
      method: method,  
      url: `${apiUrl}${req.url}`, 
      headers: {
        ...headers,  
        'Content-Type': 'application/json',
      },
      data: body,  
    }


    const response = await axios(config)


    res.status(response.status).json(response.data)
  } catch (error) {

    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Something went wrong',
    })
  }
}

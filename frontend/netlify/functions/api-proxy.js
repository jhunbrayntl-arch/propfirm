const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

exports.handler = async (event, context) => {
  // Only handle POST requests for API proxy
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'GET' && 
      event.httpMethod !== 'PUT' && event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const path = event.path.replace(/^\/.netlify\/functions\/api/, '/api');
  
  try {
    const config = {
      method: event.httpMethod,
      url: `${BACKEND_URL}${path}`,
      headers: {
        'Content-Type': 'application/json',
        ...(event.headers.authorization && { 
          Authorization: event.headers.authorization 
        }),
      },
    };

    if (event.body && event.httpMethod !== 'GET') {
      config.data = JSON.parse(event.body);
    }

    const response = await axios(config);

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('API Proxy Error:', error.message);
    
    return {
      statusCode: error.response?.status || 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Backend service unavailable',
        message: error.message,
      }),
    };
  }
};

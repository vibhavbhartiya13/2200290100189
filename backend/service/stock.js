const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 });  

const BASE_URL = 'http://20.244.56.144/evaluation-service';
const AUTH_URL = 'http://20.244.56.144/evaluation-service/auth'; 

const CLIENT_ID = "4406c785-d53a-4c25-bc53-68adc36bed2e";
const CLIENT_SECRET = "uVXyDxUSgttvMAKT";
const CLIENT_EMAIL = "vibhav.2226cse1104@kiet.edu";
const ROLL_NO = "2200290100189(2)";
const ACCESS_CODE = "SxVeja";
const NAME = "Vibhav Bhartiya";


async function getAccessToken() {
    try {
        
        const response = await axios.post(AUTH_URL, {

            "email": "vibhav.2226cse1104@kiet.edu",
            "name": "Vibhav  Bhartiya",
            "rollNo": "2200290100189(2)",
            "accessCode": "SxVeja",
            "clientID": "4406c785-d53a-4c25-bc53-68adc36bed2e",
            "clientSecret": "uVXyDxUSgttvMAKT"
        }
);

        console.log('Token received:', response.data);

        if (!response.data.access_token) {
            throw new Error('Token not found in response');
        }

        return response.data.access_token;  
    } catch (error) {
        console.error('Error fetching access token:', error.response?.data || error.message);
        throw new Error('Failed to fetch access token');
    }
}

async function fetchStockPrices(ticker, minutes) {
    const cacheKey = `stock-${ticker}-${minutes}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    try {
        const token = await getAccessToken();  
        console.log('Using token:', token); 

        const url = `${BASE_URL}/stocks/${ticker}?minutes=${minutes}`;
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

      
        console.log('Stock data received:', response.data);

        cache.set(cacheKey, response.data);
        return response.data;
    } catch (err) {
        console.error(`Error fetching stock prices for ${ticker}:`, err.response?.data || err.message);
        throw new Error('Failed to fetch stock data');
    }
}

module.exports = { fetchStockPrices };

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper
} from '@mui/material';

const BACKEND_URL = 'http://localhost:3000'; // Change to your backend URL

const getAverage = (data) => {
  const sum = data.reduce((acc, cur) => acc + cur.price, 0);
  const avg = +(sum / data.length).toFixed(2);
  return data.map(d => ({ ...d, average: avg }));
};

const StockPage = () => {
  const [minutes, setMinutes] = useState(10);
  const [data, setData] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/stocks/NVDA?minutes=${minutes}&aggregation=average`);
        console.log('API Response:', res.data);
  
        const rawData = res.data.priceHistory || [];
        const avg = +res.data.averageStockPrice?.toFixed(2) || 0;
  
        const fetchedData = rawData.map(d => ({
          time: new Date(d.lastUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: +d.price,
          average: avg,
        }));
  
        setData(fetchedData);
      } catch (err) {
        console.error('Error fetching stock data:', err);
      }
    };
  
    fetchStockData();
  }, [minutes]);
  

  

  return (
    <Box sx={{ p: 5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <img
          src="/apple-logo.png"
          alt="Apple Logo"
          style={{ width: 40, height: 40, marginRight: 10 }}
        />
        <Typography variant="h4">Apple</Typography>
      </Box>

      <FormControl sx={{ minWidth: 200, mb: 3 }}>
        <InputLabel id="time-frame-label">Time Frame</InputLabel>
        <Select
          labelId="time-frame-label"
          value={minutes}
          label="Time Frame"
          onChange={(e) => setMinutes(Number(e.target.value))}
        >
          <MenuItem value={5}>Last 5 minutes</MenuItem>
          <MenuItem value={10}>Last 10 minutes</MenuItem>
          <MenuItem value={30}>Last 30 minutes</MenuItem>
        </Select>
      </FormControl>
      <Button
    variant="contained"
    color="primary"
    onClick={() => navigate('/map')}
    sx={{ height: '56px' }} // match Select height
  >
    Go to Map
  </Button>

      <Paper elevation={3} sx={{ p: 2 }}>
        <LineChart
          width={800}
          height={400}
          data={data}
          margin={{ top: 10, right: 30, bottom: 5, left: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            label={{
              position: 'insideBottom',
              offset: -20,
              style: { textAnchor: 'middle' },
            }}
          />
          <YAxis
            label={{
              value: 'Price (USD)',
              angle: -90,
              position: 'insideLeft',
              offset: -10,
              style: { textAnchor: 'middle' }
            }}
          />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="price" stroke="#1976d2" dot={{ r: 4 }} />
          <Line type="monotone" dataKey="average" stroke="#f44336" strokeDasharray="5 5" />
        </LineChart>
      </Paper>
    </Box>
  );
};

export default StockPage;
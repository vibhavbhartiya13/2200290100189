import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Grid,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';

const STOCKS = ['NVDA', 'PYPL']; 

const Map = () => {
  const [minutes, setMinutes] = useState(50);
  const [correlationMatrix, setCorrelationMatrix] = useState({});
  const [hoveredCell, setHoveredCell] = useState(null);

  useEffect(() => {
    const fetchCorrelation = async () => {
      try {
        const url = new URL('http://localhost:3000/stockcorrelation');
        url.searchParams.append('minutes', minutes.toString());
        STOCKS.forEach((ticker) => url.searchParams.append('ticker', ticker));

        const res = await axios.get(url.toString());
        const matrix = {};

        for (const stock1 of STOCKS) {
          matrix[stock1] = {};
          for (const stock2 of STOCKS) {
            matrix[stock1][stock2] =
              stock1 === stock2 ? 1 : res.data.correlation;
          }
        }

        setCorrelationMatrix(matrix);
      } catch (err) {
        console.error('Error fetching correlation:', err);
      }
    };

    fetchCorrelation();
  }, [minutes]);

  const getColor = (value) => {
    if (value > 0.8) return '#4caf50';
    if (value > 0.5) return '#81c784';
    if (value > 0.2) return '#fff176';
    if (value > -0.2) return '#ffb74d';
    if (value > -0.5) return '#e57373';
    return '#f44336';
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Stock Correlation Heatmap
      </Typography>

      <FormControl sx={{ minWidth: 200, mb: 3 }}>
        <InputLabel id="minutes-label">Minutes</InputLabel>
        <Select
          labelId="minutes-label"
          value={minutes}
          label="Minutes"
          onChange={(e) => setMinutes(Number(e.target.value))}
        >
          <MenuItem value={10}>Last 10 minutes</MenuItem>
          <MenuItem value={30}>Last 30 minutes</MenuItem>
          <MenuItem value={50}>Last 50 minutes</MenuItem>
          <MenuItem value={60}>Last 60 minutes</MenuItem>
        </Select>
      </FormControl>

      <Grid container spacing={1} justifyContent="center">
        {STOCKS.map((rowStock) => (
          <Grid item key={rowStock}>
            <Typography align="center" variant="subtitle2">{rowStock}</Typography>
            {STOCKS.map((colStock) => {
              const corr = correlationMatrix?.[rowStock]?.[colStock];
              return (
                <Box
                  key={colStock}
                  onMouseEnter={() => setHoveredCell(`${rowStock}-${colStock}`)}
                  onMouseLeave={() => setHoveredCell(null)}
                  sx={{
                    width: 60,
                    height: 40,
                    backgroundColor: getColor(corr),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '4px 0',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    transform:
                      hoveredCell === `${rowStock}-${colStock}` ? 'scale(1.05)' : 'scale(1)',
                    boxShadow:
                      hoveredCell === `${rowStock}-${colStock}`
                        ? '0 0 10px rgba(0,0,0,0.3)'
                        : 'none',
                    borderRadius: 1,
                    cursor: 'pointer',
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    {corr !== undefined ? corr.toFixed(2) : '--'}
                  </Typography>
                </Box>
              );
            })}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Map;
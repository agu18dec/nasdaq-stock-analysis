import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { nasdaqTickers } from './nasdaqTickers';
import { downloadCSV } from './utils';

function App() {
  const [ticker, setTicker] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [initialAmount, setInitialAmount] = useState(10000);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setData(null);

    if (!ticker || !startDate || !endDate || !initialAmount) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3001/api/stock-data`, {
        params: { 
          ticker, 
          startDate, 
          endDate, 
          initialAmount 
        }
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response) {
        setError(`Failed to fetch data: ${error.response.data.error}`);
      } else if (error.request) {
        setError('No response received from the server. Please try again.');
      } else {
        setError(`Error: ${error.message}`);
      }
    }
  };

  const handleDownload = () => {
    if (data) {
      downloadCSV(data, `${ticker}_stock_analysis.csv`);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        NASDAQ Stock Analysis
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Stock Ticker</InputLabel>
          <Select
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            required
          >
            {nasdaqTickers.map((stock) => (
              <MenuItem key={stock.value} value={stock.value}>
                {stock.label} ({stock.value})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          fullWidth
          margin="normal"
          required
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          fullWidth
          margin="normal"
          required
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Initial Amount"
          type="number"
          value={initialAmount}
          onChange={(e) => setInitialAmount(Number(e.target.value))}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Analyze
        </Button>
      </Box>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {data && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Profit Analysis for {ticker}
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="dailyProfit" stroke="#8884d8" name="Daily Profit" />
              <Line type="monotone" dataKey="cumulativeProfit" stroke="#82ca9d" name="Cumulative Profit" />
            </LineChart>
          </ResponsiveContainer>
          <Button onClick={handleDownload} variant="contained" color="secondary" sx={{ mt: 2 }}>
            Download Excel Sheet
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default App;
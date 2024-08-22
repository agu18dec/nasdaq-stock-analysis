import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

function App() {
  const [ticker, setTicker] = useState('');
  const [timeFrame, setTimeFrame] = useState('1y');
  const [initialAmount, setInitialAmount] = useState(1000);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.get(`http://localhost:3001/api/stock-data`, {
        params: { ticker, timeFrame, initialAmount }
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again.');
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        NASDAQ Stock Analysis
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <TextField
          label="Stock Ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Time Frame"
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value)}
          fullWidth
          margin="normal"
          required
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
              <Line type="monotone" dataKey="profit" stroke="#8884d8" name="Daily Profit" />
              <Line type="monotone" dataKey="cumulativeProfit" stroke="#82ca9d" name="Cumulative Profit" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Container>
  );
}

export default App;
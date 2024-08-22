import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Select, MenuItem, FormControl, InputLabel, Grid } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { nasdaqTickers } from './nasdaqTickers';

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

  const handleDownloadCSV = () => {
    if (data) {
      const headers = Object.keys(data[0]).join(',');
      const csvData = data.map(row => Object.values(row).join(','));
      const csv = [headers, ...csvData].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${ticker}_stock_analysis.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        NASDAQ Stock Analysis
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
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
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Initial Amount"
              type="number"
              value={initialAmount}
              onChange={(e) => setInitialAmount(Number(e.target.value))}
              fullWidth
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
          </Grid>
          <Grid item xs={12} sm={6}>
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
          </Grid>
        </Grid>
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
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Daily Profit</Typography>
              <ResponsiveContainer width="100%" height={300}>
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
                </LineChart>
              </ResponsiveContainer>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Total Value Over Time</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={data}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="totalValue" stroke="#82ca9d" name="Total Value" />
                </LineChart>
              </ResponsiveContainer>
            </Grid>
          </Grid>
          <Button onClick={handleDownloadCSV} variant="contained" color="secondary" sx={{ mt: 2 }}>
            Download CSV
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default App;
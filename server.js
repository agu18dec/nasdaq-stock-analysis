const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

function calculateDailyProfits(timeSeriesData, initialAmount, startDate, endDate) {
  const dailyProfits = [];
  let availableFunds = initialAmount;
  let shares = 0;

  Object.entries(timeSeriesData)
    .filter(([date]) => date >= startDate && date <= endDate)
    .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))  // Sort dates in ascending order
    .forEach(([date, priceData], index) => {
      const openPrice = parseFloat(priceData['1. open']);
      const closePrice = parseFloat(priceData['4. close']);
      
      // Sell shares at open price (except for the first day)
      if (index >= 0) {
        availableFunds += shares * openPrice;
      }

      // Buy shares at open price
      shares = Math.floor(availableFunds / openPrice);
      const investment = shares * openPrice;
      availableFunds -= investment;

      // Calculate profit at close
      const endValue = shares * closePrice;
      const dailyProfit = endValue - investment;
      
      dailyProfits.push({
        date,
        openPrice: openPrice.toFixed(2),
        closePrice: closePrice.toFixed(2),
        shares,
        investment: investment.toFixed(2),
        endValue: endValue.toFixed(2),
        dailyProfit: dailyProfit.toFixed(2),
        availableFunds: availableFunds.toFixed(2),
        totalValue: (endValue + availableFunds).toFixed(2)
      });
    });

  return dailyProfits;
}

app.get('/', (req, res) => {
  res.send('NASDAQ Stock Analysis API is running');
});

app.get('/api/stock-data', async (req, res) => {
  const { ticker, startDate, endDate, initialAmount } = req.query;
  
  console.log('Received parameters:', { ticker, startDate, endDate, initialAmount });

  if (!ticker || !startDate || !endDate || !initialAmount) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const response = await axios.get(`https://www.alphavantage.co/query`, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: ticker,
        outputsize: 'full',
        apikey: 'RGQ1MLPXAYL2TDC4'  // Replace with your actual API key
      }
    });

    const timeSeriesData = response.data['Time Series (Daily)'];
    if (!timeSeriesData) {
      return res.status(404).json({ error: 'No data found for the given ticker' });
    }

    const dailyProfits = calculateDailyProfits(timeSeriesData, parseFloat(initialAmount), startDate, endDate);

    res.json(dailyProfits);
  } catch (error) {
    console.error('Error fetching stock data:', error.message);
    res.status(500).json({ error: 'Failed to fetch stock data', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
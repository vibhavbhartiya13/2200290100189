const express = require('express');
const cors = require('cors');
const { fetchStockPrices } = require('./service/stock');
const { pearsonCorrelation } = require('./utils/const');
const app = express();

app.use(cors()); // ✅ Enable CORS globally

const PORT = process.env.PORT || 3000;

function filterByMinutes(data, m) {
    const now = new Date();
    const cutoff = new Date(now - m * 60 * 1000);
    return data.filter(p => new Date(p.lastUpdatedAt) > cutoff);
}

app.get('/stocks/:ticker', async (req, res) => {
    const { ticker } = req.params;
    const minutes = parseInt(req.query.minutes);
    const aggregation = req.query.aggregation;

    if (aggregation !== 'average' || isNaN(minutes)) {
        return res.status(400).json({ error: 'Invalid query' });
    }

    try {
        const priceHistory = await fetchStockPrices(ticker, minutes);
        if (!Array.isArray(priceHistory) || priceHistory.length === 0) {
            return res.status(404).json({ error: 'No price data found' });
        }

        const avg = priceHistory.reduce((sum, item) => sum + item.price, 0) / priceHistory.length;
        return res.json({ averageStockPrice: avg, priceHistory });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to fetch stock data' });
    }
});

app.get('/stockcorrelation', async (req, res) => {
    const { minutes, ticker: tickers } = req.query;
    const parsedMinutes = parseInt(minutes);

    if (!Array.isArray(tickers) || tickers.length !== 2 || isNaN(parsedMinutes)) {
        return res.status(400).json({ error: 'Exactly two tickers and valid minutes required' });
    }

    try {
        const [data1, data2] = await Promise.all([
            fetchStockPrices(tickers[0], parsedMinutes),
            fetchStockPrices(tickers[1], parsedMinutes)
        ]);

        const aligned = Math.min(data1.length, data2.length);
        const prices1 = data1.slice(-aligned).map(p => p.price);
        const prices2 = data2.slice(-aligned).map(p => p.price);

        const correlation = pearsonCorrelation(prices1, prices2);

        const avg1 = prices1.reduce((a, b) => a + b, 0) / prices1.length;
        const avg2 = prices2.reduce((a, b) => a + b, 0) / prices2.length;

        return res.json({
            correlation,
            stocks: {
                [tickers[0]]: { averagePrice: avg1, priceHistory: data1 },
                [tickers[1]]: { averagePrice: avg2, priceHistory: data2 }
            }
        });
    } catch (err) {
        return res.status(500).json({ error: 'Correlation calculation failed' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
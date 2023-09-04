const http = require('http');
const https = require('https');
const url = require('url');
const cheerio = require('cheerio');
const cors = require('cors'); // Import the cors library
const corsOptions = {
  origin: '*', // You can specify specific origins here instead of '*'
};
const server = http.createServer((req, res) => {
  cors(corsOptions)(req, res, () => {
  // Parse the request URL
  const parsedUrl = url.parse(req.url, true);
  const query = parsedUrl.query;
  const symbol = query.symbol;

  // Check if the symbol parameter is provided
  if (!symbol) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Symbol parameter is required' }));
    return;
  }

  // Construct the Yahoo Finance URL
  const yahooFinanceUrl = `https://finance.yahoo.com/quote/${symbol}`;

  // Make a request to Yahoo Finance
  function fetchData(){
    https.get(yahooFinanceUrl, (yahooRes) => {
      let data = '';
      
      yahooRes.on('data', (chunk) => {
        data += chunk;
      });
  
      yahooRes.on('end', () => {
        // Load the HTML content using cheerio
        const $ = cheerio.load(data);
  
        // Extract the stock name and price from the HTML
        const stockName = $('h1[data-reactid="7"]').text();
        const stockPrice = $('td[data-test="OPEN-value"]').text();
        const previousClose = $('td[data-test="PREV_CLOSE-value"]').text();
        const marketCap = $('td[data-test="MARKET_CAP-value"]').text();
        const volume = $('td[data-test="TD_VOLUME-value"]').text();
        
        // Return the extracted data as JSON
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          symbol: symbol,
          name: stockName,
          price: stockPrice,
          prevClose: previousClose,
          marketCap: marketCap,
          volume: volume
        }));
      });
    }).on('error', (error) => {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'An error occurred while fetching data from Yahoo Finance' }));
    });
  }
  fetchData()
  })
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

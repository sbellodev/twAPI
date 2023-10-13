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
  
        const propertyMapping = {
          'Previous Close': 'previousClose',
          'Open': 'open',
          'Bid': 'bid',
          'Ask': 'ask',
          "Day's Range": 'dayRange',
          '52 Week Range': 'weeksRange',
          'Volume': 'volume',
          'Avg. Volume': 'avgVolume',
          'Market Cap': 'marketCap',
          'Beta (5Y Monthly)': 'beta',
          'PE Ratio (TTM)': 'peRatio',
          'EPS (TTM)': 'eps',
          'Earnings Date': 'earningsDate',
          'Forward Dividend & Yield': 'forwardDividendYield',
          'Ex-Dividend Date': 'exDividendDate',
          '1y Target Est': 'targetEst',
        };
        
        const extractedData = {};

// Iterate through all the <td> elements and extract their content
        $('td').each((index, element) => {
          const propertyName = $(element).text(); // Assuming the text inside the <td> is the property name
          const nextElement = $(element).next(); // Get the next sibling element (the corresponding value)
          const propertyValue = nextElement.text().trim(); // Get the value from the next element and trim whitespace
      
          if (propertyValue != "" ) {  
            const key = propertyMapping[propertyName];
            extractedData[key] = propertyValue;
          }
        });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          result : extractedData
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

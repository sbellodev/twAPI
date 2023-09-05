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
  
        const extractedData = {};

// Iterate through all the <td> elements and extract their content
        $('td').each((index, element) => {
          const propertyName = $(element).text(); // Assuming the text inside the <td> is the property name
          const nextElement = $(element).next(); // Get the next sibling element (the corresponding value)
          const propertyValue = nextElement.text().trim(); // Get the value from the next element and trim whitespace
      
          // Check if the property name is not empty and is not equal to the value
          if (propertyValue != "" ) {
              extractedData[propertyName] = propertyValue;
          }
        });

        // Now you have all the scraped data in the 'extractedData' object
        console.log(extractedData);

        // Extract the stock name and price from the HTML
        // const stockName = $('h1[data-reactid="7"]').text();
        // const stockPrice = $('td[data-test="OPEN-value"]').text();
        // const previousClose = $('td[data-test="PREV_CLOSE-value"]').text();
        // const marketCap = $('td[data-test="MARKET_CAP-value"]').text();
        // const volume = $('td[data-test="TD_VOLUME-value"]').text();
        // // Extract additional properties
        // const sixMonthInstitutionalOwnership = $('td:contains("6-Month Institutional Ownership")').next().text();
        // const sixMonthAverageVolume = $('td:contains("6-Month Average Volume")').next().text();
        // const percentageToValueBlend = $('td:contains("Percentage to Value Blend")').next().text();
        // const fiftyTwoWeekHighPrice = $('td.Fw(500).Ta(end).Pstart(10px).Miw(60px)').text();
        //const fiftyTwoWeekLowPrice = $('td:contains("52-Week Low Price")').next().text();

        //console.log(fiftyTwoWeekHighPrice)
        // Return the extracted data as JSON
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          result : extractedData
          // symbol: symbol,
          // name: stockName,
          // price: stockPrice,
          // prevClose: previousClose,
          // marketCap: marketCap,
          // volume: volume,
          // sixMonthInstitutionalOwnership: sixMonthInstitutionalOwnership,
          // sixMonthAverageVolume: sixMonthAverageVolume,
          // percentageToValueBlend: percentageToValueBlend,
          // fiftyTwoWeekHighPrice: fiftyTwoWeekHighPrice,
          // fiftyTwoWeekLowPrice: fiftyTwoWeekLowPricez
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

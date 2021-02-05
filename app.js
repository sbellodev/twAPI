var Twit = require('twit')
var config = require('./nope/config.json')

const consumer_key =        config.A
const consumer_secret =     config.B
const access_token =        config.C
const access_token_secret = config.D

var T = new Twit({
  consumer_key:         consumer_key,
  consumer_secret:      consumer_secret,
  access_token:         access_token,
  access_token_secret:  access_token_secret,
});

var http = require('http');
var server = http.createServer(function(req, res) {
  res.writeHead(200, {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json', 'Cache-Control' : 'max-age=60'});
  T.get('search/tweets', { q: '#AnimalCrossing turnip', result_type: "recent", count: 120,}, 
  (err, data, response) => {
    let tweets = data.statuses
      .filter(tweet => !tweet.retweeted_status) // No RTs
      .filter(tweet => !tweet.text.includes("@"))
      .filter(tweet => !tweet.text.toLowerCase().includes("rt"))
      .filter(tweet => !tweet.text.toLowerCase().includes("like"))
      .filter(tweet => !tweet.text.toLowerCase().includes("reply"))
      .map((tweet, i, a ) => {
        return { // Gets tweet's attributes we want
          id   : tweet.id_str,
          screen_name : tweet.user.screen_name,
          profile_image : tweet.user.profile_image_url,
          text : tweet.text,
          entities : tweet.entities
        }
      })
    if(tweets.length > 10) {tweets.length = 10}
    tweets.map(tw => console.log(tw))
    res.end(JSON.stringify(tweets));
  })
});
server.listen(9999);
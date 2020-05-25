var express = require("express")
var router = express.Router()
var Twit = require('twit')
var config = require('../config.json')

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

router.get('/', (req, res, next) => {
  T.get('search/tweets', { q: '#AnimalCrossing turnip', result_type: "recent", count: 50,}, 
    (err, data, response) => {
      let tweets = data.statuses
        .filter(tweet => !tweet.retweeted_status) // No RTs
        .map((tweet, i, a ) => {
          return { // Gets tweet's attributes we want
            id   : tweet.id_str,
            screen_name : tweet.user.screen_name,
            text : tweet.text,
            entities : tweet.entities
          }
        })
      if(tweets.length > 10) {tweets.length = 10}
      tweets.map(tw => console.log(tw))
      res.send(tweets)
    })
})

module.exports = router;
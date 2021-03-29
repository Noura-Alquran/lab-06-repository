'use strict';
//Load envirnment variables from the .env file
require('dotenv').config();
// Application dependencies
const express = require('express');//from node modules
const superagent = require('superagent');
const cors = require('cors');//from node modules
const { query } = require('express');
let PORT =process.env.PORT ;
const GEOCODE_API_KEY=process.env.GEOCODE_API_KEY;

const app=express(); //create new instance for express //express is a framework
app.use(cors());

app.get('/location',handelLocationReq);
app.get('/weather',handelWeatherReq);
function handelLocationReq(req, res) {
  const city = req.query.city;
  const url = 'https://us1.locationiq.com/v1/search.php';
  const cityQueryParam = {
    key: GEOCODE_API_KEY,
    city:city,
    format: 'json'
  };

  if(!city) {
    res.status(404).send('Sorry, something went wrong');
  }

  superagent.get(url).city(cityQueryParam).then(resdata => {
    const location = new Location(city,resdata.body[0]);
    res.status(200).send(location);
  }).catch((error) =>{
    res.send('Sorry, something went wrong');
  });
}

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;

}
function handelWeatherReq(req,res){
const weatherData=require('./data/weather.json');
const weatherArr=[];
weatherData.data.map(element => {
 weatherArr.push(new Weather(element)); 
});
res.send(weatherArr);
}

function Weather(day){
this.forecast=day.weather.description;
this.time=day.datetime;   
}
// error message 

app.use('*' , function(req , res){
  res.send('noting to show here');
});

app.listen(PORT, () => console.log(`Listening to Port ${PORT}`));//start point for the application"initialisation"



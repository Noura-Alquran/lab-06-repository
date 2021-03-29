'use strict';
//Load envirnment variables from the .env file
require('dotenv').config();
// Application dependencies
const express = require('express');//from node modules
const cors = require('cors');//from node modules
const { query } = require('express');
let PORT =process.env.PORT || 3000;
const app=express(); //create new instance for express //express is a framework
app.use(cors());

app.get('/location',handelLocationReq);
app.get('/weather',handelWeatherReq);
function handelLocationReq(req,res){
const searchQuery = req.query.city;
if(!searchQuery){
  res.status(500).send('Sorry, something went wrong');

}
const locationData= require('./data/location.json');
const location = new Location(locationData[0],searchQuery);
res.send(location);
}
function Location(data,searchQuery){
this.search_query=searchQuery;
this.formatted_query = data.display_name;
this.latitude = data.lat;
this.longitude = data.lon;

}

function handelWeatherReq(req,res){
const searchWeather = req.query; 
const weatherData=require('./data/weather.json');
const weatherArr=[];
weatherData.data.forEach(element => {
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



'use strict';
//Load envirnment variables from the .env file
require('dotenv').config();
// Application dependencies
const express = require('express');//from node modules
const cors = require('cors');//from node modules
let PORT =process.env.PORT;
const app=express(); //create new instance for express //express is a framework
app.use(cors());

app.get('/location',handelLocationReq);
app.get('/weather',handelWeatherReq);
function handelLocationReq(req,res){
const searchQuery = req.query;
const locationData= require('./data/location.json');
const location = new Location(locationData[0]);
res.send(location);
}
function Location(data){
this.display_name = data.display_name;
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
app.get('/*' , function(req , res){
  res.status(500).send('Sorry, something went wrong');
});

app.listen(PORT, () => console.log(`Listening to Port ${PORT}`));//start point for the application"initialisation"



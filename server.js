'use strict';
//Load envirnment variables from the .env file
require('dotenv').config();
// Application dependencies
const express = require('express');//from node modules
const pg=require('pg');
const superagent = require('superagent');
const cors = require('cors');//from node modules
const { query } = require('express');
const PORT =process.env.PORT ;
const GEOCODE_API_KEY=process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY=process.env.WEATHER_API_KEY;
const PARKS_API_KEY=process.env.PARKS_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

const app=express(); //create new instance for express //express is a framework
app.use(cors());
const client = new pg.Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
app.get('/location',handelLocationReq);
app.get('/weather',handelWeatherReq);
app.get('/parks',handelParkReq);

function handelLocationReq(req, res) {
  const city = req.query.city;
 if(!city) {
    res.status(500).send('Sorry, something went wrong');
  }
  const locationvalue = [city];
  const sqlQuery = `SELECT * FROM locations WHERE search_query=$1`;
   return client.query(sqlQuery, locationvalue).then(result => {
    if(result.rowCount){
      res.send( result.rows[0]);
      console.log("from database");
    }
    else{    
    const url = 'https://us1.locationiq.com/v1/search.php';
    const cityQueryParam = {
    key: GEOCODE_API_KEY,
    city  :  city,
    format: 'json',
      }

    superagent.get(url).query(cityQueryParam).then(resdata => {
           const location = new Location(resdata.body[0],city);
           const safeValues = [city, resdata.body[0].display_name,resdata.body[0].lat, resdata.body[0].lon];
          const sqlQuery=`INSERT INTO locations(search_query, formatted_query, latitude, longitude) VALUES ($1,$2,$3,$4)`;
           client.query(sqlQuery, safeValues).then(result => {
           res.send(location);
           console.log("from API");
      })
     });
  }
})}

function Location(geoData,city)  {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;

}

function handelWeatherReq(req,res){
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${req.query.latitude}&lon=${req.query.longitude}&key=${WEATHER_API_KEY}`;
    superagent.get(url).then(resData=> {
    const weatherArr=[];
    resData.body.data.map(element => {
    weatherArr.push(new Weather(element));
     return weatherArr;
      });
      res.send(weatherArr);
    }).catch((error) =>{
      res.send('Sorry, something went wrong');
    });
}

function Weather(day){
this.forecast=day.weather.description;
this.time=day.datetime;   
}

function handelParkReq(req,res){
const url=`https://developer.nps.gov/api/v1/parks?parkCode=${req.query.city}&api_key=${PARKS_API_KEY}&&limit=10`;
superagent.get(url).then(resData=> {
const arryOfParks=[];
resData.body.data.map(element=>{
 arryOfParks.push(new Parks(element));
 return arryOfParks ;
});
res.send(arryOfParks);
}).catch((error) =>{
  res.send('Sorry, something went wrong');
});
}
function Parks(data){
  this.name=data.name;
  this.address=data.address;
  this.fee =data.fees;
  this.description=data.description;
  this.url=data.url;
}
app.use('*' , function(req , res){
  res.send('noting to show here');
});


client.connect().then(() => {
  app.listen(PORT, () => {
    console.log("Connected to database:", client.connectionParameters.database) //show what database we connected to
    console.log(`Listening to Port ${PORT}`);//start point for the application"initialisation"
  });
})


'use strict';
//Load envirnment variables from the .env file
require('dotenv').config();
// Application dependencies
const express = require('express');//from node modules
const pg=require('pg');
const superagent = require('superagent');
const cors = require('cors');//from node modules
const { query } = require('express');
const PORT =process.env.PORT;
const GEOCODE_API_KEY=process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY=process.env.WEATHER_API_KEY;
const PARKS_API_KEY=process.env.PARKS_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
const YELP_API_KEY = process.env.YELP_API_KEY;
const app=express(); //create new instance for express //express is a framework
app.use(cors());
const client = new pg.Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// const client = new pg.Client(process.env.DATABASE_URL);

app.get('/location',handelLocationReq);
app.get('/weather',handelWeatherReq);
app.get('/parks',handelParkReq);
app.get('/movies',handelMovieReq);
app.get('/yelp',handelShowRestu);


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
    if (weatherArr.length<8){
    weatherArr.push(new Weather(element));
     return weatherArr;
    }});
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
  const url=`https://developer.nps.gov/api/v1/parks?api_key=${PARKS_API_KEY}&limit=10`;
  superagent.get(url).then(resData=> {
  const arryOfParks=[];
  resData.body.data.map(element=> {
   arryOfParks.push(new Parks(element));
   console.log(arryOfParks);
  return arryOfParks ;
  }); 
  res.send(arryOfParks);
  }).catch((error) =>{
    res.send('Sorry, something went wrong');
  });
  }
  
  function Parks(data){
    this.name = data.name;
    this.address=data.addresses[0].line1 + ',' + data.addresses[0].city + ',' + data.addresses[0].stateCode + ',' + data.addresses[0].postalCode;
    this.fee =data.fees[0]||'0.00';
    this.description=data.description;
    this.url=data.url;
  }

function handelMovieReq(req,res){
const url =`https://api.themoviedb.org/3/search/movie?api_key=${MOVIE_API_KEY}&query=${req.query.search_query}&language=en-US`;
const arrayMovies=[];
superagent.get(url).then(resData=>{
let data=resData.body.results.map(element=>{
  if(arrayMovies.length<20){
  arrayMovies.push(new Movie(element));
  return arrayMovies ;
}})
res.send(arrayMovies);
}).catch((error)=>{
res.send('Sorry, something went wrong');

})

}
function Movie (data){
  this.title=data.title;
  this.overview=data.overview;
  this.average_votes=data.vote_average;
  this.total_votes=data.vote_count;
  this.image_url=`https://image.tmdb.org/t/p/w500${data.poster_path}`;
  this.popularity=data.popularity;
  this.released_on=data.release_date;
}

function handelShowRestu(req,res){
    const url =`https://api.yelp.com/v3/businesses/search?term=restaurants&latitude=${req.query.latitude}&longitude=${req.query.longitude}&limit=20`;
    let page=req.query.page;
    const arrayOfYelp=[]
    superagent.get(url).set('Authorization',`Bearer ${YELP_API_KEY}`).then(resData=>{
    let data=resData.body.businesses.map(element=>{
      if(arrayOfYelp.length<20){
      arrayOfYelp.push( new Yelp(element));
       return arrayOfYelp;
    }});
      res.send(arrayOfYelp.slice((page-1)*5,page*5));
    }).catch((error)=>{
      res.send('Sorry, something went wrong');
      
  })}

  function Yelp(data){
    this.name=data.name;
    this.image_url=data.image_url;
    this.price=data.price;
    this.rating=data.rating;
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


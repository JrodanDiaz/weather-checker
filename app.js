
const express = require("express");
const app = express();
const https = require("https");
const http = require("http");
const bodyParser = require("body-parser");

require('dotenv').config();
app.use(express.static("Public"));

var latitude = 0;
var longitude = 0;
var weatherURL;


app.use(bodyParser.urlencoded({extended: true}));


app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html")

});

app.post("/", function(req, res){
    const cityName = req.body.cityName;
    const cityURL = `http://api.openweathermap.org/geo/1.0/direct?q=` + cityName + `&limit=1&appid=${process.env.API_KEY}`;
    
    //Convert city name to latitude and longitude
    http.get(cityURL, function(response){

        console.log("Geocode Status Code: " + response.statusCode);
        console.log("coord url: " + cityURL);
        response.on("data", function(data){
            const cityData = JSON.parse(data);
            latitude = cityData[0].lat;
            longitude = cityData[0].lon;
        });
    });//end Geocode GET request


     //Use lat + long to locate city and determine weather

     weatherURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + `&units=imperial&appid=${process.env.API_KEY}`;
     console.log("Weather URL: " + weatherURL);
     
     https.get(weatherURL, function(response){
         console.log("Weather Status Code: " + response.statusCode);
 
         response.on("data", function(data){
             const weatherData = JSON.parse(data);
             const temp = weatherData.main.temp;
             const weatherDescription = weatherData.weather[0].description;
             const iconTag = weatherData.weather[0].icon;
             const iconURL = "https://openweathermap.org/img/wn/" + iconTag +"@2x.png";
 
            //  console.log(weatherDescription);
            //  console.log(temp);
 
             res.write("<p>The weather is " + weatherDescription);
             res.write("<h1>The temperature in " + cityName + " is " + temp + " degrees Fahrenheit</h1>");
             res.write("<img src=" + iconURL + ">")
             res.send();
             
             
         })
     });//end Weather GET request
});//end post request


app.listen(3000, function(){
    console.log("Server started on Port 3000!");
});

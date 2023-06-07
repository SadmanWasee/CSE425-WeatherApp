const express = require('express');
const https = require('https');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
require('dotenv').config();


const app = express();


app.use(bodyparser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/weatherDB');

let today = new Date();
    let currentday = today.getDay(); 
    let options = {
        day : "numeric",
        month: "numeric",
        year: "numeric"
    };

let date = today.toLocaleDateString("en-US", options);

const weatherSchema = new mongoose.Schema({
    city : String,
    temp : Number,
    description : String,
    humidty: String,
    date: String
});

const WeatherReport = mongoose.model("WeatherReport", weatherSchema);

let temp ="";
let cityName = "";
let description = "";
let humidity = "";


app.get('/',(req,res)=>{

    res.render("weather", { temp: temp, description: description, humidity: humidity, cityName : cityName, date:date});
}); 


app.post("/", (req,res)=>{
    cityName = req.body.cityName;
    const url = 'https://api.openweathermap.org/data/2.5/weather?q='+cityName+'&appid='+process.env.API+'&units=metric';

    https.get(url, (response)=>{
        response.on('data', (data)=>{
            const WeatherData = JSON.parse(data);
            let cod = WeatherData.cod;
            cityName = WeatherData.name;
            temp = WeatherData.main.temp;
            description = WeatherData.weather[0].description;
            humidity = WeatherData.main.humidity;

                const weatherRpt = new WeatherReport({
                    city : cityName,
                    temp : temp,
                    description : description,
                    humidty: humidity,
                    date: date
                });
            
                weatherRpt.save();

            

            res.redirect("/");
        })
    })
})

var weatherReports = [];
app.get("/alltimeweather", async(req,res)=>{

    
    weatherReports.push("");
    res.render("weather2", {weatherReports:weatherReports})
    

});

app.post("/alltimeweather", async(req,res)=>{


    WeatherReport.find({city:req.body.city, date:req.body.date}).then((found)=>{

        res.render("weather2", {weatherReports:found});
    }).catch((err)=>{
        res.redirect("alltimeweather")
    })

})

app.listen(80, ()=> console.log("our sever is running at port 80"));
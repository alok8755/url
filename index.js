const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

const connectDB = async () => {
    try{
        await mongoose.connect(db, {
            useNewURLParser: true
        });
        console.log("Connected to DB");
    }catch(err){
        console.error(err.message);
    }
}

module.exports = connectDB;
const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
    urlCode: String,
    longUrl: String,
    shortUrl: String,
    clickCount: Number
});

module.exports = mongoose.model("url", urlSchema);
const express = require("express");
const shortid = require("shortid");
const validUrl = require("valid-url");
const config = require("config");
const Url = require("../mongomodel/url");

var shortUrlRoute = express.Router();

shortUrlRoute.post("/", async (req, res)=>{
    const longUrl = req.body.longUrl;
    const baseUrl = config.get("baseURL");
    if(!validUrl.isUri(baseUrl)){
        return res.status(401).json("Internal error. Please come back later.");
    }

    const urlCode = shortid.generate();

    if(validUrl.isUri(longUrl)){
        try{
            var url = await Url.findOne({longUrl : longUrl});
            if(url){
                return  res.status(200).json(url);
            }else{

                const shortUrl = baseUrl + "/" + urlCode;
                url  = new Url({
                    longUrl,
                    shortUrl,
                    urlCode,
                    clickCount: 0
                });
                
                await url.save()
                return res.status(201).json(url);
            }
        }catch(err){
            console.error(err.message);
            return res.status(500).json("Internal Server error " + err.message);
        }
    }else{
        res.status(400).json("Invalid URL. Please enter a vlaid url for shortening.");
    }    
});

module.exports = shortUrlRoute;
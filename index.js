const express = require("express");
const app = express();
const mongoose = require("mongoose")
require("dotenv").config()
const bodyParser = require("body-parser")
const cors = require("cors")
app.use(cors())
const mainRouter = require("./Router/mainRouter")

const dbUrl = process.env.dbUrl
mongoose.connect(dbUrl)
const db = mongoose.connection
db.once("open", () => {
    console.log("mongoDb Connected")
})

db.on("error", (e) => {
    console.log(e, "mongoDb disconnect")
})

app.use(bodyParser.json())
app.use(mainRouter)
app.get("/", (req, res) => {
    res.status(200).json("Welcome Auth App is working")
})

const server = app.listen(5000 || process.env.port, () => {
    console.log("App is listening at port ", 5000 || process.env.port);
});


module.exports = server
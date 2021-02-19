import express, {Request, Response, NextFunction} from "express";
// const express = require("express");
// import * as cors from "cors";
const cors = require("cors");
const app = express();

app.use(cors());

app.get('/', (req:Request, res:Response, next:NextFunction) => {
    console.log('access detected!')
    res.send("Hello World!")
})

app.listen(4000, () => {
    console.log('Server is running!')
})
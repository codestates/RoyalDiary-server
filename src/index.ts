import express, {Request, Response, NextFunction} from "express";
import "reflect-metadata";
import {createConnection} from "typeorm";
import {Users} from "./entity/Users";

createConnection().then(async connection => {


}).catch(error => console.log(error));

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
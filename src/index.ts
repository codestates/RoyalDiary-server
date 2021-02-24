import express, {Request, Response, NextFunction} from "express";
import "reflect-metadata";
import {createConnection} from "typeorm";
import contents from "./router/contents"
const cors = require("cors");
const app = express();

createConnection().then(async connection => {
}).catch(error => console.log(error));

app.use(cors());

app.get('/', (req:Request, res:Response, next:NextFunction) => {
    console.log('access detected!')
    res.send("access detected!")
})

app.use("/contents",contents);

app.listen(4000, () => {
    console.log('Server is running!')
})
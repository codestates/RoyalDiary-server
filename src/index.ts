import express, {Request, Response, NextFunction} from "express";
import "reflect-metadata";
import {createConnection} from "typeorm";
import {Users} from "./entity/Users";
import router from "./router/router"
const cors = require("cors");
const app = express();

createConnection().then(async connection => {
}).catch(error => console.log(error));

app.use(cors());

app.get('/', (req:Request, res:Response, next:NextFunction) => {
    console.log('access detected!')
    res.send("router test ---> move to /router")
})

app.use("/router", router);

app.listen(4000, () => {
    console.log('Server is running!')
})
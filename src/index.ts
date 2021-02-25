import express, {Request, Response, NextFunction} from "express";
import "reflect-metadata";
import {createConnection} from "typeorm";
import contents from "./router/contents"
import userRouter from "./router/users"
// import {Users} from "./entity/Users"
require('dotenv').config()
const cors = require("cors");
const app = express();
const config: any ={
    "type": process.env.TYPEORM_CONNECTION,
    "host": process.env.TYPEORM_HOST,
    "port": process.env.TYPEORM_PORT,
    "username": process.env.TYPEORM_USERNAME,
    "password": process.env.TYPEORM_PASSWORD,
    "database": process.env.TYPEORM_DATABASE,
    "synchronize": false,
    "logging": true,
    "entities": [
       "src/entity/**/*.ts"
    ],
    "migrations": [
       "src/migration/**/*.ts"
    ],
    "subscribers": [
       "src/subscriber/**/*.ts"
    ],
    "cli": {
      "entitiesDir": "src/entity",
      "migrationsDir": "src/migration",
      "subscribersDir": "src/subscriber"
    }
  }
createConnection(config).then(async connection => {
    // console.log("Inserting a new user into the database...");
    // const user = new Users();
    // user.name = "name";
    // user.nickname = "nickname";
    // user.password = "password";
    // user.email = "email";
    // user.mobile = "mobile";

    // await connection.manager.save(user);
    
    // console.log("Saved a new user with id: " + user.id);
    // console.log("Loading users from the database...");
    
    // const users = await connection.manager.find(Users);
    
    // console.log("Loaded users: ", users);
    // console.log("Here you can setup and run express/koa/any other framework.");
}).catch(error => console.log(error));

app.use(cors());

app.get('/', (req:Request, res:Response, next:NextFunction) => {
    console.log('access detected!')
    res.send("access detected!")
})

app.use("/contents",contents);
app.use("/users", userRouter)

app.listen(4000, () => {
    console.log('Server is running!')
})
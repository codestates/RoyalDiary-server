import express, {Request, Response, NextFunction} from "express";
import "reflect-metadata";
import {createConnection, getRepository} from "typeorm";
import contents from "./router/contents"
import users from "./router/users"
import {Users} from "./entity/Users"
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
  createConnection(config)
.then(() => {
console.log('typeorm connected');
})
.catch((err) => {
console.log('typeorm error', err);
}); 

  
  app.use(express.json()) //익스프레스는 바디파서 대신 쓰는거! 바디파서는 받지않아도 된다!
  app.use(cors());

  app.get('/', async (req:Request, res:Response, next:NextFunction) => {
    const users = await getRepository(Users).find();
    res.json(users);
  })

  // app.use("/contents",contents);
  app.use("/users", users);

  app.listen(4000, () => {
    console.log('Server is running!')
  })

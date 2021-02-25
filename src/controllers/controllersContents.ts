import express, { Request, Response, NextFunction } from "express";
import "reflect-metadata";
import {getConnection,createConnection, EntityRepository, Repository} from "typeorm";
import {Users} from "../entity/Users";

const connection = getConnection();
const userRepository = connection.getRepository(Users);

module.exports = {
    testpage : async (req: Request, res: Response) => {
        console.log("testpage")
    
            const users = await userRepository.find();
            console.log(users)
            res.send(users);
    
    }
}
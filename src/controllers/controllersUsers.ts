import "reflect-metadata";
import { Request, Response, NextFunction } from "express";
import {getConnection,createConnection, EntityRepository, Repository} from "typeorm";
import {Users} from "../entity/Users";

const connection = getConnection();
const userRepository = connection.getRepository(Users);

const users = {
    postSignup : async (req: Request, res: Response) => {
        const users = await userRepository.find();
        console.log(users)
        res.send(users);
    },

    postLogin : async (req: Request, res: Response) => {
        const users = await userRepository.find();
        console.log(users)
        res.send(users);
    },

    postLogout : async (req: Request, res: Response) => {
        const users = await userRepository.find();
        console.log(users)
        res.send(users);
    },

    postOauth : async (req: Request, res: Response) => {
        const users = await userRepository.find();
        console.log(users)
        res.send(users);
    },

    postCalendar : async (req: Request, res: Response) => {
        const users = await userRepository.find();
        console.log(users)
        res.send(users);
    },

    getMypage : async (req: Request, res: Response) => {
        const users = await userRepository.find();
        console.log(users)
        res.send(users);
    },

    delDuser : async (req: Request, res: Response) => {
        const users = await userRepository.find();
        console.log(users)
        res.send(users);
    }
    
}

export default users;
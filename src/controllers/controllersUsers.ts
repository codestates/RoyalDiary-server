import "reflect-metadata";
import { Request, Response, NextFunction } from "express";
import {getConnection, createConnection, EntityRepository, getRepository} from "typeorm";
import {Users} from "../entity/Users";



const users = {
    postSignup : async (req: Request, res: Response) => {
        const isMatchMobile = await Users.findByMobile(req.body.mobile);
        const isMatchEmail = await Users.findByEmail(req.body.email);
        const isMatchNickname = await Users.findByNickname(req.body.nickname);
        
        try{
            if(isMatchMobile) {
                return res.status(409).send({"message": "mobile already exists"});
            } else if (isMatchEmail) {
                return res.status(409).send({"message": "email already exists"});
            } else if (isMatchNickname) {
                return res.status(409).send({"message": "nickname already exists"});
            } else {
                await Users.insertNewUser(
                    req.body.name,
                    req.body.nickname,
                    req.body.password, 
                    req.body.email, 
                    req.body.mobile 
                    )
                //insertUser;
                return res.send({
                    data:{
                        "accessToken": "accessToken",//!this accessToken must be changed to real one!
                    },
                    "message":"ok",
                });
            }
        } catch(e) {
            res.status(500).send({"message": "err"});
            throw new Error(e);
        }
    },

    // postLogin : async (req: Request, res: Response) => {
    //     const users = await userRepository.find();
    //     console.log(users)
    //     res.send(users);
    // },

    // postLogout : async (req: Request, res: Response) => {
    //     const users = await userRepository.find();
    //     console.log(users)
    //     res.send(users);
    // },

    // postOauth : async (req: Request, res: Response) => {
    //     const users = await userRepository.find();
    //     console.log(users)
    //     res.send(users);
    // },

    // postCalendar : async (req: Request, res: Response) => {
    //     const users = await userRepository.find();
    //     console.log(users)
    //     res.send(users);
    // },

    // getMypage : async (req: Request, res: Response) => {
    //     const users = await userRepository.find();
    //     console.log(users)
    //     res.send(users);
    // },

    // delDuser : async (req: Request, res: Response) => {
    //     const users = await userRepository.find();
    //     console.log(users)
    //     res.send(users);
    // }
    
}

export default users;
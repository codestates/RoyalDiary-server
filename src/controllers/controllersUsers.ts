import "reflect-metadata";
import { Request, Response, NextFunction } from "express";
import {getConnection, createConnection, EntityRepository, getRepository} from "typeorm";
import {Users} from "../entity/Users";
import { Contents } from "../entity/Contents";

declare global { //익스프레스에 커스텀 속성을 전역으로 선언하는 코드
    namespace Express {
        interface Request {
        mobile: string;
        email: string;
        password: string;
        nickname: string;
        name: string;
        }
    }
    }

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
                const user = new Users;
                user.name = req.body.name;
                user.nickname = req.body.nickname;
                user.password = req.body.password;
                user.email = req.body.email;
                user.mobile = req.body.mobile;
                await user.save();
                //혹은 Users 엔티티에 입력한 메소드를 사용해서
                // await Users.insertNewUser(
                    // req.body.name,
                    // req.body.nickname,
                    // req.body.password, 
                    // req.body.email, 
                    // req.body.mobile 
                //     )
                //insertUser;
                return res.send({
                    data:{
                        "accessToken": "accessToken",
                        //!this accessToken must be changed to real one!
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
    //     console.log(this is postLogin)
    //     res.send();
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

    postCalendar : async (req: Request, res: Response) => {
        try{
            const findByCreatedAt = await Contents.findByCreatedAt(req.body.date);
            if(findByCreatedAt.length === 0) {
                res.status(404).send({"message": "err"});
            } else {
                // console.log(findByCreatedAt);
                res.status(200).send({data: [findByCreatedAt]})
            }
        } catch(e) {
            res.status(500).send({"message": "err"});
            throw new Error(e);
        }
    },

    getMypage : async (req: Request, res: Response) => {
        //!원래 accessToken을 받는데 일단 아이디로 받기로 한다.
        try{
            const findByIdNotAccessToken = await Users.findById(req.body.id);
            const findDiaryByIdNotAccessToken = await Contents.findDiaryListById(req.body.id)
            if(!findByIdNotAccessToken) {
                res.send({"message": "cannot find user"})
            } else {
                res.send({
                    "name": findByIdNotAccessToken.name,
                    "email": findByIdNotAccessToken.email,
                    "nickname": findByIdNotAccessToken.nickname,
                    "mobile": findByIdNotAccessToken.mobile,
                    "contents": findDiaryByIdNotAccessToken
                })
            }
            console.log(findByIdNotAccessToken)
            console.log(findDiaryByIdNotAccessToken)
        } catch(e) {
            res.status(500).send({"message": "err"});
            throw new Error(e);
        }
    },

    delDuser : async (req: Request, res: Response) => {
        //!원래 accessToken을 받는데 일단 아이디로 받기로 한다.
        try{
            console.log(users)
            // if("리프레시 토큰이 없을 때") {
                //!리프레시토큰이 없다면
            //     res.status(401).send({"message": "refresh token not provided"})
            // } else if("리프레시 토큰 기간이 지났을 때") {
                //!리프레시토큰은 있지만 verify했을 때 err가 발생한다면
            //     res.status(202).send({"message": "refresh token is outdated, pleaes log in again"})
            // } else if("리프레시 토큰이 조작된 가짜일 때") {
                //!리프레시토큰으로 받은 정보의 id와 실제 해당 id의 레코드를 비교해 다르다면 
            //     res.status(400).send({"message": "refresh token has been tampered"})
            // } else {
                await Users.delete({id: req.body.id});
                res.status(200).send({"message": "delete user information successfully"})
            // }
        } catch(e) {
            res.status(500).send({"message": "server error"});
        }
    }
    
}

export default users;
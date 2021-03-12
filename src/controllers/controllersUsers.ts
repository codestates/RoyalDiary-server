import "reflect-metadata";
import { Request, Response, NextFunction } from "express";
import {
  getConnection,
  createConnection,
  EntityRepository,
  getRepository,
} from "typeorm";
import { Users } from "../entity/Users";
import { Contents } from "../entity/Contents";
require("dotenv").config();
const crypto = require('crypto');
const {
  checkRefeshToken,
  generateAccessToken,
  generateRefreshToken,
  isAuthorized,
} = require("./token");

// declare global { //익스프레스에 커스텀 속성을 전역으로 선언하는 코드
//     namespace Express {
//         interface Request {
//         mobile: string;
//         email: string;
//         password: string;
//         nickname: string;
//         name: string;
//         }
//     }
// }

const users = {
  postSignup: async (req: Request, res: Response) => {
    const isMatchMobile = await Users.findByMobile(req.body.mobile);
    const isMatchEmail = await Users.findByEmail(req.body.email);
    const isMatchNickname = await Users.findByNickname(req.body.nickname);
    const encrypted = crypto 
      .pbkdf2Sync( 
        req.body.password,
        process.env.DATABASE_SALT,
        115123,
        64,
        'sha512',
      )
      .toString('base64');
    //req.body.password를 DATABASE_SALT로 115123번 반복해서 sha512로 암호화하고 64비트의 문자열로 만든다
    try {
      if (isMatchMobile) {
        return res.status(409).send({ message: "mobile already exists" });
      } else if (isMatchEmail) {
        return res.status(409).send({ message: "email already exists" });
      } else if (isMatchNickname) {
        return res.status(409).send({ message: "nickname already exists" });
      } else {
        const user = new Users();
        user.name = req.body.name;
        user.nickname = req.body.nickname;
        user.password = encrypted;
        user.email = req.body.email;
        user.mobile = req.body.mobile;
        await user.save();

        const userInfo = {
          name: req.body.name,
          nickname: req.body.nickname,
          email: req.body.email,
          mobile: req.body.mobile,
        };
        const accessToken: string | undefined = generateAccessToken(userInfo);
        const refreshToken: string | undefined  = generateRefreshToken(userInfo);

        res
          .cookie("refreshToken", refreshToken, {
            httpOnly: true,
          })
          .send({
            data: {
              accessToken: accessToken,
            },
            message: "ok",
          });
      }
    } catch (e) {
      res.status(500).send({ message: "err" });
      throw new Error(e);
    }
  },

  matchInfo: async (req: Request, res: Response) => {
    try {
      const email: string = req.body.email;
      const mobile: string = req.body.mobile;
      const nickname: string = req.body.nickname;
      if(email) {
        const isEmail: Users | undefined = await Users.findOne({email: email});
        isEmail ? res.send({"message": "email already exists"}) : res.send({"message": "email is usable"});
      } else if(mobile) {
        const isMobile: Users | undefined = await Users.findOne({mobile: mobile});
        isMobile ? res.send({"message": "mobile already exists"}) : res.send({"message": "mobile is usable"});
      } else if(nickname) {
        const isNickname: Users | undefined = await Users.findOne({nickname: nickname});
        isNickname ? res.send({"message": "nickname already exists"}) : res.send({"message": "nickname is usable"});
      }
    } catch(e) {
      res.status(500).send({ message: "err" });
      throw new Error(e);
    }
  },

  postLogin: async (req: Request, res: Response) => {
    try {
      const encrypted = crypto
      .pbkdf2Sync(
        req.body.password,
        process.env.DATABASE_SALT,
        115123,
        64,
        'sha512',
      )
      .toString('base64');
      const isEmail: any = await Users.findOne({
        email: req.body.email
      });
      
      if(!isEmail){
        res.status(404).send({"message": "email not found"});
      }else if (isEmail.password !== encrypted) {
        res.status(404).send({"message": "wrong password"});
      } else {
        const userInfo = {
          name: isEmail.name,
          nickname: isEmail.nickname,
          email: isEmail.email,
          mobile: isEmail.mobile,
        };
        const accessToken = generateAccessToken(userInfo);
        const refreshToken = generateRefreshToken(userInfo);
        res
          .cookie("refreshToken", refreshToken, {
            httpOnly: true,
          })
          .send({
            data: {
              nickname: isEmail.nickname,
              accessToken: accessToken,
            },
            message: "ok",
          });
      }
    } catch (e) {
      res.status(500).send({ message: "err" });
      throw new Error(e);
    }
  },

  postLogout: async (req: Request, res: Response) => {
    try {
      const authorization: string|undefined = req.headers["authorization"];
      if (authorization) {
        res.clearCookie("refreshToken").status(200).send({"message": "successfully signed out!"});
      } else {
        res.status(404).send({ message: "no accesstoken" });
      }
    } catch (e) {
      res.status(500).send({ message: "err" });
      throw new Error(e);
    }
  },

  isemail: async (req: Request, res: Response) => {
    try {
      let email:string = req.body.email;
      if(email) {
        const isMatch: any = await Users.findUser(email);
        if(isMatch) {
          const userInfo: {
            name : string,
            nickname: string,
            email: string,
            mobile: string
          } = {
            name: isMatch.name,
            nickname: isMatch.nickname,
            email: isMatch.email,
            mobile: isMatch.mobile,
          };
          const accessToken: string | undefined = generateAccessToken(userInfo);
          const refreshToken: string | undefined  = generateRefreshToken(userInfo);
          res.status(200)
          .cookie("refreshToken", refreshToken, {
            httpOnly: true,
          })
          .send({
            data: {
              nickname: userInfo.nickname,
              accessToken: accessToken
            }
          })
        } else {
          res.status(201).send({message: "not exists"});
        }
      }
    } catch(e) {
      res.status(500).send({message: "err"});
    }
  },

  auth: async (req: Request, res: Response) => {
    try {

      //(DB)이메일X 해당 소셜 로그인X ->회원가입(DB에 유저 레코드 추가, 서버 액세스,리프레시 토큰 제공)
      let email:string = req.body.email;
      if(!req.body.nickname || !req.body.email ||!req.body.auth) {
        res.status(404).send({message : "bad request"})
      } else {
        const matchUser: any = await Users.findUser(email);
        console.log(matchUser)
        if(!matchUser) { // 이메일 존재X 회원가입 필요
         
          const encrypted = crypto // encrypted가 password 대신 입력된다!
          .pbkdf2Sync(
            "no password",
            process.env.DATABASE_SALT,
            115123,
            64,
            'sha512',
          )
          .toString('base64');
          console.log(encrypted)
          const user = new Users();
          user.name = "no name"
          user.nickname = req.body.nickname;
          user.password = encrypted;
          user.email = req.body.email;
          user.mobile = "no mobile";
          user.auth = req.body.auth;
          await user.save();

          const userInfo = {
            name: "no name",
            nickname: user.nickname,
            email: user.email,
            mobile: "no mobile"
          };
          const accessToken: string | undefined = generateAccessToken(userInfo);
          const refreshToken: string | undefined  = generateRefreshToken(userInfo);

          res
          .cookie("refreshToken", refreshToken, {
            httpOnly: true,
          })
          .send({
            data: {
              accessToken: accessToken,
            },
            message: "ok",
          });
        }
      }
    } catch(e) {
      res.status(500).send({message: "err"});
      throw new Error(e);
    }
  },

  getCalendar: async (req: Request, res: Response) => {
    try {
      const findByCreatedAt = await Contents.findByCreatedAt(req.query.date as string);
      if (findByCreatedAt.length === 0) {
        res.status(404).send({ message: "err" });
      } else {
        // console.log(findByCreatedAt);
        res.status(200).send({ data: findByCreatedAt });
      }
    } catch (e) {
      res.status(500).send({ message: "err" });
      throw new Error(e);
    }
  },

  getMcalendar: async (req: Request, res: Response) => {
    try {
      const findByMonth = await Contents.findByMonth(req.query.date as string);
      if (findByMonth.length === 0) {
        res.status(404).send({ message: "err" });
      } else {
        res.status(200).send({ data: findByMonth });
      }
    } catch(e) {
      res.status(500).send({ message: "err" });
      throw new Error(e);
    }
  },

  getMypage: async (req: Request, res: Response) => {
    try {
      if (isAuthorized(req) === null) {
        res.send({ message: "cannot find user" });
      } else {
        const findUser: any = await Users.findUser(isAuthorized(req).email);
        const findDiaryByAccessToken = await Contents.findDiaryListById(
          findUser.id
        );
        res.send({
          name: isAuthorized(req).name,
          email: isAuthorized(req).email,
          nickname: isAuthorized(req).nickname,
          mobile: isAuthorized(req).mobile,
          contents: findDiaryByAccessToken,
        });
      }
      console.log(isAuthorized(req));
    } catch (e) {
      res.status(500).send({ message: "err" });
      throw new Error(e);
    }
  },

  delDuser: async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if(isAuthorized(req)) {
        const {email} = isAuthorized(req);
        await Users.findUser(email)
        .then(async (data: any) => {
          if(!data) {
            res
              .status(400)
              .send({ message: "access token has been tampered"});
          } else {
            await Users.delete({ email });
            res
              .status(200)
              .send({ message: "delete user information successfully" })
          }
        })
        .catch((err: string) => console.log(err));
      } else {
        if (!refreshToken) {
          res.status(401).send({ message: "refresh token not provided" });
        } else if (!checkRefeshToken(refreshToken)) {
          res
            .status(202)
            .send({ message: "refresh token is outdated, pleaes log in again" });
        } else {
          const { email } = checkRefeshToken(refreshToken);
          await Users.findUser(email)
            .then(async (data: any) => {
              if (!data) {
                res
                  .status(400)
                  .send({ message: "refresh token has been tampered" });
              } else {
                await Users.delete({ email });
                res
                  .status(200)
                  .send({ message: "delete user information successfully" });
              }
            })
            .catch((err: string) => console.log(err));
        }
      }
    } catch (e) {
      res.status(500).send({ message: "server error" });
    }
  },
};

export default users;

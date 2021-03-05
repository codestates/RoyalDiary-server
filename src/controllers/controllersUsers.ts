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
const {
  checkRefeshToken,
  generateAccessToken,
  generateRefreshToken,
  sendRefreshToken,
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

        const userInfo = {
          name: req.body.name,
          nickname: req.body.nickname,
          email: req.body.email,
          mobile: req.body.mobile,
        };
        const accessToken = generateAccessToken(userInfo);
        const refreshToken = generateRefreshToken(userInfo);

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
      const findUser: any = await Users.findOne({
        email: req.body.email,
        password: req.body.password,
      });
      console.log(findUser);
      if (!findUser) {
        res.status(404).send({ message: "can't find user" });
      } else {
        const userInfo = {
          name: findUser.name,
          nickname: findUser.nickname,
          email: findUser.email,
          mobile: findUser.mobile,
        };
        const accessToken = generateAccessToken(userInfo);
        const refreshToken = generateRefreshToken(userInfo);
        res
          .cookie("refreshToken", refreshToken, {
            httpOnly: true,
          })
          .send({
            data: {
              nickname: findUser.nickname,
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
      const isRealUser: any = await Users.findOne({
        email: isAuthorized(req).email,
      });
      if (isRealUser) {
        res.clearCookie("refreshToken").status(200).send({ message: "ok" });
      }
    } catch (e) {
      res.status(500).send({ message: "err" });
      throw new Error(e);
    }
  },

  // postOauth : async (req: Request, res: Response) => {
  //     const users = await userRepository.find();
  //     console.log(users)
  //     res.send(users);
  // },

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
      //console.log("this is isAuthorized" + findDiaryByIdNotAccessToken)
    } catch (e) {
      res.status(500).send({ message: "err" });
      throw new Error(e);
    }
  },

  delDuser: async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      console.log(users);
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
          .catch((err) => console.log(err));
      }
    } catch (e) {
      res.status(500).send({ message: "server error" });
    }
  },
};

export default users;

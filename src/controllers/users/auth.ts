import "reflect-metadata";
import { Request, Response } from "express";
import { Users } from "../../entity/Users";
const { generateAccessToken, generateRefreshToken } = require("../token");
const crypto = require("crypto");

export default (req: Request, res: Response) => {
  try {
    //이메일O 해당 소셜로그인O -> 이미 가입한 소셜로그인 회원 =로그인
    //이메일O 해당 소셜로그인X -> 이미 가입한 일반회원 = 로그인
    //이메일X 해당 소셜 로그인X ->회원가입(DB에 유저 레코드 추가, 서버 액세스,리프레시 토큰 제공)
    let email: string = req.body.email;
    if (email) {
      const matchUser: any = await Users.findUser(email);
      console.log(matchUser);
      if (matchUser) {
        if (matchUser.auth) {
          //이메일이 존재하고 소셜로그인이 존재해서 로그인이 필요한 경우
          const userInfo = {
            name: "no name",
            nickname: matchUser.nickname,
            email: matchUser.email,
            mobile: "no mobile",
          };
          const accessToken = generateAccessToken(userInfo);
          const refreshToken = generateRefreshToken(userInfo);
          res
            .cookie("refreshToken", refreshToken, {
              httpOnly: true,
            })
            .send({
              data: {
                nickname: matchUser.nickname,
                accessToken: accessToken,
              },
              message: "ok",
            });
        } else {
          //이메일 존재 소셜로그인 가입자 아님 로그인
          matchUser.auth = req.body.auth;
          await matchUser.save();
          if (matchUser.auth) {
            const userInfo = {
              name: matchUser.name,
              nickname: matchUser.nickname,
              email: matchUser.email,
              mobile: matchUser.mobile,
            };
            const accessToken = generateAccessToken(userInfo);
            const refreshToken = generateRefreshToken(userInfo);
            res
              .cookie("refreshToken", refreshToken, {
                httpOnly: true,
              })
              .send({
                data: {
                  nickname: matchUser.nickname,
                  accessToken: accessToken,
                },
                message: "ok",
              });
          }
        }
      } else {
        // 이메일 존재X 회원가입 필요
        const encrypted = crypto // encrypted가 password 대신 입력된다!
          .pbkdf2Sync(
            "no password",
            process.env.DATABASE_SALT,
            115123,
            64,
            "sha512"
          )
          .toString("base64");
        console.log(encrypted);
        const user = new Users();
        user.name = "no name";
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
          mobile: "no mobile",
        };
        const accessToken: string | undefined = generateAccessToken(userInfo);
        const refreshToken: string | undefined = generateRefreshToken(userInfo);

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
  } catch (e) {
    res.status(500).send({ message: "err" });
    throw new Error(e);
  }
};


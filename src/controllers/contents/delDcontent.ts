import express, { Request, Response} from "express";
import "reflect-metadata";
import { Users } from "../../entity/Users"
import { Contents } from "../../entity/Contents";

const {
    isAuthorized,
    checkRefeshToken,
    generateAccessToken
  } = require("../token");

export default async (req: Request, res: Response) => {
    try {
      const accessToken = req.headers.authorization;
      const refreshToken = req.cookies.refreshToken;
      const contentId: number = Number(req.body.contentId);

      if(!req.body.contentId && contentId === NaN) res.status(404); 
      if (accessToken) {
        if(isAuthorized(req)) {
          //해석이 될 때    
          const { email } = isAuthorized(req);
          const findUserIdByContentsId = await Contents.findUserIdByContentsId(
            contentId
          ).catch((err: string) => console.log("delDcontent error: " + err));
          console.log(findUserIdByContentsId)
          await Users.findUser(email)
            .then(async (data: any) => {
              console.log(data.id)
              if (data.id !== findUserIdByContentsId.userId) {
                res
                  .status(401)
                  .send({ message: "access token has been tampered" });
              } else {
                await Contents.deleteByContentsId(
                  req.body.contentId
                ).catch((err: string) => console.log("delDcontent error: " + err));
                res.status(200).send({ message: "content successfully deleted" });
              }
            })
            .catch((err: string) => console.log(err));
        } else {
          res.status(401)
          .send({message: "access token has been tampered"})
        }
      } else {
        if (!refreshToken) {
          res.status(400).send({ message: "refresh token not provided" });
        } else if (!checkRefeshToken(refreshToken)) {
          res
            .status(202)
            .send({
              message: "refresh token is outdated, pleaes log in again",
            });
        } else {
          const verifyRefreshToken: {
            name: string;
            nickname: string;
            email: string;
            mobile: string;
            iat?: number;
            exp?: number;
          } = checkRefeshToken(refreshToken);
          if(verifyRefreshToken) {
            const { email } = verifyRefreshToken;
            const findUserIdByContentsId = await Contents.findUserIdByContentsId(
              contentId
            )
            .catch((err: string) => console.log("delDcontent error: " + err));;
            await Users.findUser(email)
              .then(async (data: any) => {
                if (data.id !== findUserIdByContentsId.userId) {
                  res
                    .status(401)
                    .send({ message: "refresh token has been tampered" });
                } else {
                  const userInfo = {
                    name: verifyRefreshToken.name,
                    nickname: verifyRefreshToken.nickname,
                    email: verifyRefreshToken.email,
                    mobile: verifyRefreshToken.mobile,
                  };
                  res.status(201).send({
                    data: {
                      accessToken: generateAccessToken(userInfo),
                    },
                    message: "New AccessToken, please restore and request again"
                  });
                }
              })
              .catch((err: string) => console.log("delDcontent error: " + err));
          } else {
            res
            .status(401)
            .send({ message: "refresh token has been tampered" });
          }
        }
      }
    } catch (e) {
      res.status(500).send({ message: "err" });
      throw new Error(e);
    }
}
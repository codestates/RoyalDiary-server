import "reflect-metadata";
import { Request, Response } from "express";
import { Users } from "../../entity/Users";
const { generateAccessToken, generateRefreshToken } = require("../token");

export default async (req: Request, res: Response) => {
  try {
    let email: string = req.body.email;
    if (email) {
      const isMatch: any = await Users.findUser(email);
      if (isMatch) {
        const userInfo: {
          name: string;
          nickname: string;
          email: string;
          mobile: string;
        } = {
          name: isMatch.name,
          nickname: isMatch.nickname,
          email: isMatch.email,
          mobile: isMatch.mobile,
        };
        const accessToken: string | undefined = generateAccessToken(userInfo);
        const refreshToken: string | undefined = generateRefreshToken(userInfo);
        res
          .status(200)
          .cookie("refreshToken", refreshToken, {
            httpOnly: true,
          })
          .send({
            data: {
              nickname: userInfo.nickname,
              accessToken: accessToken,
            },
          });
      } else {
        res.status(201).send({ message: "not exists" });
      }
    }
  } catch (e) {
    res.status(500).send({ message: "err" });
  }
};


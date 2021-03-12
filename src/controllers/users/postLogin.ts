import "reflect-metadata";
import { Request, Response } from "express";
import { Users } from "../../entity/Users";
require("dotenv").config();
const crypto = require("crypto");
const { generateAccessToken, generateRefreshToken } = require("../token");

export default async (req: Request, res: Response) => {
  try {
    const encrypted = crypto
      .pbkdf2Sync(
        req.body.password,
        process.env.DATABASE_SALT,
        115123,
        64,
        "sha512"
      )
      .toString("base64");
    const isEmail: any = await Users.findOne({
      email: req.body.email,
    });

    if (!isEmail) {
      res.status(404).send({ message: "email not found" });
    } else if (isEmail.password !== encrypted) {
      res.status(404).send({ message: "wrong password" });
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
};


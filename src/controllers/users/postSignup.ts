import "reflect-metadata";
import { Request, Response } from "express";
import { Users } from "../../entity/Users";
require("dotenv").config();
const crypto = require("crypto");
const { generateAccessToken, generateRefreshToken } = require("../token");

export default async (req: Request, res: Response) => {
  const isMatchMobile = await Users.findByMobile(req.body.mobile);
  const isMatchEmail = await Users.findByEmail(req.body.email);
  const isMatchNickname = await Users.findByNickname(req.body.nickname);
  const encrypted = crypto
    .pbkdf2Sync(
      req.body.password,
      process.env.DATABASE_SALT,
      115123,
      64,
      "sha512"
    )
    .toString("base64");
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
  } catch (e) {
    res.status(500).send({ message: "err" });
    throw new Error(e);
  }
};

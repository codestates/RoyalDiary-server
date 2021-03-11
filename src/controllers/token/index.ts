const { sign, verify } = require("jsonwebtoken");
require("dotenv").config();
import { Request, Response } from "express";

declare global {
  //익스프레스에 커스텀 속성을 전역으로 선언하는 코드
  namespace Express {
    interface Request {
      cookie: any;
      status: any;
    }
  }
}

module.exports = {
  generateAccessToken: (data: object) => {
    //액세스 토큰 생성
    return sign(data, process.env.ACCESS_SECRET, { expiresIn: "1d" });
  },
  generateRefreshToken: (data: object) => {
    //리프레시 토큰 생성
    return sign(data, process.env.REFRESH_SECRET, { expiresIn: "7d" });
  },
  sendRefreshToken: (res: Request, refreshToken: string) => {
    //리프레시 토큰 res로 보내기
    try {
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
      });
    } catch(e) {
      res.status(500).send({ message: "err" });
      throw new Error(e);
    }
  },
  sendAccessToken: (res: Request, accessToken: string) => {
    //액세스 토큰 res로 보내기
    try {
      res.status(200).json({ data: { accessToken: accessToken }, message: "ok" });
    } catch(e) {
      res.status(500).send({ message: "err" });
      throw new Error(e);
    }
  },
  resendAccessToken: (res: Request, accessToken: string, data: string) => {
    //액세스토큰 res로 재전송
    try {
      res.status(201).json({
        data: { accessToken: accessToken, userInfo: data },
        message: "New AccessToken, please restore and request again",
      });
    } catch(e) {
      res.status(500).send({ message: "err" });
      throw new Error(e);
    }
  },
  isAuthorized: (req: Request) => {
    //액세스토큰이 헤더에 있는지 확인
    const authorization = req.headers["authorization"];
    if (!authorization) {
      return null;
    }
    const token = authorization.split(" ")[1];
    try {
      return verify(token, process.env.ACCESS_SECRET);
    } catch (err) {
      return null;
    }
  },
  checkRefeshToken: (refreshToken: string) => {
    //리프레시 토큰이 있는지 확인
    try {
      return verify(refreshToken, process.env.REFRESH_SECRET);
    } catch (err) {
      // return null if refresh token is not valid
      return null;
    }
  },
};

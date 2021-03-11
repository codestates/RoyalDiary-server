const axios = require("axios");
import { Request, Response } from "express";
require("dotenv").config();

const clientID: string | undefined = process.env.KAKAO_CLIENT_ID;
const clientSecret: string | undefined = process.env.KAKAO_CLIENT_SECRET; //!아직 없음

module.exports = async (req: Request, res: Response) => {
  console.log(req.body);
  axios({
    method: "post",
    url: `https://kauth.kakao.com/oauth/token`,
    headers: {
    //   accept: "application/json",
    },
    data: {
      grant_type : "authorization_code",
      code :  "authorization_code가 들어갈 곳",
      redirect_uri : "인가 코드가 리다이렉트된 URI",
      client_id : clientID,
      client_secret: clientSecret,
      code: req.body.authorizationCode,
    },
  })
    .then((response: any) => {
      const accessToken = response.data.access_token;
      res.status(200).json({ accessToken: accessToken });
    })
    .catch((e: string) => {
      res.status(404);
    });
};

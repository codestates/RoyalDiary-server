const axios = require("axios");
import { Request, Response } from "express";
require("dotenv").config();

const clientID: string | undefined = process.env.GITHUB_CLIENT_ID; //!아직 없음
const clientSecret: string | undefined = process.env.GITHUB_CLIENT_SECRET; //!아직 없음
//const stringify = require('qs-stringify')

module.exports = async (req: Request, res: Response) => {
  // req의 body로 authorization code가 들어옵니다. console.log를 통해 서버의 터미널창에서 확인해보세요!
  console.log(req.body);
  // TODO : 이제 authorization code를 이용해 access token을 발급받기 위한 post 요청을 보냅니다. 다음 링크를 참고하세요.
  // https://docs.github.com/en/free-pro-team@latest/developers/apps/identifying-and-authorizing-users-for-github-apps#2-users-are-redirected-back-to-your-site-by-github
  axios({
    method: "post",
    url: `https://github.com/login/oauth/access_token`,
    headers: {
      accept: "application/json",
    },
    data: {
      client_id: clientID,
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


import express, { Request, Response} from "express";
import "reflect-metadata";
import { Users } from "../../entity/Users"
import { Comments } from "../../entity/Comments";

const {
  isAuthorized,
  checkRefeshToken,
  generateAccessToken
} = require("../token");

export default async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (isAuthorized(req)) {
        const findUserId: any = await Users.findOne({
          email: isAuthorized(req).email,
        });
        const comment = new Comments();
        comment.text = req.body.text;
        comment.user = findUserId.id;
        comment.stampId = req.body.stampId;
        comment.content = req.body.contentId;
        await comment.save().catch((err: string) => console.log(err));
        res.send({
          message: "ok",
          data: {
            commentInfo: {
              id: comment.content,
              userId: comment.user,
              nickname: isAuthorized(req).nickname,
              createdAt: comment.createdAt,
              updatedAt: comment.updatedAt,
              text: comment.text,
              stampId: comment.stampId,
            },
          },
        });
      } else if (refreshToken) {
        const verifyRefreshToken: {
          name: string;
          nickname: string;
          email: string;
          mobile: string;
          iat?: number;
          exp?: number;
        } = checkRefeshToken(refreshToken);
        const userEmail: string = verifyRefreshToken.email;
        const isTampered: any = await Users.findUser(userEmail); //true: 조작안됨, false: 조작됨
        const findUserIdByrefreshToken: any = await Users.findOne({
          email: verifyRefreshToken.email,
        });
        console.log(typeof verifyRefreshToken.email);
        if (!isTampered) {
          res.status(401).send({ message: "refresh token has been tampered" });
        } else {
          const userInfo = {
            name: verifyRefreshToken.name,
            nickname: verifyRefreshToken.nickname,
            email: verifyRefreshToken.email,
            mobile: verifyRefreshToken.mobile,
          };
          const accessToken: string = generateAccessToken(userInfo);
          console.log("hello");
          const comment = new Comments();
          comment.text = req.body.text;
          comment.user = findUserIdByrefreshToken.id;
          comment.stampId = req.body.stampId;
          comment.content = req.body.contentId;
          await comment.save().catch((err: string) => console.log(err));
          res.status(200).send({
            message: "New AccessToken, please restore and request again",
            data: {
              accessToken: accessToken,
              commentInfo: {
                id: comment.content,
                userId: comment.user,
                nickname: findUserIdByrefreshToken.nickname,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
                text: comment.text,
                stampId: comment.stampId,
              },
            },
          });
        }
      } else {
        res.send({ message: "not authorized" });
      }
    } catch (e) {
      res.status(500).send({ message: "err" });
    }
}
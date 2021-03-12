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
      console.log("this is patchUcomment")
      const refreshToken = req.headers.refreshToken;
      const findCommentByCommentId: any = await Comments.findOne({
        id: req.body.commentId,
      });
      if (!findCommentByCommentId) {
        res.status(400).send({ message: "cannot find comment" });
      } else if (isAuthorized(req)) {
        const findUserId: any = await Users.findOne({
          email: isAuthorized(req).email,
        });
        const comment: any = await Comments.findById(req.body.commentId);
        comment.text = req.body.text ? req.body.text : comment.text;
        console.log("thisis comment --------------------")
        console.log(findUserId);
        // comment.user = findUserId;
        console.log(comment.user);
        comment.stampId = req.body.stampId ? req.body.stampId : comment.stampId;
        comment.content = comment.content;
        comment.updatedAt = new Date();
        await comment.save().catch((err: string) => console.log(err));
        res.status(200).send({
          message: "comment updated",
          data: {
            commentInfo: {
              id: comment.id,
              userId: findUserId.id,
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
        const findUserIdByrefreshToken: any = await Users.findOne({
          email: verifyRefreshToken.email,
        });
        if (!findUserIdByrefreshToken) {
          res.status(401).send({ message: "refresh token has been tempered" });
        } else {
          const userInfo = {
            name: verifyRefreshToken.name,
            nickname: verifyRefreshToken.nickname,
            email: verifyRefreshToken.email,
            mobile: verifyRefreshToken.mobile,
          };
          const accessToken: string = generateAccessToken(userInfo);
          const comment: any = await Comments.findById(req.body.commentId);
          comment.text = req.body.text ? req.body.text : comment.text;
          comment.user = comment.user; //findUserIdByrefreshToken.id;
          comment.stampId = req.body.stampId ? req.body.stampId : comment.stampId;
          comment.content = comment.content;//req.body.contentId;
          comment.updatedAt = new Date();
          await comment.save().catch((err: string) => console.log(err));
          res.status(201).send({
            message: "New AccessToken, please restore and request again",
            data: {
              accessToken: accessToken,
              commentInfo: {
                id: comment.id,
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
import express, { Request, Response} from "express";
import "reflect-metadata";
import { Users } from "../../entity/Users"
import { Contents } from "../../entity/Contents";
import { Comments } from "../../entity/Comments";
const {
    isAuthorized,
    checkRefeshToken,
    generateAccessToken
  } = require("../token");

export default async (req: Request, res: Response) => {
    try {
      console.log("this is patchUcontent")
      const accessToken = req.headers.authorization;
      const refreshToken = req.cookies.refreshToken;
      const contentId: number = Number(req.body.contentId);
      if (accessToken) {
        const { email } = isAuthorized(req);
        const findUser: any = await Users.findUser(email);
        const findUserIdByContentsId = await Contents.findUserIdByContentsId(
          contentId
        );
        await Users.findUser(email)
          .then(async (data: any) => {
            if (data.id !== findUserIdByContentsId.userId) {
              res
                .status(400)
                .send({ message: "access token has been tampered" });
            } else {
              const getComment: any = await Comments.findCommentByContentId(
                contentId
              );
              const getContent: any = await Contents.findByContentsId(
                contentId
              );
              const getUserIdByContentsId: any = await Contents.findUserIdByContentsId(
                getContent.id
              );
              const getContentUser: any = await Users.findById(
                getUserIdByContentsId.userId
              );

              getContent.userId = findUser.id;
              getContent.title = req.body.title;
              getContent.content = req.body.content;
              getContent.weather = req.body.weather;
              getContent.emotion = req.body.emotion;
              getContent.imgUrl = req.body.imgUrl;
              getContent.imgMain = req.body.imgMain;
              getContent.isPublic = req.body.isPublic;
              getContent.updatedAt = new Date();
              await getContent.save().catch((err: string) => console.log(err));
              getContent.nickname = getContentUser.nickname;
              for (let i: number = 0; i < getComment.length; i++) {
                await Users.findOne({ id: getComment[i].userId })
                  .then((data: any) => {
                    getComment[i].nickname = data.nickname;
                  })
                  .catch((err: string) => console.log(err));
              }

              res.status(200).send({
                data: {
                  ...getContent,
                  comments: [...getComment],
                },
                message: "successfully revised",
              });
            }
          })
          .catch((err: string) => console.log(err));
      } else {
        if (!refreshToken) {
          res.status(401).send({ message: "refresh token not provided" });
        } else if (!checkRefeshToken(refreshToken)) {
          res
            .status(202)
            .send({
              message: "refresh token is outdated, pleaes log in again",
            });
        } else {
          const { email } = checkRefeshToken(refreshToken);
          const findUserIdByContentsId = await Contents.findUserIdByContentsId(
            contentId
          );
          await Users.findUser(email)
            .then(async (data: any) => {
              if (data.id !== findUserIdByContentsId) {
                res
                  .status(400)
                  .send({ message: "refresh token has been tampered" });
              } else {
                const { email } = checkRefeshToken(refreshToken);
                const findUser: any = await Users.findUser(email);
                const contentId: number = Number(req.body.contentId);
                const getComment: any = await Comments.findCommentByContentId(
                  contentId
                );
                const getContent: any = await Contents.findByContentsId(
                  contentId
                );
                const getUserIdByContentsId: any = await Contents.findUserIdByContentsId(
                  getContent.id
                );
                const getContentUser: any = await Users.findById(
                  getUserIdByContentsId.userId
                );

                getContent.userId = findUser.id;
                getContent.title = req.body.title;
                getContent.content = req.body.content;
                getContent.weather = req.body.weather;
                getContent.emotion = req.body.emotion;
                getContent.imgUrl = req.body.imgUrl;
                getContent.imgMain = req.body.imgMain;
                getContent.isPublic = req.body.isPublic;
                getContent.updatedAt = new Date();
                await getContent
                  .save()
                  .catch((err: string) => console.log(err));

                const verifyRefreshToken: {
                  name: string;
                  nickname: string;
                  email: string;
                  mobile: string;
                  iat?: number;
                  exp?: number;
                } = checkRefeshToken(refreshToken);

                const userInfo = {
                  name: verifyRefreshToken.name,
                  nickname: verifyRefreshToken.nickname,
                  email: verifyRefreshToken.email,
                  mobile: verifyRefreshToken.mobile,
                };
                getContent.nickname = getContentUser.nickname;
                getContent.accessToken = generateAccessToken(userInfo);

                for (let i: number = 0; i < getComment.length; i++) {
                  await Users.findOne({ id: getComment[i].userId })
                    .then((data: any) => {
                      getComment[i].nickname = data.nickname;
                    })
                    .catch((err) => console.log(err));
                }

                res.status(201).send({
                  data: {
                    ...getContent,
                    comments: [...getComment],
                  },
                  message: "New AccessToken, please restore and request again",
                });
              }
            })
            .catch((err: string) => console.log(err));
          }
        }
    } catch (e) {
      res.status(500).send({ message: "err" });
      throw new Error(e);
    }
}

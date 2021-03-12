import express, { Request, Response, NextFunction } from "express";
import "reflect-metadata";
import { BaseEntity, FindOneOptions, getRepository } from "typeorm";
import { Users } from "../entity/Users";
// import { Stamps } from "../entity/Stamps";
import { Contents } from "../entity/Contents";
import { Comments } from "../entity/Comments";
//import { AnyARecord } from "node:dns";
const crypto = require('crypto');
const {
  isAuthorized,
  generateAccessToken,
  checkRefeshToken,
} = require("./token");

const controllers = {
  postCcontet: async (req: Request, res: Response) => {
    try {
      const accessTokenData = req.headers.authorization;
      const refreshToken = req.cookies.refreshToken;
      
      if (accessTokenData) {
        if(!isAuthorized(req)){
          res
          .status(400)
          .send({ message: "access token has been tampered" });
        } else {
          const {email} = isAuthorized(req);

          const findUser: any = await Users.findUser(email)
          //const findUser: any = await Users.findOne({email})
          console.log(findUser)

          const content = new Contents();
          content.user = findUser.id;
          content.imgMain = req.body.imgMain;
          content.title = req.body.title;
          content.content = req.body.content;
          content.weather = req.body.weather;
          content.emotion = req.body.emotion;
          content.imgUrl = req.body.imgUrl;
          content.isPublic = req.body.isPublic;
          await content.save()
            .catch((err: string) => console.log(err));
          res.status(200).send({message : "ok"});
        }
      } 
      else if (!accessTokenData) {
      //   res.status(401).send("access token has been tampered");
      // } else {
        if (!refreshToken) {
          //!리프레시 토큰이 없는 경우 401
          res.status(401).send({ message: "refresh token not provided" });
        } else if (!checkRefeshToken(refreshToken)) {
          //!리프레시 토큰이 유효하지 않은 경우 202
          res
            .status(202)
            .send({
              message: "refresh token is outdated, pleaes log in again",
            });
        } else {
          //!리프레시 토큰이 유효하고

              if (!isAuthorized(req)) {
                //!액세스 토큰의 정보가 데이터베이스에 존재하지 않을 때 400//!리프레시 토큰의 정보가 데이터베이스에 존재하지 않을 때 400
                res
                  .status(400)
                  .send({ message: "refresh token has been tampered" });
              } else {
                //!리프레시 토큰의 정보가 데이터베이스에 존재할 때 201

                const { email } = isAuthorized(req);
      
                const findUser: any = await Users.findOne(email)
        
                const content = new Contents();
                content.user = findUser.id;
                content.imgMain = req.body.imgMain;
                content.title = req.body.title;
                content.content = req.body.content;
                content.weather = req.body.weather;
                content.emotion = req.body.emotion;
                content.imgUrl = req.body.imgUrl;
                content.isPublic = req.body.isPublic;
                await content.save()
                  .catch((err: string) => console.log(err));
                res.status(200).send({message : "ok"});
              }
          }
      }
    } catch (e) {
      res.status(500).send({ message: "err" });
      throw new Error(e);
    }
  },
  getContent: async (req: Request, res: Response) => {
    try {
      if(req.query.contentId) {
        const contentId: number = Number(req.query.contentId);
        console.log("this is getContent");
        const findId: any = await Contents.findSelectByContentsId(contentId).catch((err) => console.log(err));
        const getComment: any = await Comments.findCommentByContentId(contentId).catch((err) => console.log(err));
        const getContent: any = await Contents.findByContentsId(contentId).catch((err) => console.log(err));
        if(getContent) {
          const getUserIdByContentsId: any = await Contents.findUserIdByContentsId(
            getContent.id
          ).catch((err) => console.log(err));;
          const getContentUser: any = await Users.findById(
            getUserIdByContentsId.userId
          ).catch((err) => console.log(err));;
            
          findId.nickname = getContentUser.nickname;
          for (let i: number = 0; i < getComment.length; i++) {
            await Users.findOne({ id: getComment[i].userId })
            .then((data: any) => {
              getComment[i].nickname = data.nickname;
            })
            .catch((err) => console.log(err));
          }
          // for (let i: number = 0; i < getComment.length; i++) {
          //   const stampId: number = getComment[i].stampId;
          //   await Stamps.findOne({ id: stampId })
          //   .then((data: any) => {
          //     getComment[i].stampUrl = data.imgUrl;
          //   })
          //   .catch((err) => console.log(err));
          // }
          
          res.status(200).send({
            data: {
              ...findId,
              comments: [...getComment],
            },
          });
        } else {
          res.status(204)
          .send(); //.send()가 없으면 에러가 나니 주의할 것
        }
      } else {
        res.status(404).send({message: "bad request"})
      }
    } catch (e) {
      res.status(500).send({ message: "err" });
      throw new Error(e);
    }
  },
  getContents: async (req: Request, res: Response) => {
    try {
      console.log("this is getContents")
      if (isAuthorized(req)) {
        const findUser: any = await Users.findUser(isAuthorized(req).email);
        const pageNum: any = req.query.page;
        let skip: number = 0;
        if (pageNum > 1) {
          skip = 9 * (pageNum - 1);
        }
        const allContentOrderByRecent: any = await Contents.find({
          where: { user: findUser.id },
          select: ["title", "imgUrl", "createdAt", "updatedAt"],
          order: {
            createdAt: "DESC",
          },
          skip,
          take: 9,
        });
        const allContentOrderByLikes: any = await Contents.find({
          where: { user: findUser.id },
          select: ["title", "imgUrl", "createdAt", "updatedAt"],
          order: {
            views: "DESC",
          },
          skip,
          take: 9,
        });
        if (allContentOrderByRecent) {
          for (let i: number = 0; i < allContentOrderByRecent.length; i++) {
            allContentOrderByRecent[i].nickname = findUser.nickname;
            allContentOrderByLikes[i].nickname = findUser.nickname;
          }

          const orderByRecent = [...allContentOrderByRecent];
          const orderByLikes = [...allContentOrderByLikes];
          const findUsers: any[] = await Contents.find({user: findUser.id});
          const count = findUsers.length;
          res.status(200).send({
            data: {
              orderByRecent,
              orderByLikes,
              count,
            },
          });
        } else {
          res.status(204);
        }
      } else {
        res.status(404).send({ message: "error" });
      }
    } catch (e) {
      res.status(500).send({ message: "err" });
      throw new Error(e);
    }
  },
  patchUcontent: async (req: Request, res: Response) => {
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
              // for (let i: number = 0; i < getComment.length; i++) {
              //   const stampId: number = getComment[i].stampId;
              //   await Stamps.findOne({ id: stampId })
              //     .then((data: any) => {
              //       getComment[i].stampUrl = data.imgUrl;
              //     })
              //     .catch((err) => console.log(err));
              // }

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
                // for (let i: number = 0; i < getComment.length; i++) {
                //   const stampId: number = getComment[i].stampId;
                //   await Stamps.findOne({ id: stampId })
                //     .then((data: any) => {
                //       getComment[i].stampUrl = data.imgUrl;
                //     })
                //     .catch((err) => console.log(err));
                // }

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
  },
  delDcontent: async (req: Request, res: Response) => {
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
  },
  getPublicContents: async (req: Request, res: Response) => {
    try {
      console.log("this is getPublicContents")
      const pageNum: any = req.query.page;
      let skip: number = 0;
      if (pageNum > 1) {
        skip = 9 * (pageNum - 1);
      }
      const allContentOrderByRecent: any = await Contents.find({
        select: ["id", "title", "imgUrl", "createdAt"],
        where : [{"isPublic" : true} ],
        order: {
          createdAt: "DESC",
        },
        skip,
        take: 9,
      });

      if(allContentOrderByRecent) {
        for (let i: number = 0; i < allContentOrderByRecent.length; i++) {
          const getUserIdByContentsIdOrderByCreateAt: any = await Contents.findUserIdByContentsId(
            allContentOrderByRecent[i].id
          );
          await Users.findById(
            getUserIdByContentsIdOrderByCreateAt.userId
          )
          .then((data: any) => {
            allContentOrderByRecent[i].nickname =
            data.nickname;
          })
          .catch((err: string) => console.log(err));
        }
        const orderByRecent = [...allContentOrderByRecent];
        const count = allContentOrderByRecent.length;
        res.status(200).send({
          data: {
            orderByRecent,
            count
          }
        });
      } else {
        res.status(204).send({
          data: {
            orderByRecent: {},
            orderByLikes: {}
          }
        })
      }
    } catch (e) {
      res.status(500).send({ message: "err" });
      throw new Error(e);
    }
  },

  postComment: async (req: Request, res: Response) => {
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
  },
  patchUcomment: async (req: Request, res: Response) => {
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
  },
  delDcomment: async (req: Request, res: Response) => {

    try {
      const accessToken = req.headers.authorization;
      const refreshToken = req.cookies.refreshToken;
      if(!req.body.commentId) res.status(404);
      const commentId: number = Number(req.body.commentId);
      if (accessToken) {
        if(isAuthorized(req)) {
          //해석이 될 때    
          const { email } = isAuthorized(req);
          const findUserIdBycommentId = await Comments.findUserIdByCommentId(
            commentId
          );
          console.log(findUserIdBycommentId)
          await Users.findUser(email)
            .then(async (data: any) => {
              console.log(data.id)
              if (data.id !== findUserIdBycommentId.userId) {
                res
                  .status(401)
                  .send({ message: "access token has been tampered" });
              } else {
                await Comments.deleteByCommentId(commentId)
                res.status(200).send({ message: "comment successfully deleted" });
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
            .send({message: "refresh token is outdated, pleaes log in again"});
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
          const findUserIdBycommentId = await Comments.findUserIdByCommentId(
            commentId
          );
            await Users.findUser(email)
              .then(async (data: any) => {
                if (data.id !== findUserIdBycommentId.userId) {
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
              .catch((err: string) => console.log(err));
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
  },
  recentComments: async (req: Request, res: Response) => {
    try {
      const accessTokenData = req.headers.authorization;
      const contentId = req.body.contentId; //배열임
      if(typeof contentId !== "object") {
        res.status(404).send({message: "wrong input"}) 
      } else {
        let result: any[]= new Array;
        if(accessTokenData) {
          if(isAuthorized(req)) {
            for(let el of contentId) {
              await Comments.findCommentByContentId(el)
              .then(async (data: any) => {
                for(let eachComment of data) {
                  const nickname: any = await Users.nicknameByUserId(eachComment.userId);
                  let comment = {
                    nickname: nickname.nickname,
                    cratedAt: eachComment.createdAt,
                    text: eachComment.text
                  }
                  result.push(comment);
                }
              })
            }
            res.send({
              data: result
            })
          } else {
            res.status(401).send({message: "access token has been tampered"})
          }
        } else {
          res.status(404).send({message: "err"})
        }
      }
    } catch(e) {
      res.status(500).send({ message: "err" });
      throw new Error(e);
    }
  }
};
export default controllers;

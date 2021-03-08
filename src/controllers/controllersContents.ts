import express, { Request, Response, NextFunction } from "express";
import "reflect-metadata";
import { getRepository } from "typeorm";
import { Users } from "../entity/Users";
import { Stamps } from "../entity/Stamps";
import { Contents } from "../entity/Contents";
import { Comments } from "../entity/Comments";
const { isAuthorized, generateAccessToken, checkRefeshToken } = require("./token");

const controllers = {
  postCcontet: async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken
      
      if (!refreshToken){
        res.status(401).send({message: "refresh token has been tempered"})
      } else if(!checkRefeshToken(refreshToken)){
        const checkRefreshToken = checkRefeshToken(refreshToken)
        res
          .status(201)
          .send({
            data : {
              accessToken: generateAccessToken(checkRefreshToken)
            },
            message : "New AccessToken, please restore and request again"
          })
      }else{
        await Contents.insertNewContent(
          req.body.title,
          req.body.content,
          req.body.weather,
          req.body.emotion,
          req.body.imgUrl,
          req.body.imgMain,
          req.body.isPublic
        );
        res.status(200).send("message : ok");
      }
    } catch(e) {
      throw new Error(e)
    }
  },
  getContents: async (req: Request, res: Response) => {
    try{
      const contents = await getRepository(Contents).find();
      console.log(contents);
      res.send(contents);
    } catch(e) {
      throw new Error(e)
    } 
  },
  getContent: async (req: Request, res: Response) => {
    try{
      const contentId: number = Number(req.query.contentId)
      console.log(contentId);
      console.log("----00000------------------------")
      const findId: any = await Contents.findSelectByContentsId(contentId);
      const getComment: any = await Comments.findCommentByContentId(contentId);
      const getContent: any = await Contents.findByContentsId(contentId);
      const getUserIdByContentsId: any = await Contents.findUserIdByContentsId(getContent.id);
      const getContentUser: any = await Users.findById(getUserIdByContentsId.userId)

      findId.nickname = getContentUser.nickname;
      for(let i: number = 0; i < getComment.length; i++) {
        await Users.findOne({id: getComment[i].userId})
        .then((data: any) => {
            getComment[i].nickname = data.nickname;
          })
          .catch(err => console.log(err));
        }
      for(let i: number = 0; i < getComment.length; i++) {
        const stampId: number = getComment[i].stampId
        await Stamps.findOne({id: stampId})
        .then((data: any) => {
          getComment[i].stampUrl = data.imgUrl
        })
        .catch(err => console.log(err));
      }

      res.status(200).send({
        data: {
          ...findId,
          comments: [
            ...getComment
          ],
        },
      });
    } catch(e) {
      res.status(500).send({ message: "err" });
      throw new Error(e);
    }
  },
  patchUcontent: async (req: Request, res: Response) => {  

  },
  delDcontent: async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken

      if(!refreshToken) {
        res.status(401).send({message: "refresh token has been tempered"})
      } else if (!checkRefeshToken(refreshToken)) {
        const checkRefreshToken = checkRefeshToken(refreshToken)
        res
          .status(201)
          .send({
            data : {
              accessToken: generateAccessToken(checkRefreshToken)
            },
            message : "New AccessToken, please restore and request again"
          })
      } else {
        await Contents.deleteByContentsId(req.body.contentId)
        res.status(200).send({message: "content successfully deleted"})
      }
    } catch(e) {
      throw new Error(e)
    } 
  },
  getPubliccontents: async (req: Request, res: Response) => {},
  
  postComment: async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if(isAuthorized(req)) {
        const findUserId: any = await Users.findOne({email: isAuthorized(req).email})
        const comment = new Comments();
        comment.text = req.body.text;
        comment.user = findUserId.id;
        comment.stamp = req.body.stampId;
        comment.content = req.body.contentId;
        await comment.save();
        res.send({
          message: "ok",
          data: {
            commentInfo:{   
              id: comment.content,
              userId: comment.user,
              nickname: isAuthorized(req).nickname,
              createdAt: comment.createdAt,
              updatedAt: comment.updatedAt,
              text: comment.text,
              stampId: comment.stamp
            },
          }
        })
      } else if(refreshToken) {
        const verifyRefreshToken: {
          name: string,
          nickname: string, 
          email: string, 
          mobile: string
          iat?: number, 
          exp?: number
        } = checkRefeshToken(refreshToken);
        const userEmail: string = verifyRefreshToken.email;
        const isTampered: any = await Users.findUser(userEmail);//true: 조작안됨, false: 조작됨
        const findUserIdByrefreshToken: any = await Users.findOne({email: verifyRefreshToken.email})
        console.log(typeof verifyRefreshToken.email)
        if(!isTampered) {
          res.status(401).send({"message": "refresh token has been tampered"});
        } else {
          const userInfo = {
            name: verifyRefreshToken.name,
            nickname: verifyRefreshToken.nickname,
            email: verifyRefreshToken.email,
            mobile: verifyRefreshToken.mobile,
          }
          const accessToken: string = generateAccessToken(userInfo)
          console.log("hello")
          const comment = new Comments();
          comment.text = req.body.text;
          comment.user = findUserIdByrefreshToken.id
          comment.stamp = req.body.stampId;
          comment.content = req.body.contentId;
          await comment.save();
          res.status(200)
          .send({
            message: "New AccessToken, please restore and request again",
            data: {
              accessToken: accessToken,
              commentInfo:{   
                id: comment.content,
                userId: comment.user,
                nickname: findUserIdByrefreshToken.nickname,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
                text: comment.text,
                stampId: comment.stamp
              }
            }
          })
        }
      }
    } catch(e) {
      res.status(500).send({ message: "err" });
    }
  },
  patchUcomment: async (req: Request, res: Response) => {},
  delDcomment: async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken

      if(!refreshToken) {
        res.status(401).send({message: "refresh token has been tempered"})
      } else if (!checkRefeshToken(refreshToken)) {
        const checkRefreshToken = checkRefeshToken(refreshToken)
        res
          .status(201)
          .send({
            data : {
              accessToken: generateAccessToken(checkRefreshToken)
            },
            message : "New AccessToken, please restore and request again"
          })
      } else if (refreshToken){
        await Comments.deleteByCommentId(req.body.commentId)
        res.status(200).send({message: "comment successfully deleted"})
      } else {
        res.status(500).send({message: "error"})
      }
    } catch(e) {
      throw new Error(e)
    } 
  },
  postCalendar: async (req: Request, res: Response) => {},
};
export default controllers;

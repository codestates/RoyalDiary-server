import express, { Request, Response, NextFunction } from "express";
import "reflect-metadata";
import { getRepository } from "typeorm";
import { Users } from "../entity/Users";
import { Stamps } from "../entity/Stamps";
import { Contents } from "../entity/Contents";
import { Comments } from "../entity/Comments";
const { isAuthorized,
  checkRefeshToken,
  generateRefreshToken ,
  generateAccessToken
} = require("./token");

const controllers = {
  postCcontet: async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken
      
      if(!req.body.title||!req.body.content||!req.body.weather||!req.body.emotion||!req.body.imgUrl||!req.body.isPublic) {
        res.status(404).send({message: "error occured"})
      } else if (!refreshToken){
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
          req.body.isPublic
        );
        res.status(200).send("message : ok");
      }
    } catch(e) {
      throw new Error(e)
    }
  },
  getContents: async (req: Request, res: Response) => {
    const contents = await getRepository(Contents).find();
    console.log(contents);
    res.send(contents);
  },
  getContent: async (req: Request, res: Response) => {
    try{
      const findId = await Contents.findSelectByContentsId(req.body.contentId);
      const getComment: any = await Comments.getCommentByContentId(req.body.contentId);
      
      findId.nickname = isAuthorized(req).nickname;

      for(let i: number = 0; i < getComment.length; i++) {
        await Users.findOne({id: getComment[i].userId})
        .then((data: any) => {
            console.log(data)
            getComment[i].nickname = data.nickname;
          })
          .catch(err => console.log(err));
        }
      for(let i: number = 0; i < getComment.length; i++) {
        const stampId: number = getComment[i].stampId
        await Stamps.findOne({id: stampId})
        .then((data: any) => {
          console.log(data)
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

  postComment: async (req: Request, res: Response) => {},
  patchUcomment: async (req: Request, res: Response) => {},
  delDcomment: async (req: Request, res: Response) => {

  },
  postCalendar: async (req: Request, res: Response) => {},
};
export default controllers;

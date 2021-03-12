import express, { Request, Response} from "express";
import "reflect-metadata";
import { Users } from "../../entity/Users";
import { Comments } from "../../entity/Comments";
const {
    isAuthorized
  } = require("../token");

export default async (req: Request, res: Response) => {
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

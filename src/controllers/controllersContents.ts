import express, { Request, Response, NextFunction } from "express";
import "reflect-metadata";
import { getRepository } from "typeorm";
import { Users } from "../entity/Users";
import { Stamps } from "../entity/Stamps";
import { Contents } from "../entity/Contents";
import { Comments } from "../entity/Comments";
const { isAuthorized } = require("./token");

const controllers = {
  testpage: async (req: Request, res: Response) => {
    console.log("testpage");
    const findUsers = await getRepository(Users).find();
    //const findNumber = await Users.findBytest(Number(req.params.id));
    const deleteContent = await Contents.deleteByContentsId(
      Number(req.params.id)
    );
    //http://localhost:4000/contents/testpage/1 <-- deleted
    console.log(deleteContent);
    res.send(deleteContent);
  },
  postCcontet: async (req: Request, res: Response) => {},
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
      console.log(findId);

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

    /*
        { 
  "data": {
      "id": "id"
      "nickname": "nickname"
      "title": "title"
      "content": "content"
      "weather": "weather"
      "emotion": "emotion"
      "views": "views"
      "imgUrl": "imgUrl"
      "createdAt": "createdAt"
      "updatedAt": "updatedAt"
      "comments": [
                  {
                    "nickname": "nickname"
                    "commentId": "commentId"
                    "createdAt": "createdAt"
                    "updatedAt": "updatedAt"
                    "stampId": "stampId"
                    "stampUrl": "stampUrl"
                  }
        ]
    }
}
        */
  },
  patchUcontent: async (req: Request, res: Response) => {
    await Contents.insertNewContent(
      req.body.title,
      req.body.content,
      req.body.weather,
      req.body.emotion,
      req.body.views,
      req.body.imgUrl,
      req.body.isPublic
    );

    return res.send("message : ok");
  },
  delDcontent: async (req: Request, res: Response) => {
    await Contents.deleteByContentsId(Number(req.params.id));
  },
  getPubliccontents: async (req: Request, res: Response) => {},
  postComment: async (req: Request, res: Response) => {},
  patchUcomment: async (req: Request, res: Response) => {},
  delDcomment: async (req: Request, res: Response) => {
    //const deleteContent = await Contents.deleteByContentsId(Number(req.params.id))
  },
  postCalendar: async (req: Request, res: Response) => {},
};
export default controllers;

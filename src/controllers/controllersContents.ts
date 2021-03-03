import express, { Request, Response, NextFunction } from "express";
import "reflect-metadata";
import { getRepository } from "typeorm";
import { Users } from "../entity/Users";
import { Stamps } from "../entity/Stamps";
import { Contents } from "../entity/Contents";
import { Comments } from "../entity/Comments";
const { isAuthorized, checkRefeshToken } = require("./token");

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
      const findId: any = await Contents.findSelectByContentsId(req.body.contentId);
      const getComment: any = await Comments.getCommentByContentId(req.body.contentId);
      const getUserId: any = await Contents.findByContentsId(req.body.contentId);
      const findIdByContentsId: any = await Contents.findUserIdByContentsId(getUserId.id);
      const getContentUser: any = await Users.findById(findIdByContentsId.userId)

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
  
  postComment: async (req: Request, res: Response) => {
    // try {
    //   const refreshToken = req.cookies.refreshToken;
    //   const isTampered = await Users.findUser(refreshToken.email)
    //   if(isAuthorized(req)) {
    //     //200
    //   } else if(리프레시토큰 정보 맞는지 확인) {
    //     //리프레시 토큰이 있는가
    //     //리프레시 토큰 조작되었는가

    //     //201
    //   } else if()
    // } catch(e) {

    // }
    //accessToken, stampId(옵션), contentId, text를 받는다.
    //200 액세스토큰이 있다
    // {
    //   "message": "ok",
    //   "data": {
    //     "commentInfo":{   
    //       "id": "contentId",
    //       "userId":"userId",
    //       "nickname":"nickname",
    //       "createdAt":"createdAt",
    //       "updatedAt": "updatedAt",
    //       "text":"text",
    //       "stampId":"stampId"
    //     },
    //   }
    // }
    //201 액세스토큰은 없는데 리프레시 토큰 정보가 맞으면
    // {
    //   "message": "New AccessToken, please restore and request again",
    //   "data": {
    //     "accessToken": "accessToken"
    //     "commentInfo":{   
    //       "id": "contentId",
    //       "userId":"userId",
    //       "nickname":"nickname",
    //       "createdAt":"createdAt",
    //       "updatedAt": "updatedAt",
    //       "text":"text",
    //       "stampId":"stampId"
    //     }
    //   }
    // }
    //401 엑세스토큰은 없는데 리프레시 토큰 있는데 정보가 안 맞으면
    //500 서버에러

  },
  patchUcomment: async (req: Request, res: Response) => {},
  delDcomment: async (req: Request, res: Response) => {
    //const deleteContent = await Contents.deleteByContentsId(Number(req.params.id))
  },
  postCalendar: async (req: Request, res: Response) => {},
};
export default controllers;

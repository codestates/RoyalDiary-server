import express, { Request, Response} from "express";
import "reflect-metadata";
import { Users } from "../../entity/Users"
import { Contents } from "../../entity/Contents";
import { Comments } from "../../entity/Comments";

export default async (req: Request, res: Response) => {
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
}

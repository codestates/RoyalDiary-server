import express, { Request, Response} from "express";
import "reflect-metadata";
import { Users } from "../../entity/Users"
import { Contents } from "../../entity/Contents";

export default async (req: Request, res: Response) => {
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

      const countIsPublicTrueContents: any = await Contents.find({
        select: ["id", "title", "imgUrl", "createdAt"],
        where : [{"isPublic" : true} ],
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
        const count = countIsPublicTrueContents.length;
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
}

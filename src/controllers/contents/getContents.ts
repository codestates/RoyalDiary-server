import express, { Request, Response} from "express";
import "reflect-metadata";
import { Users } from "../../entity/Users"
import { Contents } from "../../entity/Contents";

const {
    isAuthorized
  } = require("../token");

export default async (req: Request, res: Response) => {
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
          select: ["id", "title", "imgUrl", "createdAt", "updatedAt"],
          order: {
            createdAt: "DESC",
          },
          skip,
          take: 9,
        });
        const allContentOrderByLikes: any = await Contents.find({
          where: { user: findUser.id },
          select: ["id", "title", "imgUrl", "createdAt", "updatedAt"],
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
  }

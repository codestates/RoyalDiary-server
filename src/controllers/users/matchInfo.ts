import "reflect-metadata";
import { Request, Response } from "express";
import { Users } from "../../entity/Users";

export default async (req: Request, res: Response) => {
    try {
      const email: string = req.body.email;
      const mobile: string = req.body.mobile;
      const nickname: string = req.body.nickname;
      if (email) {
        const isEmail: Users | undefined = await Users.findOne({
          email: email,
        });
        isEmail
          ? res.send({ message: "email already exists" })
          : res.send({ message: "email is usable" });
      } else if (mobile) {
        const isMobile: Users | undefined = await Users.findOne({
          mobile: mobile,
        });
        isMobile
          ? res.send({ message: "mobile already exists" })
          : res.send({ message: "mobile is usable" });
      } else if (nickname) {
        const isNickname: Users | undefined = await Users.findOne({
          nickname: nickname,
        });
        isNickname
          ? res.send({ message: "nickname already exists" })
          : res.send({ message: "nickname is usable" });
      }
    } catch (e) {
      res.status(500).send({ message: "err" });
      throw new Error(e);
    }
  }


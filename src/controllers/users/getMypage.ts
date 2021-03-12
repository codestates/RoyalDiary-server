import "reflect-metadata";
import { Request, Response } from "express";
import { Users } from "../../entity/Users";
import { Contents } from "../../entity/Contents";
const { isAuthorized } = require("../token");

export default async (req: Request, res: Response) => {
  try {
    if (isAuthorized(req) === null) {
      res.send({ message: "cannot find user" });
    } else {
      const findUser: any = await Users.findUser(isAuthorized(req).email);
      const findDiaryByAccessToken = await Contents.findDiaryListById(
        findUser.id
      );
      res.send({
        name: isAuthorized(req).name,
        email: isAuthorized(req).email,
        nickname: isAuthorized(req).nickname,
        mobile: isAuthorized(req).mobile,
        contents: findDiaryByAccessToken,
      });
    }
    console.log(isAuthorized(req));
  } catch (e) {
    res.status(500).send({ message: "err" });
    throw new Error(e);
  }
};


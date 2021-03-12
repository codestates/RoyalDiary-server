import "reflect-metadata";
import { Request, Response } from "express";
import { Users } from "../../entity/Users";
const { checkRefeshToken, isAuthorized } = require("../token");

export default async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (isAuthorized(req)) {
      const { email } = isAuthorized(req);
      await Users.findUser(email)
        .then(async (data: any) => {
          if (!data) {
            res.status(400).send({ message: "access token has been tampered" });
          } else {
            await Users.delete({ email });
            res
              .status(200)
              .send({ message: "delete user information successfully" });
          }
        })
        .catch((err: string) => console.log(err));
    } else {
      if (!refreshToken) {
        res.status(401).send({ message: "refresh token not provided" });
      } else if (!checkRefeshToken(refreshToken)) {
        res.status(202).send({
          message: "refresh token is outdated, pleaes log in again",
        });
      } else {
        const { email } = checkRefeshToken(refreshToken);
        await Users.findUser(email)
          .then(async (data: any) => {
            if (!data) {
              res
                .status(400)
                .send({ message: "refresh token has been tampered" });
            } else {
              await Users.delete({ email });
              res
                .status(200)
                .send({ message: "delete user information successfully" });
            }
          })
          .catch((err: string) => console.log(err));
      }
    }
  } catch (e) {
    res.status(500).send({ message: "server error" });
  }
};

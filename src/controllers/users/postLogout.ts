import "reflect-metadata";
import { Request, Response } from "express";

export default async (req: Request, res: Response) => {
  try {
    const authorization: string | undefined = req.headers["authorization"];
    if (authorization) {
      res
        .clearCookie("refreshToken")
        .status(200)
        .send({ message: "successfully signed out!" });
    } else {
      res.status(404).send({ message: "no accesstoken" });
    }
  } catch (e) {
    res.status(500).send({ message: "err" });
    throw new Error(e);
  }
};


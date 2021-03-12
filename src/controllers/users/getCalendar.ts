import "reflect-metadata";
import { Request, Response } from "express";
import { Contents } from "../../entity/Contents";

export default async (req: Request, res: Response) => {
  try {
    const findByCreatedAt = await Contents.findByCreatedAt(
      req.query.date as string
    );
    if (findByCreatedAt.length === 0) {
      res.status(404).send({ message: "err" });
    } else {
      // console.log(findByCreatedAt);
      res.status(200).send({ data: findByCreatedAt });
    }
  } catch (e) {
    res.status(500).send({ message: "err" });
    throw new Error(e);
  }
};

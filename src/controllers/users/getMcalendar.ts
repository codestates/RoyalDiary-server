import "reflect-metadata";
import { Request, Response } from "express";
import { Contents } from "../../entity/Contents";

export default async (req: Request, res: Response) => {
  try {
    const findByMonth = await Contents.findByMonth(req.query.date as string);
    if (findByMonth.length === 0) {
      res.status(404).send({ message: "err" });
    } else {
      res.status(200).send({ data: findByMonth });
    }
  } catch (e) {
    res.status(500).send({ message: "err" });
    throw new Error(e);
  }
};

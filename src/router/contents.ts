import express, { Request, Response, NextFunction } from "express";
import { createConnection } from "typeorm";
import { Users } from "../entity/Users";
import controller from "../controllers/controllersContents";
const router = express.Router();

router.post("/ccontent", controller.postCcontet);

router.get("/contents", controller.getContents);

router.get("/content", controller.getContent);

router.patch("/ucontent", controller.patchUcontent);

router.delete("/dcontent", controller.delDcontent);

router.get(
  "/publiccontents",
  (req: Request, res: Response, next: NextFunction) => {
    res.send("publiccontents");
  }
);

router.post("/comment", (req: Request, res: Response, next: NextFunction) => {
  res.send("comment");
});

router.patch("/ucomment", controller.patchUcomment);

router.delete(
  "/dcomment",
  (req: Request, res: Response, next: NextFunction) => {
    res.send("dcomment");
  }
);

router.post("/calendar", (req: Request, res: Response, next: NextFunction) => {
  res.send("calendar");
});

export = router;

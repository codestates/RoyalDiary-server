import express, { Request, Response, NextFunction } from "express";
import { createConnection } from "typeorm";
import { Users } from "../entity/Users";
import controller from "../controllers/controllersContents";
const router = express.Router();

router.post("/ccontent", controller.postCcontet);

router.get("/content", controller.getContent);

router.get("/contents", controller.getContents);

router.patch("/ucontent", controller.patchUcontent);

router.delete("/dcontent", controller.delDcontent);

router.post("/comment", controller.postComment);

router.get("/publiccontents",controller.getPublicContents); //postman test : GET, http://localhost:4000/contents/publiccontents?page=1

router.patch("/ucomment", controller.patchUcomment);

router.delete("/dcomment",controller.delDcomment);

router.get("/rcomment", controller.recentComments);

//router.post("/calendar", (req: Request, res: Response, next: NextFunction) => {
//  res.send("calendar");
//});

export = router;

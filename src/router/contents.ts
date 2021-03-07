import express, { Request, Response, NextFunction } from "express";
import { createConnection } from "typeorm";
import { Users } from "../entity/Users";
import controller from "../controllers/controllersContents";
const router = express.Router();

router.post("/ccontent", controller.postCcontet);

// router.get("/contents", controller.getContents);

router.get("/content", controller.getContent);

// router.patch("/ucontent", controller.patchUcontent);

router.delete("/dcontent", controller.delDcontent);

router.post("/comment", controller.postComment);

// router.get(
//   "/publiccontents",
//   (req: Request, res: Response, next: NextFunction) => {
//     res.send("publiccontents");
//   }
// );

// router.patch("/ucomment", controller.patchUcomment);

router.delete("/dcomment",controller.delDcomment);

// router.post("/calendar", (req: Request, res: Response, next: NextFunction) => {
//   res.send("calendar");
// });

export = router;

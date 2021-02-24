import express, { Request, Response, NextFunction } from "express";
import contents from "../controllers/controllersContents";

const router = express.Router();

router.get("/",(req: Request, res: Response, next: NextFunction) => {

})

router.post("/ccontent",(req: Request, res: Response, next: NextFunction) => {
    res.send("ccontent");
})

router.get("/contents",(req: Request, res: Response, next: NextFunction) => {
    res.send("contents");
})

router.get("/content",(req: Request, res: Response, next: NextFunction) => {
    res.send("content");
})

router.patch("/ucontent",(req: Request, res: Response, next: NextFunction) => {
    res.send("ucontent");
})

router.delete("/dcontent",(req: Request, res: Response, next: NextFunction) => {
    res.send("dcontent");
})

router.get("/publiccontents",(req: Request, res: Response, next: NextFunction) => {
    res.send("publiccontents");
})

router.post("/comment",(req: Request, res: Response, next: NextFunction) => {
    res.send("comment");
})

router.patch("/ucomment",(req: Request, res: Response, next: NextFunction) => {
    res.send("ucomment");
})

router.delete("/dcomment",(req: Request, res: Response, next: NextFunction) => {
    res.send("dcomment");
})

router.post("/calendar",(req: Request, res: Response, next: NextFunction) => {
    res.send("calendar");
})


export = router;
import express, { Request, Response, NextFunction } from "express";
import { createConnection } from "typeorm";
import {Users} from "../entity/Users";
import controller from "../controllers/controllersContents"
const router = express.Router();

/* test */

// createConnection().then (async connection => {
//     const userRepository = connection.getRepository(Users);

    
// router.get("/test",(req: Request, res: Response, next: NextFunction) => {
//     //contents.userInfo
//     //res.send(contents.userInfo)
//     res.json("testpage")
// })

// router.get("/find-testpage",controller.testpage)

// router.get("/findOne-testpage/:id",async (req: Request, res: Response, next: NextFunction) => {
//     console.log("findOne test") 
//     //http://localhost:4000/contents/findOne-testpage/2 <--- id 2 deleted

//         const results = await userRepository.findOne(req.params.id);
//         //const results = await userRepository.delete(req.params.id);   <--- delete
//         return res.send(results);

// })

// router.delete("/delete/:id", async (req: Request, res: Response) => {
//     console.log("deleted")
//     const userRepository = connection.getRepository(Users);
//     const results = await userRepository.delete(req.params.id);
//     return res.send(results);
// });

/////////////////////////////////////////////////////////////////////////







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

// })
export = router;
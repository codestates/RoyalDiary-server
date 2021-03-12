import express from "express";
import postCcontent from "../controllers/contents/postCcontent";
import getContent from "../controllers/contents/getContent";
import getContents from "../controllers/contents/getContents";
import patchUcontent from "../controllers/contents/patchUcontent";
import delDcontent from "../controllers/contents/delDcontent";
import postComment from "../controllers/contents/postComment";
import getPublicContents from "../controllers/contents/getPublicContents";
import patchUcomment from "../controllers/contents/patchUcomment";
import delDcomment from "../controllers/contents/delDcomment";
import recentComments from "../controllers/contents/recentComments";

const router = express.Router();

router.post("/ccontent", postCcontent);

router.get("/content", getContent);

router.get("/contents", getContents);

router.patch("/ucontent", patchUcontent);

router.delete("/dcontent", delDcontent);

router.post("/comment", postComment);

router.get("/publiccontents", getPublicContents);

router.patch("/ucomment", patchUcomment);

router.delete("/dcomment", delDcomment);

router.get("/rcomment", recentComments);

export = router;

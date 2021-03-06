import express, { Request, Response, NextFunction } from "express";
import users from "../controllers/controllersUsers";

const router = express.Router();

//회원가입 회원가입 - post signup
router.post("/signup", users.postSignup);

//회원가입 중복확인 - post matchinfo
router.post("/matchinfo", users.matchInfo);

//첫 화면 로그인 - post login
router.post("/login", users.postLogin);
//첫 화면 로그아웃 - post logout
router.post("/logout", users.postLogout);
// //첫 화면 oAuth - post oAuth
// router.post('/oauth', users.postOauth);
//나의 정보 - get callendar
router.get("/calendar", users.getCalendar);
//나의 정보 - get callendar month
//router.get("/mcalendar", users.getMcalendar);

//나의 정보 - get mypage
router.get("/mypage", users.getMypage);

//나의 정보 - delete user
router.delete("/mypage", users.delDuser);

export default router;

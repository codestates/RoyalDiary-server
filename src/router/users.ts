import express from "express";
import getCalendar from "../controllers/users/getCalendar";
import getMcalendar from "../controllers/users/getMcalendar";
import getMypage from "../controllers/users/getMypage";
import postSignup from "../controllers/users/postSignup";
import matchInfo from "../controllers/users/matchInfo";
import postLogin from "../controllers/users/postLogin";
import postLogout from "../controllers/users/postLogout"
import isEmail from "../controllers/users/isEmail";
import auth from "../controllers/users/auth";
import delDuser from "../controllers/users/delDuser";

const router = express.Router();
//나의 정보 - get callendar
router.get("/calendar", getCalendar);
//나의 정보 - get callendar month
router.get("/mcalendar", getMcalendar);
//나의 정보 - get mypage
router.get("/mypage", getMypage);
//회원가입 회원가입 - post signup
router.post("/signup", postSignup);
//회원가입 중복확인 - post matchinfo
router.post("/matchinfo", matchInfo);
//첫 화면 로그인 - post login
router.post("/login", postLogin);
//첫 화면 로그아웃 - post logout
router.post("/logout", postLogout);
//첫 화면 oauth email - post isemail
router.post("/isemail", isEmail);
//첫 화면 auth - post auth
router.post("/auth", auth);
//나의 정보 - delete user
router.delete("/mypage", delDuser);


export default router;

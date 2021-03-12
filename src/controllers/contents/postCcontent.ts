import express, { Request, Response} from "express";
import "reflect-metadata";
import { Users } from "../../entity/Users"
import { Contents } from "../../entity/Contents";
const {
  isAuthorized,
  checkRefeshToken,
} = require("../token");

export default async (req: Request, res: Response) => {
        try {
          const accessTokenData = req.headers.authorization;
          const refreshToken = req.cookies.refreshToken;
          
          if (accessTokenData) {
            if(!isAuthorized(req)){
              res
              .status(400)
              .send({ message: "access token has been tampered" });
            } else {
              const {email} = isAuthorized(req);
    
              const findUser: any = await Users.findUser(email)
              //const findUser: any = await Users.findOne({email})
              console.log(findUser)
    
              const content = new Contents();
              content.user = findUser.id;
              content.imgMain = req.body.imgMain;
              content.title = req.body.title;
              content.content = req.body.content;
              content.weather = req.body.weather;
              content.emotion = req.body.emotion;
              content.imgUrl = req.body.imgUrl;
              content.isPublic = req.body.isPublic;
              await content.save()
                .catch((err: string) => console.log(err));
              res.status(200).send({message : "ok"});
            }
          } 
          else if (!accessTokenData) {
          //   res.status(401).send("access token has been tampered");
          // } else {
            if (!refreshToken) {
              //!리프레시 토큰이 없는 경우 401
              res.status(401).send({ message: "refresh token not provided" });
            } else if (!checkRefeshToken(refreshToken)) {
              //!리프레시 토큰이 유효하지 않은 경우 202
              res
                .status(202)
                .send({
                  message: "refresh token is outdated, pleaes log in again",
                });
            } else {
              //!리프레시 토큰이 유효하고
    
                  if (!isAuthorized(req)) {
                    //!액세스 토큰의 정보가 데이터베이스에 존재하지 않을 때 400//!리프레시 토큰의 정보가 데이터베이스에 존재하지 않을 때 400
                    res
                      .status(400)
                      .send({ message: "refresh token has been tampered" });
                  } else {
                    //!리프레시 토큰의 정보가 데이터베이스에 존재할 때 201
    
                    const { email } = isAuthorized(req);
          
                    const findUser: any = await Users.findOne(email)
            
                    const content = new Contents();
                    content.user = findUser.id;
                    content.imgMain = req.body.imgMain;
                    content.title = req.body.title;
                    content.content = req.body.content;
                    content.weather = req.body.weather;
                    content.emotion = req.body.emotion;
                    content.imgUrl = req.body.imgUrl;
                    content.isPublic = req.body.isPublic;
                    await content.save()
                      .catch((err: string) => console.log(err));
                    res.status(200).send({message : "ok"});
                  }
              }
          }
        } catch (e) {
          res.status(500).send({ message: "err" });
          throw new Error(e);
        }
      
}
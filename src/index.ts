import express, { Request, Response, NextFunction } from "express";
import "reflect-metadata";
import { createConnection } from "typeorm";
import contents from "./router/contents";
import users from "./router/users";
require("dotenv").config();
const cors = require("cors");
const cookieparser = require("cookie-parser");
const app = express();
const config: any = {
  type: process.env.TYPEORM_CONNECTION,
  host: process.env.TYPEORM_HOST,
  port: process.env.TYPEORM_PORT,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  synchronize: false,
  logging: true,
  entities: [__dirname + "/entity/*.ts"],
  migrations: [__dirname + "/migration/**/*.ts"],
  subscribers: [__dirname + "/subscriber/**/*.ts"],
  // entities: ["src/entity/**/*.ts"],
  // migrations: ["src/migration/**/*.ts"],
  // subscribers: ["src/subscriber/**/*.ts"],
  cli: {
    entitiesDir: __dirname + "/entity",
    migrationsDir: __dirname + "/migration",
    subscribersDir: __dirname + "/subscriber",
    // entitiesDir: "src/entity",
    // migrationsDir: "src/migration",
    // subscribersDir: "src/subscriber",
  },
};
/******************multer setting***********************/
const multer = require('multer');
const path = require('path'); //@types가 없었다 작동 되는지 확인 필요
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION,
});

const upload = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: 'royaldiarymulter',
    acl: 'public-read',
    key: async (req: Request, file: any, cb: Function) => {
      try {
        let extension: string = await path.extname(file.originalname);
        cb(null, Date.now().toString() + extension);
      } catch(e) {
        throw new Error(e);
      }
    },
    //!멀터에 에러핸들링 문제로 오류가 나타난다는 글을 봐서 수정해놓는다. 에러가 계속 일어난다면 원래대로 되돌릴 것
    // key: function (req: Request, file: any, cb: Function) {
    //   let extension: string = path.extname(file.originalname);
    //   cb(null, Date.now().toString() + extension);
    // },
  }),
  limits: { fieldSize: 5 * 1024 * 1024 },//파일사이즈 제한
});
/*****************************************/

createConnection(config)
  .then(() => {
    console.log("typeorm connected");
  })
  .catch((err) => {
    console.log("typeorm error", err);
  });

app.use(express.json({
  limit: "10mb"
})); //익스프레스는 바디파서 대신 쓰는거! 바디파서는 받지않아도 된다!
app.use(cookieparser());
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PATCH", "OPTIONS"],
  })
);

//!process.on 은 작동이 안 될 때만 사용할 것
process.on('uncaughtException', (err) => {
  console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
  console.error(err.stack)
  process.exit(1)
})


app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("Hello world!");
});

/*********************multercode********************/
declare global { // req.file.location 때문에 추가한 타입 선언
  namespace Express {
      namespace Multer {
          interface File {
              location: string;
          }
      }
  }
}
app.post('/image', upload.single('img'), async (req, res) => {
  try {
    console.log('req.file: ', req.file.location);
    res.status(200).send({ imgUrl: req.file.location });
  } catch (err) {
    res.status(500).send('err');
  }
});
/*****************************************/

app.use("/contents", contents);
app.use("/users", users);

app.listen(4000, () => {
  console.log("Server is running!");
});

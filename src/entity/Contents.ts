import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  BaseEntity,
  Between,
  OneToOne,
} from "typeorm";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { Comments } from "./Comments";
import { Users } from "./Users";
import { String } from "aws-sdk/clients/acm";

@Entity()
export class Contents extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  weather: string;

  @Column()
  emotion: string;

  @Column()
  views: number;

  @Column("longtext")
  imgMain: string;

  @Column()
  imgUrl: string;

  //   @Column()
  //   userId: number;

  @Column()
  isPublic: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  /* contents(one) to comments(Many) */
  @OneToMany((type) => Comments, (comments) => comments.content, { cascade: true })
  comments: Comments[];

  /* contents(one) & comment(many) */
  @ManyToOne((type) => Users, (users) => users.id, { onDelete: "CASCADE" })
  user: Users;
/*
          'id',
          'title',
          'content',
          'thumbnail_url',
          'createdAt',
          'views',
          'userId',
          'categoryId',

 static findContentsByContentId(skip: number):Promise<Contents[] | undefined> {
    return (
      this.createQueryBuilder("contents")
        .select("id", "contents")
        .addSelect("title")
        .addSelect("content")
        .addSelect("stampId")
        .addSelect("userId")
        .where("comments.content = :content", { content })
        .getRawMany()
    );
*/
   

  static findByContentsId(id: number) {
    return this.createQueryBuilder("contents")
      .where("contents.id = :id", { id })
      .getOne();
  }
  static findUserIdByContentsId(id: number) {
    return this.createQueryBuilder("contents")
      .select("userId")
      .where("contents.id = :id", { id })
      .getRawOne();
  }

  static deleteByContentsId(id: number) {
    return this.createQueryBuilder("contents")
      .delete()
      .from(Contents)
      .where("id = :id", { id })
      .execute();
  }
  static insertNewContent(
    title: string,
    content: string,
    weather: string,
    emotion: string,
    imgUrl: string,
    imgMain : string,
    isPublic: boolean
  ) {
    return this.createQueryBuilder()
      .insert()
      .into(Contents)
      .values([{ title, content, weather, emotion, imgUrl, imgMain, isPublic }])
      .execute();
  }
  static findDiaryListById(userId: number): Promise<Contents[]> {
    return this.createQueryBuilder("contents")
      .select("title")
      .addSelect("id", "contentId")
      .addSelect("createdAt")
      .where("contents.userId = :userId", { userId })
      .getRawMany();
  }
  static findByCreatedAt(date: string): Promise<Contents[]> {
    const startDate: Date = startOfDay(parseISO(date));
    const endDate: Date = endOfDay(parseISO(date));
    return (
      this.createQueryBuilder("Contents")
        .select("title")
        .addSelect("imgUrl")
        .addSelect("createdAt")
        .where("createdAt > :startDate AND createdAt < :endDate", {
          startDate,
          endDate,
        })
        //between을 사용한 날짜 지정은 작동하지 않는다. invalid date가 뜬다
        //해결됐다! invalid date는 date-fns의 parseISO메소드로 문자열로 온 시간을 date화 시켜서 해결했다.
        //where은 첫 번째 인자에서 쿼리문을 사용하고, 두 번째 인자에서 쿼리문에서 사용한 변수를 정의한다.
        .getRawMany()
    );
  }
  static findByMonth(date: string): Promise<Contents[]> {
    console.log(date)
    console.log("--------------------------------")
    const dateFormat: Date = parseISO(date);
    const monthStart: Date = startOfMonth(dateFormat); 
    const monthEnd: Date = endOfMonth(dateFormat);
    return (
      this.createQueryBuilder("contents")
      .select("title")
      .addSelect("imgUrl")
      .addSelect("createdAt")
      .where("createdAt > :monthStart AND createdAt < :monthEnd", {
        monthStart,
        monthEnd,
      })
    )
    .getRawMany()
  }

  static findSelectByContentsId(id: number) {
    return this.createQueryBuilder("contents")
      .select("id")
      .addSelect("title")
      .addSelect("content")
      .addSelect("weather")
      .addSelect("emotion")
      .addSelect("views")
      .addSelect("imgUrl")
      .addSelect("imgMain")
      .addSelect("createdAt")
      .addSelect("updatedAt")
      .where("contents.id = :id", { id })
      .getRawOne();
  }
}

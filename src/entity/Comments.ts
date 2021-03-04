import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  BaseEntity,
} from "typeorm";
import { Users } from "./Users";
import { Stamps } from "./Stamps";
import { Contents } from "./Contents";

@Entity()
export class Comments extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  text: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  /* users(one) & comment(many) */
  @ManyToOne((type) => Users, (users) => users.id)
  user: Users;

  /* stamps(one) & comment(many) */
  @ManyToOne((type) => Stamps, (stamps) => stamps.id)
  stamp: Stamps;

  /* contents(one) & comment(many) */
  @ManyToOne((type) => Contents, (contents) => contents.id)
  content: Contents;

  static getCommentByContentId(content: number):Promise<Comments[] | undefined> {
    return (
      this.createQueryBuilder("comments")
        .select("id", "commentId")
        .addSelect("createdAt")
        .addSelect("updatedAt")
        .addSelect("stampId")
        .addSelect("userId")
        .where("comments.content = :content", { content })
        .getRawMany()
    );
    /*
        SELECT id as commentId, stampId, createdAt, updatedAt  FROM comments
        LEFT JOIN comment.userId 
        WHERE comments.contentId = :contentId 
        */
  }
}

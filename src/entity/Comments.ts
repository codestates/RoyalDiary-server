import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  BaseEntity,
  JoinColumn
} from "typeorm";
import { Users } from "./Users";
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
  @ManyToOne((type) => Users, (users) => users.id, { onDelete: "CASCADE" })
  @JoinColumn({name: 'userId'})
  user: Users;

  /* stamps(one) & comment(many) */
  @Column()
  stampId?: number;

  /* contents(one) & comment(many) */
  @ManyToOne((type) => Contents, (contents) => contents.id, { onDelete: "CASCADE" })
  @JoinColumn({name: 'contentId'})
  content: Contents;

  static deleteByCommentId(id: number) {
    return this.createQueryBuilder("comments")
      .delete()
      .from(Comments)
      .where("id = :id", { id })
      .execute();
  }
  static findCommentByContentId(content: number):Promise<Comments[] | undefined> {
    return (
      this.createQueryBuilder("comments")
        .select("id", "commentId")
        .addSelect("createdAt")
        .addSelect("updatedAt")
        .addSelect("stampId")
        .addSelect("text")
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
  static findById(id: number) {
    return this.createQueryBuilder("comments")
      .where("comments.id = :id", { id })
      .getOne()
  }
  static findUserIdByCommentId(id: number) {
    return this.createQueryBuilder("comments")
    .select("userId")
      .where("comments.id = :id", { id })
      .getRawOne();
  }
}

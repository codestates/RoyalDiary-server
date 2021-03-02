import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, BaseEntity } from "typeorm";
import {Users} from "./Users"
import {Stamps} from "./Stamps"
import {Contents} from "./Contents"

@Entity()
export class Comments  extends BaseEntity{

    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    text: string;

//    @Column()
//    stampId: string;

//    @Column()
//    userId: number;

    //@Column()
    //contentId: number;
    

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    createdAt: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    updatedAt: Date;

    /* users(one) & comment(many) */
    @ManyToOne(
        type => Users,
        users => users.id,
    )
    userId : Users

    /* stamps(one) & comment(many) */
    @ManyToOne(
        type => Stamps,
        stamps => stamps.id
    )
    stampId : Stamps

    /* contents(one) & comment(many) */
    @ManyToOne(
        type => Contents,
        contents => contents.id
    )
    contentId : Contents

    /*
                username : ,
                stampUrl :
                commentId : ,
                createdAt : ,
                updatedAt : ,
                stampId : ,

    */
    static getCommentByContentId(contentId : number) {
        return this.createQueryBuilder("comments")
        .select("id","commentId") //get id ---> that name : commentId
        .addSelect("stampId")
        .addSelect("createdAt")
        .addSelect("updatedAt")
        .leftJoin("comment.userId","users")
        //leftjoinAndmapone -----?
        .addSelect("users.nickname","username")
        .leftJoin("comment.stampsId","stamps")
        .addSelect("stamps.stampUrl","stampUrl")
        .where("comments.contentId = :contentId",{contentId})
        .getRawMany();
        /*
        SELECT id as commentId, stampId, createdAt, updatedAt  FROM comments
        LEFT JOIN comment.userId 
        WHERE comments.contentId = :contentId 
        */
    }

}
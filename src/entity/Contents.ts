
import {Entity, Column, PrimaryGeneratedColumn,OneToMany,ManyToOne} from "typeorm";
import {Comments} from "./Comments"
import {Users} from "./Users"

@Entity()
export class Contents {

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

    @Column()
    imgUrl: string;

 //   @Column()
 //   userId: number;

    @Column()
    isPublic: boolean;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    createdAt: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    updatedAt: Date;

    /* contents(one) to comments(Many) */
    @OneToMany(
        type => Comments,
        comments => comments.contentId
    )
    comments : Comments[]

    /* contents(one) & comment(many) */
    @ManyToOne(
        type => Users,
        users => users.id
    )
    userId : Contents
}
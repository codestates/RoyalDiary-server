import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, BaseEntity } from "typeorm";
import {Users} from "./Users"
import {Stamps} from "./Stamps"
import {Contents} from "./Contents"

@Entity()
export class Comments  extends BaseEntity{

    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    test: string;

//    @Column()
//    stampId: string;

//    @Column()
//    userId: number;

    @Column()
    contentId: number;

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
    contentsId : Contents

}
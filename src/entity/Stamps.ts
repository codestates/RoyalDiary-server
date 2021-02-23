
import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany} from "typeorm";
import {Comments} from "./Comments"

@Entity()
export class Stamps {

    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    name: string;

    @Column()
    imgUrl: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    createdAt: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    updatedAt: Date;

    /* stamp(one) to comments(Many) */
    @OneToMany(
        type => Comments,
        comments => comments.stampId
    )
    comments : Comments[]
}
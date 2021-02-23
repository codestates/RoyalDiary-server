
import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany} from "typeorm";
import {Comments} from "./Comments"
import {Contents} from "./Contents"

@Entity()
export class Users {

    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    name: string;

    @Column()
    nickname: string;

    @Column()
    password: string;

    @Column()
    email: string;

    @Column()
    mobile: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    createdAt: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    updatedAt: Date;

    @OneToMany(
        type => Comments,
        comments => comments.userId
    )
    comments : Comments[]

    @OneToMany(
        type => Contents,
        contents => contents.userId
    )
    contents : Contents[]
        
}
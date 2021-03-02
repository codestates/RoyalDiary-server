
import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, BaseEntity, InsertResult} from "typeorm";
import {Comments} from "./Comments"
import {Contents} from "./Contents"
const {isAuthorized} = require('../controllers/token');

@Entity()
export class Users extends BaseEntity {

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
        contents => contents.user,
        {cascade:true}
    )
    contents : Contents[]
        
    static findUser(email: string):Promise<Users | undefined>  {
        return this.createQueryBuilder("users")
            .where("users.email = :email", { email })
            .getOne();
    }
    static findByMobile(mobile: string):Promise<Users | undefined> {
        return this.createQueryBuilder("users")
            .where("users.mobile = :mobile", { mobile })
            .getOne();
    }
    static findByEmail(email: string):Promise<Users | undefined> {
        return this.createQueryBuilder("users")
            .where("users.email = :email", { email })
            .getOne();
    }
    static findByNickname(nickname: string):Promise<Users | undefined> {
        return this.createQueryBuilder("users")
            .where("users.nickname = :nickname", { nickname })
            .getOne();
    }
    // static insertNewUser(
    //     name: string, 
    //     nickname: string, 
    //     password: string, 
    //     email: string, 
    //     mobile: string
    //     ):Promise<InsertResult | undefined> {
    //     return this.createQueryBuilder()
    //         .insert()
    //         .into(Users)
    //         .values([
    //             {name, nickname, password, email, mobile}
    //         ])
    //         .execute();
    // }

}
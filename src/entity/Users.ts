
import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, BaseEntity} from "typeorm";
import {Comments} from "./Comments"
import {Contents} from "./Contents"

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
        contents => contents.userId
    )
    contents : Contents[]
        
    static findByMobile(mobile: string) {
        return this.createQueryBuilder("user")
            .where("user.mobile = :mobile", { mobile })
            .getOne();
    }
    static findByEmail(email: string) {
        return this.createQueryBuilder("user")
            .where("user.email = :email", { email })
            .getOne();
    }
    static findByNickname(nickname: string) {
        return this.createQueryBuilder("user")
            .where("user.nickname = :nickname", { nickname })
            .getOne();
    }
    static insertNewUser(name: string, nickname: string, password: string, email: string, mobile: string) {
        return this.createQueryBuilder()
            .insert()
            .into(Users)
            .values([
                {name, nickname, password, email, mobile}
            ])
            .execute();
    }
}
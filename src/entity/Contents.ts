import {Entity, Column, PrimaryGeneratedColumn,OneToMany,ManyToOne, BaseEntity, Between} from "typeorm";
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import {Comments} from "./Comments"
import {Users} from "./Users"

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
    user : Contents

    
    static findDiaryListById(userId: number):Promise<Contents[]> {
        return this.createQueryBuilder("contents")
            .select("title")
            .addSelect("id", "contentId")
            .addSelect("createdAt")
            .where("contents.userId = :userId", { userId })
            .getRawMany();
    }
    static findByCreatedAt (date: string):Promise<Contents[]> {
        const BetweenDates = (date: Date) => Between(startOfDay(date), endOfDay(date));
        const startDate = startOfDay(parseISO(date));
        const endDate = endOfDay(parseISO(date));
        return this.createQueryBuilder("Contents")
            .select("title")
            .addSelect("imgUrl")
            .addSelect("createdAt")
            .where(
                "createdAt > :startDate AND createdAt < :endDate", {
                    startDate,
                    endDate,
                }
            )
            //between을 사용한 날짜 지정은 작동하지 않는다. invalid date가 뜬다
            //해결됐다! invalid date는 date-fns의 parseISO메소드로 문자열로 온 시간을 date화 시켜서 해결했다.
            //where은 첫 번째 인자에서 쿼리문을 사용하고, 두 번째 인자에서 쿼리문에서 사용한 변수를 정의한다.
            .getRawMany();
    }
}
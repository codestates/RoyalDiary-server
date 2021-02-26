
import {Entity, Column, PrimaryGeneratedColumn,ManyToMany, JoinTable, BaseEntity } from "typeorm";
import {Users} from "./Users"

@Entity()
export class Collections extends BaseEntity {

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

    @ManyToMany(() => Users)
    @JoinTable({
        name : "users_collections"
    })
    Users_Collections: Users[];
}
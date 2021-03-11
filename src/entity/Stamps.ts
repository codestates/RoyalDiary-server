// import {
//   Entity,
//   Column,
//   PrimaryGeneratedColumn,
//   ManyToOne,
//   OneToMany,
//   BaseEntity,
// } from "typeorm";
// import { Comments } from "./Comments";

// @Entity()
// export class Stamps extends BaseEntity {
//   @PrimaryGeneratedColumn()
//   id?: number;

//   @Column()
//   name: string;

//   @Column()
//   imgUrl: string;

//   @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
//   createdAt: Date;

//   @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
//   updatedAt: Date;

//   /* stamp(one) to comments(Many) */
//   @OneToMany((type) => Comments, (comments) => comments.stamp)
//   comments: Comments[];

//   static findByStampId(id: number): any {
//     return this.createQueryBuilder("stamps")
//       .where("stamps.id = :id", { id })
//       .getOne();
//   }
//   static allStamps(): any {
//     return this.createQueryBuilder("stamps")
//       .getMany();
//   }
// }

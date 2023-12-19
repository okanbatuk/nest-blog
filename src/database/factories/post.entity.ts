import {
  BaseEntity,
  Column,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export default class Post extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false })
  @Generated('uuid')
  uuid: string;

  @Column({ nullable: false, length: 50 })
  title: string;

  @Column({ nullable: false, length: 100 })
  content: string;

  @Column({ nullable: false, default: false })
  isDeleted: boolean;

  @Column({ nullable: false, type: 'date', default: new Date() })
  createdAtDate: Date;

  @Column({
    nullable: false,
    type: 'time',
    default: new Date().toLocaleTimeString(),
  })
  createdAtTime: string;

  @Column({ nullable: false, type: 'date', default: new Date() })
  updatedAtDate: Date;

  @Column({
    nullable: false,
    type: 'time',
    default: new Date().toLocaleTimeString(),
  })
  updatedAtTime: string;

  @Column({ type: 'date', nullable: true })
  deletedAtDate: Date;

  @Column({ type: 'time', nullable: true })
  deletedAtTime: string;
}

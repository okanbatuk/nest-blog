import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import User from './user.entity';

@Entity()
export default class Post extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false })
  @Generated('uuid')
  uuid: string;

  @Column({ nullable: false, length: 100 })
  title: string;

  @Column({ nullable: false, type: 'text' })
  content: string;

  @Column({ name: 'userId', nullable: false })
  @ManyToOne(() => User, (user) => user.posts)
  user: User;

  @Column({ nullable: false, default: false })
  isDeleted: boolean;

  @CreateDateColumn({
    name: 'createdAt',
    type: 'timestamp with time zone',
    default: new Date(),
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updatedAt',
    type: 'timestamp with time zone',
    default: new Date(),
  })
  updatedAt: Date;

  @Column({
    name: 'deletedAt',
    type: 'timestamp with time zone',
    nullable: true,
  })
  deletedAt: Date;
}

import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Post from './post.entity';

@Entity()
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false })
  @Generated('uuid')
  uuid: string;

  @Column({ nullable: false, length: 20 })
  firstName: string;

  @Column({ nullable: false, length: 40 })
  lastName: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false, default: 'USER' })
  role: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @Column({ nullable: false, default: true })
  isActive: boolean;

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

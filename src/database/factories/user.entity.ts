import {
  BaseEntity,
  Column,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @Column({ nullable: false, default: true })
  isActive: boolean;

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

import { Exclude } from 'class-transformer';

export class SerializedUserRelation {
  @Exclude()
  id: number;

  uuid: string;
  email: string;
  firstName: string;
  lastName: string;

  @Exclude()
  role: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;

  @Exclude()
  password: string;

  @Exclude()
  isActive: boolean;

  constructor(partial: Partial<SerializedUserRelation>) {
    Object.assign(this, partial);
  }
}

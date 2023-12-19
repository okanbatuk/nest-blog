import { Exclude } from 'class-transformer';

export class SerializedUser {
  @Exclude()
  id: number;

  uuid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAtDate: Date;
  createdAtTime: string;
  updatedAtDate: Date;
  updatedAtTime: string;

  @Exclude()
  deletedAtDate: Date;

  @Exclude()
  deletedAtTime: string;

  @Exclude()
  password: string;

  @Exclude()
  isActive: boolean;

  constructor(partial: Partial<SerializedUser>) {
    Object.assign(this, partial);
  }
}

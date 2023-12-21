import { Exclude } from 'class-transformer';

export class SerializedUser {
  @Exclude()
  id: number;

  uuid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;

  @Exclude()
  deletedAt: string;

  @Exclude()
  password: string;

  @Exclude()
  isActive: boolean;

  constructor(partial: Partial<SerializedUser>) {
    Object.assign(this, partial);
  }
}

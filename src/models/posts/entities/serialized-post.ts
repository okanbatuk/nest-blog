import { Exclude, Type } from 'class-transformer';
import { SerializedUserRelation } from 'src/models/users/entities/serialized-user-relation';

export class SerializedPost {
  @Exclude()
  id: number;

  uuid: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;

  @Type(() => SerializedUserRelation)
  user: SerializedUserRelation;

  @Exclude()
  isDeleted: boolean;

  @Exclude()
  deletedAt: string;

  constructor(partial: Partial<SerializedPost>) {
    Object.assign(this, partial);
  }
}

export default <T extends hasDate>(entity: T) => ({
  ...entity,
  createdAt: entity.createdAt.toUTCString(),
  updatedAt: entity.updatedAt.toUTCString(),
  deletedAt: entity.deletedAt ? entity.deletedAt.toUTCString() : undefined,
});

type hasDate = {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

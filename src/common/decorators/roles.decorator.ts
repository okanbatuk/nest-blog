import { SetMetadata } from '@nestjs/common';

export const Roles = {
  0: 'ADMIN',
  1: 'USER',
  ADMIN: 0,
  USER: 1,
};

export const ROLES_KEY = 'roles';
export const RolesDecorator = (roles: number[]) =>
  SetMetadata(ROLES_KEY, roles);

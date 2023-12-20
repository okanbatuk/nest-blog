import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Roles } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get roles numbers. Etc: [0, 1]
    const rolesNumbers = this.reflector.getAllAndOverride<number[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Get user in req.body
    const { user } = context.switchToHttp().getRequest();
    if (!rolesNumbers || user.role === 'ADMIN') return true;

    // Convert the roles numbers to roles text. Etc: ['ADMIN', 'USER']
    const requiredRoles = rolesNumbers.map((role) => Roles[role]);

    // Check if the user role is in the required roles
    return requiredRoles.some((role) => role == user.role);
  }
}

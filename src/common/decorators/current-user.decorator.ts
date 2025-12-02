import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Interface representing the payload of the current authenticated user.
 */
export interface CurrentUserPayload {
  userId: string;
  email: string;
  countryCode: string;
  businessUnit: string;
  roles: string[];
  providerId?: string;
  workTeamId?: string;
  userType?: string;
}

/**
 * Parameter decorator to extract the current user from the request.
 *
 * @param data - The key of the user payload to extract (optional).
 * @param ctx - The execution context.
 * @returns The user payload or a specific property of it.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUserPayload;

    return data ? user?.[data] : user;
  },
);

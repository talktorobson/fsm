import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interface representing the standard API response structure.
 * @template T - The type of the data payload.
 */
export interface Response<T> {
  data: T;
  meta?: {
    timestamp: string;
    correlationId?: string;
  };
}

/**
 * Interceptor to transform the response into a standard format.
 *
 * Wraps the response data in a `data` property and adds metadata such as timestamp and correlation ID.
 *
 * @template T - The type of the response data.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  /**
   * Intercepts the request/response cycle to transform the response.
   *
   * @param context - The execution context.
   * @param next - The call handler to proceed to the next interceptor or handler.
   * @returns An observable of the transformed response.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => ({
        data,
        meta: {
          timestamp: new Date().toISOString(),
          correlationId: request.correlationId,
        },
      })),
    );
  }
}

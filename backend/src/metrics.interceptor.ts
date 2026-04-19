import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Counter, Histogram, Gauge } from 'prom-client';

const activePlatformUsers = new Gauge({
  name: 'active_platform_users',
  help: 'Simulated real-time tracking of active websockets and connected clients'
});
activePlatformUsers.set(Math.floor(Math.random() * 20) + 40);

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status']
});

const httpRequestDurationMicroseconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, route } = req;
    const path = route ? route.path : req.url;
    
    // Ignore metrics endpoint to avoid recursive logging
    if (path === '/metrics') return next.handle();

    const timer = httpRequestDurationMicroseconds.startTimer();

    // Fluctuate active connections subtly on hit
    const direction = Math.random() > 0.5 ? 1 : -1;
    activePlatformUsers.inc(direction * Math.floor(Math.random() * 3));

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          const status = res.statusCode || 200;
          httpRequestsTotal.labels({ method, path, status: status.toString() }).inc();
          timer({ method, path, status: status.toString() });
        },
        error: (err) => {
          const status = err.status || 500;
          httpRequestsTotal.labels({ method, path, status: status.toString() }).inc();
          timer({ method, path, status: status.toString() });
        }
      })
    );
  }
}

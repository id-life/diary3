import { clerkMiddleware } from '@clerk/nextjs/server';

export const config = {
  matcher: [
    // 处理所有路由，但跳过Next.js内部路由和静态文件
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // 始终处理API路由
    '/(api|trpc)(.*)',
  ],
};
// 使用默认配置的Clerk中间件
export default clerkMiddleware();

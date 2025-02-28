import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session.userId;

    if (!userId) {
      return new NextResponse('未登录', { status: 401 });
    }

    const body = await request.json();
    const { content, fileName } = body;

    if (!content || !fileName) {
      return new NextResponse('缺少必要参数', { status: 400 });
    }

    // 保存到数据库
    const backup = await prisma.githubBackup.create({
      data: {
        userId,
        content,
        fileName,
      },
    });

    return NextResponse.json(backup);
  } catch (error) {
    console.error('[GITHUB_BACKUP_ERROR]', error);
    return new NextResponse('服务器内部错误', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userId = session.userId;

    if (!userId) {
      return new NextResponse('未登录', { status: 401 });
    }

    // 获取用户的所有备份
    const backups = await prisma.githubBackup.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(backups);
  } catch (error) {
    console.error('[GITHUB_BACKUP_GET_ERROR]', error);
    return new NextResponse('服务器内部错误', { status: 500 });
  }
}

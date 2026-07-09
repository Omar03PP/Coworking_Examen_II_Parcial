import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
        const adapter = new PrismaPg(pool);
        super({ adapter });
    }

    async onModuleInit(){
        await this.$connect();
    }
}

import dotenv from "dotenv"
dotenv.config();
import { Injectable } from "@nestjs/common";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client"
import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
   constructor(){
     const pool = new Pool({ connectionString: process.env.DATABASE_URL });
     const adapter = new PrismaPg(pool);
     super({ adapter });
   }
   onModuleInit() {
    console.log("prisma service init");
    
   }
   onModuleDestroy() {
    console.log("prisma service destroyed");
    
   }
}


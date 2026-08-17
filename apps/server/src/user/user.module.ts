import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
// import { FaceVerificationModule } from "src/face-verification/face-verification.module";


@Module({
     imports:[],
     controllers:[UserController],
     providers:[UserService,PrismaService],
}) export class UserModule{} 
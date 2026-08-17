import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "../dto/user/create-user.dto";
import { PrismaService } from "../prisma/prisma.service";
import { LoginUserDto } from "src/dto/user/login-user.dto";
// import { FaceVerificationService } from "src/face-verification/face-verification.service";


@Injectable()
export class UserService {
    constructor(private prisma : PrismaService,
        // private faceVerificationService : FaceVerificationService
    ){

    }
    async createUser(data: CreateUserDto){
        return await this.prisma.user.create({
            data
        })
    }
    async loginUser(data: LoginUserDto){
        return await this.prisma.user.findUnique({
            where : {
                email : data.email,
                
            }
        })
    }
    // async faceRecognitionSetup(imageBuffer: Buffer, data:CreateUserDto){
    //  return  await this.faceVerificationService.faceRecognitionSetup(imageBuffer,data)       
        
    // }
    // async faceVerification(imageBuffer: Buffer, userId:string){
    //  return  await this.faceVerificationService.compareFaces(imageBuffer,userId)       
        
    // }

}
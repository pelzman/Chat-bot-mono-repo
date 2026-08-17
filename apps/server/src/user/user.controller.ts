import { Body, Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { CreateUserDto } from "../dto/user/create-user.dto";
import { LoginUserDto } from "src/dto/user/login-user.dto";
import { FileInterceptor } from "@nestjs/platform-express/multer";
import { memoryStorage } from "multer";
 
@Controller("user")
export class UserController {
    constructor(private readonly userService : UserService) {}

    @Post("add-user")
    async createUser(@Body() data : CreateUserDto ){
        return await this.userService.createUser(data)
    }
    @Post("login-user")
    async loginUser(@Body() data : LoginUserDto ){
        return await this.userService.loginUser(data)
    }
    // @Post("face-setup")
    // @UseInterceptors(FileInterceptor('avatar', {
    //     storage: memoryStorage()    
    // }))
    // async faceRecognitionSetup(@UploadedFile() file : Express.Multer.File, @Body() data:CreateUserDto){
    //     console.log("file",file)
    //     console.log("data",data)
    //     return await this.userService.faceRecognitionSetup(file.buffer,data)
    // }
    // @Post("face-verify")
    // @UseInterceptors(FileInterceptor('avatar' , {
    //     storage: memoryStorage()
    // }))
    // async faceVerification(@UploadedFile() file : Express.Multer.File, @Body() userId:string){
    //     return await this.userService.faceVerification(file.buffer,userId)
    // }

}
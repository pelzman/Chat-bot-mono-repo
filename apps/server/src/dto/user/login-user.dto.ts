
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

class LoginUserDto {
    @IsEmail()
    @IsString()
    email : string
    
    @IsString()
    @IsNotEmpty()
    password : string
}

export {LoginUserDto}
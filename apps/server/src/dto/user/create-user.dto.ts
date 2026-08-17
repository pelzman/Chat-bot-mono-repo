

import { IsBoolean, IsEmail, IsNotEmpty, IsString, IsOptional } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name : string
    @IsString()
    @IsNotEmpty()
    @IsEmail({},{
        message:"Invalid email address"
    })
    email : string
    
    @IsString()
    @IsNotEmpty()
    password : string

    @IsString()
    @IsOptional()
    role? : string
 
 
    
}
import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ChatService } from "./chat.service";
 import {PrismaService} from "../prisma/prisma.service";
import { CreateChatDto } from "../dto/chat/createChat.dto";
import { RolesGuard } from "src/auth/guards/roles.guard";

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly prisma: PrismaService,
    ) {}
           
 @Post('sendMessage')
async sendChat(@Body() data: CreateChatDto){
    return this.chatService.sendMessage( data);
    
}
     
    
}
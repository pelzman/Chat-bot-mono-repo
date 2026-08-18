import { Body, Controller, Post, Get, Param, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
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
     
@Get('conversations')
async getConversations(@Req() req: Request) {
    const user = req.user as any;
    return this.chatService.getConversations(user.id);
}

@Get('conversations/:id/messages')
async getConversationMessages(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.chatService.getConversationMessages(id, user.id);
}
    
}
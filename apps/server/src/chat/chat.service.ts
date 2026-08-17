import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service";
import { CreateChatDto } from "../dto/chat/createChat.dto";
import Groq from "groq-sdk";

@Injectable()
export class ChatService {

  constructor(private readonly prisma: PrismaService) {}

  
  private groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  async sendMessage(data: CreateChatDto) {
    const Summarry_Threshold = 15
    const SUMMARY_WINDOW = 10;
    // 1. Find or create conversation
    let conversation =  data.conversationId ? await this.prisma.conversation.findUnique({
      where: { id: data.conversationId }
    }) : await this.prisma.conversation.create({
      data : {
        userId : data.userId,
        summarizeCount:0
      }
    });

    // 2. Persist the user's incoming message
    await this.prisma.message.create({
      data: {
        content: data.content,
        sender: 'user',
        conversationId: conversation.id
      }
    });

    // 3. Get all messages for this conversation (ordered)
    const allMessages = await this.prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' }
    });

    // 4. Check if unsummarized messages exceed the limit
    const unsummarizedMessages = allMessages.slice(conversation.summarizeCount);
    console.log(unsummarizedMessages,"unsummarizedMessages")
    
    if (unsummarizedMessages.length >  SUMMARY_WINDOW) {
      // Messages to summarize = everything except the most recent SUMMARY_WINDOW
      const messagesToSummarize = unsummarizedMessages.slice(0, -SUMMARY_WINDOW);
      
      // Build text to summarize (include existing summary if any)
      const oldContext = conversation.summary 
        ? `Previous summary: ${conversation.summary}\n\n` 
        : '';
      const textToSummarize = oldContext + messagesToSummarize
        .map(m => `${m.sender}: ${m.content}`)
        .join('\n');

        console.log(textToSummarize,"textToSummarize")

      // 5. Call AI to summarize
      const newSummary = await this.callAISummarization(textToSummarize);

      // 6. Update conversation with new summary and update the count
      conversation = await this.prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          summary: newSummary,
          summarizeCount: conversation.summarizeCount + messagesToSummarize.length,
        },
      });
    }

    // 7. Build context for AI: summary (if exists) + recent unsummarized messages
    const recentMessages = allMessages.slice(conversation.summarizeCount);
    
    const aiContext = [];
    if (conversation.summary) {
      aiContext.push({ role: 'system', content: `Conversation history summary: ${conversation.summary}` });
    } else {
      aiContext.push({ role: 'system', content: `You are a helpful customer support assistant.${
    conversation.summary ? `\n\nConversation so far: ${conversation.summary}` : ''
  }` });
    }
    
    for (const msg of recentMessages) {
      aiContext.push({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.content });
    }

    // 8. Call AI for the actual chat response
    const aiResponseContent = await this.callAIChat(aiContext);

    // 9. Persist AI response
    const aiMessage = await this.prisma.message.create({
      data: {
        content: aiResponseContent,
        sender: 'assistant',
        conversationId: conversation.id,
      },
    });

    return aiMessage;
  }

  // --- GROQ AI METHODS ---

  private async callAISummarization(text: string): Promise<string> {
    console.log("Summarizing text with Groq...");
    const completion = await this.groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a summarization assistant. Summarize the following conversation log into a concise paragraph that captures the key context, facts, and user intent. Only return the summary, nothing else.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      model: "openai/gpt-oss-120b", // Changed to Qwen 2.5 32B
      temperature: 0.2,
    });

    return completion.choices[0]?.message?.content || "No summary generated.";
  }

  private async callAIChat(messages: any[]): Promise<string> {
    console.log("Calling Groq AI for chat response...");
    const completion = await this.groq.chat.completions.create({
      messages: messages,
      model: "openai/gpt-oss-120b", // Use your preferred model here
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "I couldn't generate a response.";
  }
}
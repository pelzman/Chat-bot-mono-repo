// import '@tensorflow/tfjs-backend-cpu';
// import * as faceapi from '@vladmandic/face-api';
// import * as canvas from 'canvas';
// import * as path from 'path';
// import { Injectable } from "@nestjs/common";
// import { PrismaService } from "../prisma/prisma.service";
// import { CreateUserDto } from 'src/dto/user/create-user.dto';

// @Injectable()
// export class FaceVerificationService {
//     private initialized = false;

//     constructor(private prisma: PrismaService) {}

//     private async initialize() {
//         if (this.initialized) return;
//         const { Canvas, Image, ImageData } = canvas;
//         faceapi.env.monkeyPatch({ Canvas, Image, ImageData } as any);
//         const modelPath = path.join(process.cwd(), 'src', 'face-verification', 'models')
//         await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
//         await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
//         await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
//         this.initialized = true;
//     }

//     async faceRecognitionSetup(imageBuffer: Buffer, data: CreateUserDto) {
//         await this.initialize();

//         const img = await canvas.loadImage(imageBuffer);
//         const detections = await faceapi
//             .detectSingleFace(img as any)
//             .withFaceLandmarks()
//             .withFaceDescriptor();

//         if (!detections) {
//             throw new Error("No face detected");
//         }

//         const user = await this.prisma.user.upsert({
//             where: { email: data.email },
//             update: { avatarUrl: JSON.stringify(Array.from(detections.descriptor)) },
//             create: {
//                 email: data.email,
//                 avatarUrl: JSON.stringify(Array.from(detections.descriptor)),
//                 name: data.name
//             }
//         });

//         return user;
//     }

//     async compareFaces(imageBuffer: Buffer, userId: string) {
//         await this.initialize();

//         const img = await canvas.loadImage(imageBuffer);
//         const detections = await faceapi
//             .detectSingleFace(img as any)
//             .withFaceLandmarks()
//             .withFaceDescriptor();

//         if (!detections) {
//             throw new Error("No face detected");
//         }

//         const user = await this.prisma.user.findUnique({
//             where: { id: userId }
//         });

//         if (!user) {
//             throw new Error("User not found");
//         }

//         const savedFace = new Float32Array(JSON.parse(user.avatarUrl));
//         const distance = faceapi.euclideanDistance(detections.descriptor, savedFace);
//         console.log("distance", distance);

//         return distance < 0.6
//             ? { message: "Face matched", status: true }
//             : { message: "Face not matched", status: false };
//     }
// }
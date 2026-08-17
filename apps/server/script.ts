
// import {prisma} from "./src/lib/prisma";



// async function main() {
// //   const user = await prisma.user.create({
// //     data: {
// //       name: "Alice",
// //       email: "alice@example.com",
// //       conversations: {
// //         create: {
// //           messages: {
// //             create: {
// //               content: "Hello World",
// //               sender: "user",
// //             },
// //           },
// //         },
// //       },
// //     },
// //     include: {
// //       conversations: true,
// //     },
// //   });
// //     console.log("user", JSON.stringify(user, null, 2) );

// //   const allusers = await prisma.user.findMany({
// // include:{
// //     conversations:true
    
    
    
// // }
// //   })
//   const conversations = await prisma.conversation.findMany({
//     include:{
//       messages:true
//     }
//   })

  
//     // console.log("allusers", JSON.stringify(allusers, null, 2) );
//     console.log("conversations", JSON.stringify(conversations, null, 2) );
// }
// main().then(async()=>{
//    await prisma.$disconnect()
// })

// .catch(async (e) => {
//   console.error(e);
//       await prisma.$disconnect()

//   process.exit(1);
// })

    
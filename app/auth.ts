import NextAuth, { AuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import Credentials from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client";
import db from "./db";



const prisma =new PrismaClient
export const authOptions:AuthOptions={
    adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
        name:"credentials",
        credentials:{
            email:{
                label:"Email",
                type:"email",
                placeholder:"Email"
            },
            password:{
                label:"Password",
                type:"password",
                placeholder:"Password"
            }
        },
        async authorize(credentials){
            if(!credentials.email || !credentials.password){
                throw new Error("Invalid credentials");
            }

            const user=await db.user.findUnique({
                where:{
                    email:credentials.email
                }
            });
            if(!user || !user?.password){
                throw new Error("no user found");
            }
            const isPasswordCorrect=await bcrypt.compare(credentials.password,user.password);

            if(!isPasswordCorrect){
                throw new Error("Invalid password");
            }
            return user;
        },
    }),
            
  ],
  secret:process.env.NEXTAUTH_SECRET,
  session:{
    strategy:"jwt",
    
  },
  callbacks:{
    async jwt({token,user}){
      if(user){
        token.id=user.id;
        token.email=user.email;
      }
      return token;
    },
    async session({session,token}){
      
        session.user=token;
      
      return session;
    },
  },
  debug:process.env.NODE_ENV!=="production",
}

const handler=NextAuth(authOptions);

export{ handler as GET, handler as POST }




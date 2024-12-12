import { error } from "console";

import { authOptions } from "@/app/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import db from "@/app/db";
export async function POST(request){

    try{
        const session = await getServerSession(authOptions);
        if(!session||!session.user||!session.user.id){
            return new NextResponse("Unauthorized",{status:401})
        }
        const {name}=await request.json();

        if (!name){
            return new NextResponse("Missing data",{status:400})
        }
        const customer=await db.customer.create({
            data:{
                name:name,
                userId:session.user.id
            }
        })
        return new NextResponse(customer,{status:200})
        
    }
    catch(err){
        return new NextResponse(err,{status:500})
    }

}

export async function GET(request) {
    try {
      const session = await getServerSession(authOptions);
  
      if (!session || !session.user || !session.user.id) {
        return new Response(
          JSON.stringify({ message: "Unauthorized" }),
          { status: 401 }
        );
      }
  
      // Fetch customers for the logged-in user
      const customers = await db.customer.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: "asc" },
      });
  
      return new Response(JSON.stringify(customers), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    } catch (error) {
      console.error("Error fetching customers:", error);
      return new Response(
        JSON.stringify({ message: "Internal Server Error" }),
        { status: 500 }
      );
    }
  }


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
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = 10;
    const offset = (page - 1) * limit;

    const customers = await db.customer.findMany({
      skip: offset,
      take: limit,
      include: {
        invoices: true,
      },
    });

    const totalCustomers = await db.customer.count();
    const totalPages = Math.ceil(totalCustomers / limit);

    return new Response(
      JSON.stringify({ customers, totalPages }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching customers:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
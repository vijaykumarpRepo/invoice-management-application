import bcrypt from "bcryptjs";
import db from "@/app/db";
import { NextResponse } from "next/server";

export  async function POST(request:Request){

  const body = await request.json();

  console.log(body);
  const { name, email, password } = body;
  if (!name || !email || !password) {
    return new NextResponse("Missing data", { status: 400 })
  }
  const userAlreadyExists = await db.user.findUnique({
    where: {
      email,
    }
  });
  if (userAlreadyExists?.id) {
    return new NextResponse("User already exists", { status: 400 })
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      name,
      email,
      password:hashedPassword,
    }
  });
  return NextResponse.json(user);





}


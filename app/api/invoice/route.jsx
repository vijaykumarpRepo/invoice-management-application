import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import db from "@/app/db";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const { amount, status, dueDate, customerId } = await request.json();

    if (!amount || !dueDate || !status || !customerId) {
      return new Response(JSON.stringify({ message: "Missing required fields" }), { status: 400 });
    }

    // Verify the customer belongs to the logged-in user
    const customer = await db.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer || customer.userId !== session.user.id) {
      return new Response(JSON.stringify({ message: "Unauthorized or customer not found" }), { status: 403 });
    }

    // Add the invoice
    const invoice = await db.invoice.create({
      data: {
        amount: parseFloat(amount),
        status,
        dueDate: new Date(dueDate),
        customerId,
      },
    });

    return new Response(JSON.stringify(invoice), { status: 201 });
  } catch (error) {
    console.error("Error adding invoice:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}

//get funcntion
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const customerId = url.searchParams.get("customerId");

    if (!customerId) {
      return new Response(
        JSON.stringify({ message: "Customer ID is required" }),
        { status: 400 }
      );
    }

    const invoices = await db.invoice.findMany({
      where: { customerId: parseInt(customerId, 10) },
      include: {
        customer: true,
      },
      orderBy: { dueDate: "desc" },
    });

    return new Response(JSON.stringify(invoices), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}


export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const { id, amount, status, dueDate } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ message: "Invoice ID is required" }), { status: 400 });
    }

    // Verify the invoice belongs to the logged-in user's customer
    const invoice = await db.invoice.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!invoice || invoice.customer.userId !== session.user.id) {
      return new Response(JSON.stringify({ message: "Unauthorized or invoice not found" }), { status: 403 });
    }

    // Update the invoice
    const updatedInvoice = await db.invoice.update({
      where: { id },
      data: {
        amount: amount ? parseFloat(amount) : undefined,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });

    return new Response(JSON.stringify(updatedInvoice), { status: 200 });
  } catch (error) {
    console.error("Error editing invoice:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}

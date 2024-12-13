import { authOptions } from "@/app/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import db from "@/app/db";

// Create Customer
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { name } = await request.json();

    if (!name) {
      return new NextResponse("Missing data", { status: 400 });
    }

    const customer = await db.customer.create({
      data: {
        name: name,
        userId: session.user.id,
      },
    });
    return NextResponse.json(customer, { status: 200 });
  } catch (err) {
    return new NextResponse(err.message, { status: 500 });
  }
}

// Get Customers (Paginated)
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

// Delete Customer
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(request.url);
    const customerId = parseInt(url.searchParams.get("id"), 10);

    if (!customerId) {
      return new NextResponse("Customer ID is required", { status: 400 });
    }

    // Verify the customer belongs to the logged-in user
    const customer = await db.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer || customer.userId !== session.user.id) {
      return new NextResponse("Unauthorized or customer not found", { status: 403 });
    }

    // Delete the customer
    await db.customer.delete({
      where: { id: customerId },
    });

    return new NextResponse("Customer deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return new NextResponse(error.message, { status: 500 });
  }
}

// Edit Customer
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id, name } = await request.json();

    if (!id || !name) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify the customer belongs to the logged-in user
    const customer = await db.customer.findUnique({
      where: { id },
    });

    if (!customer || customer.userId !== session.user.id) {
      return new NextResponse("Unauthorized or customer not found", { status: 403 });
    }

    // Update the customer
    const updatedCustomer = await db.customer.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(updatedCustomer, { status: 200 });
  } catch (error) {
    console.error("Error updating customer:", error);
    return new NextResponse(error.message, { status: 500 });
  }
}

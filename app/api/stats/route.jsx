import db from "@/app/db";

export async function GET() {
    try {
      const totalCustomers = await db.customer.count();
      const totalOutstandingInvoices = await db.invoice.count({
        where: { status: "pending" },
      });
      const totalRevenue = await db.invoice.aggregate({
        _sum: { amount: true },
      });
  
      return new Response(
        JSON.stringify({
          totalCustomers,
          totalOutstandingInvoices,
          totalRevenue: totalRevenue._sum.amount || 0,
        }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching stats:", error);
      return new Response(
        JSON.stringify({ message: "Internal Server Error" }),
        { status: 500 }
      );
    }
  }
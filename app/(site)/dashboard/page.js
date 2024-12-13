"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Dashboard() {
  const { data: session, status } = useSession(); // Check for user session
  const router = useRouter();

  const [customers, setCustomers] = useState([]); // Customers data
  const [stats, setStats] = useState({}); // Stats data
  const [currentPage, setCurrentPage] = useState(1); // Pagination current page
  const [totalPages, setTotalPages] = useState(0); // Pagination total pages
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login"); // Redirect to login if not authenticated
    } else if (status === "authenticated") {
      fetchStats();
      fetchCustomers(currentPage);
    }
  }, [status, currentPage]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchCustomers = async (page) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/customer?page=${page}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
        setTotalPages(data.totalPages || 0);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" }); // Redirect to login page after logout
  };

  const handleEdit = (customerId) => {
    router.push(`/editcustomer/${customerId}`); // Navigate to edit customer page
  };

  const handleDelete = async (customerId) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        const res = await fetch(`/api/customer/${customerId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          alert("Customer deleted successfully");
          fetchCustomers(currentPage); // Refresh the customer list
        } else {
          const error = await res.json();
          alert(`Error: ${error.message}`);
        }
      } catch (error) {
        console.error("Error deleting customer:", error);
        alert("An unexpected error occurred.");
      }
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customer Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="p-4 bg-blue-100 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Total Customers</h2>
          <p className="text-2xl">{stats.totalCustomers || 0}</p>
        </div>
        <div className="p-4 bg-yellow-100 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Outstanding Invoices</h2>
          <p className="text-2xl">{stats.totalOutstandingInvoices || 0}</p>
        </div>
        <div className="p-4 bg-green-100 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Total Revenue</h2>
          <p className="text-2xl">${stats.totalRevenue || 0}</p>
        </div>
      </div>

      {/* Customer List */}
      <div className="overflow-x-auto mb-8">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Total Invoices</th>
              <th className="border border-gray-300 px-4 py-2">Outstanding</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  Loading customers...
                </td>
              </tr>
            ) : customers && customers.length > 0 ? (
              customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="border border-gray-300 px-4 py-2">{customer.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{customer.invoices.length}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {
                      customer.invoices.filter(
                        (invoice) => invoice.status === "pending"
                      ).length
                    }
                  </td>
                  <td className="border border-gray-300 px-4 py-2 flex space-x-2">
                    <button
                      onClick={() => handleEdit(customer.id)}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="px-4 py-2">{`Page ${currentPage} of ${totalPages}`}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

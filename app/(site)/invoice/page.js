"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

export default function InvoiceList({ customerId = null }) {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]); // List of customers for dropdown
  const [newCustomerName, setNewCustomerName] = useState(""); // New customer name
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingInvoice, setEditingInvoice] = useState(null);

  // Fetch invoices and customers
  useEffect(() => {
    const fetchInvoicesAndCustomers = async () => {
      setLoading(true);
      setError("");

      try {
        // Fetch invoices
        const invoiceRes = await fetch(
          customerId ? `/api/invoice?customerId=${customerId}` : "/api/invoice"
        );
        if (!invoiceRes.ok) throw new Error(`Error: ${invoiceRes.statusText}`);
        const invoicesData = await invoiceRes.json();
        setInvoices(invoicesData);

        // Fetch customers
        const customerRes = await fetch("/api/customer");
        if (!customerRes.ok) throw new Error(`Error: ${customerRes.statusText}`);
        const customersData = await customerRes.json();
        setCustomers(customersData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoicesAndCustomers();
  }, [customerId]);

  // Add a new customer
  const handleAddCustomer = async () => {
    if (!newCustomerName.trim()) {
      alert("Customer name is required.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newCustomerName }),
      });

      if (!response.ok) throw new Error("Failed to add customer.");

      const newCustomer = await response.json();
      setCustomers((prev) => [...prev, newCustomer]); // Update customer dropdown
      setNewCustomerName(""); // Reset input
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Failed to add customer.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/goodbye" });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) return <p>Loading invoices...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Invoices</h1>
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
      <div>
        <label>Select Customer:</label>
        <select className="border px-2 py-1">
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
          <option value="add-new">Add New Customer</option>
        </select>
        {/* Add Customer Inline Form */}
        <div>
          <h2>Add New Customer</h2>
          <input
            type="text"
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
            placeholder="Customer Name"
            className="border px-2 py-1"
          />
          <button onClick={handleAddCustomer} disabled={loading}>
            {loading ? "Adding..." : "Add Customer"}
          </button>
        </div>
      </div>

      {invoices.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        <table className="table-auto border-separate border border-slate-400 items-center">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border border-slate-300">
                <td className="border border-slate-300">{invoice.customer?.name || "N/A"}</td>
                <td className="border border-slate-300">${invoice.amount.toFixed(2)}</td>
                <td className="border border-slate-300">{invoice.status}</td>
                <td className="border border-slate-300">
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </td>
                <td className="border border-slate-300">
                  <button onClick={() => setEditingInvoice(invoice)}>
                    <span className="material-icons">Edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editingInvoice && (
        <form onSubmit={(e) => handleEditSubmit(e)}>
          <h2>Edit Invoice</h2>
          <div>
            <label>Amount:</label>
            <input
              type="number"
              value={editingInvoice.amount}
              onChange={(e) =>
                setEditingInvoice({ ...editingInvoice, amount: e.target.value })
              }
            />
          </div>
          <div>
            <label>Status:</label>
            <select
              value={editingInvoice.status}
              onChange={(e) =>
                setEditingInvoice({ ...editingInvoice, status: e.target.value })
              }
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div>
            <label>Due Date:</label>
            <input
              type="date"
              value={new Date(editingInvoice.dueDate)
                .toISOString()
                .split("T")[0]}
              onChange={(e) =>
                setEditingInvoice({
                  ...editingInvoice,
                  dueDate: e.target.value,
                })
              }
            />
          </div>
          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => setEditingInvoice(null)}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

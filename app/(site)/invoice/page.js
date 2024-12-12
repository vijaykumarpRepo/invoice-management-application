"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
export default function InvoiceList({ customerId = null }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingInvoice, setEditingInvoice] = useState(null); // State for editing invoice

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          customerId ? `/api/auth/invoice?customerId=${customerId}` : "/api/auth/invoice"
        );
        if (!res.ok) {
          throw new Error(`Error: ${res.statusText}`);
        }
        const data = await res.json();
        setInvoices(data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        setError("Failed to fetch invoices.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [customerId]);

  const handleEditClick = (invoice) => {
    setEditingInvoice(invoice); // Set the invoice to edit
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/invoice", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingInvoice),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update invoice");
      }

      const updatedInvoice = await response.json();
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv))
      );

      setEditingInvoice(null); // Close the edit form
    } catch (error) {
      console.error("Error editing invoice:", error);
      setError("Failed to update invoice.");
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = async () => {
        try {
          await signOut({ callbackUrl: "/goodbye" }); // Redirect to the goodbye page after logout
        } catch (error) {
          console.error("Error logging out:", error);
        }
      };

  if (loading) {
    return <p>Loading invoices...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Invoices</h1>
      <button onClick={handleLogout} className="logout-button">
//       Logout
//     </button>
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
                <td className="border border-slate-300">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                <td className="border border-slate-300">
                  <button onClick={() => handleEditClick(invoice)}> 
                    <span className="material-icons">Edit</span>
                    
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editingInvoice && (
        <form onSubmit={handleEditSubmit}>
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
          <div>
            <label>External Invoice ID:</label>
            <input
              type="number"
              value={editingInvoice.externalId || ""}
              onChange={(e) =>
                setEditingInvoice({
                  ...editingInvoice,
                  externalId: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label>External Customer ID:</label>
            <input
              type="number"
              value={editingInvoice.externalCustId || ""}
              onChange={(e) =>
                setEditingInvoice({
                  ...editingInvoice,
                  externalCustId: e.target.value,
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



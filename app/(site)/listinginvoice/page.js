"use client";

import { useState, useEffect } from "react";

export default function ViewInvoices() {
  const [customers, setCustomers] = useState([]); // List of customers
  const [customerId, setCustomerId] = useState(""); // Selected customer ID
  const [invoices, setInvoices] = useState([]); // Invoices for the selected customer
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error message

  // Fetch customers when the component mounts
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/customer");
        if (!res.ok) {
          throw new Error("Failed to fetch customers");
        }
        const data = await res.json();
        setCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  // Fetch invoices for the selected customer
  const fetchInvoices = async (customerId) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/invoice?customerId=${customerId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch invoices");
      }
      const data = await res.json();
      setInvoices(data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setError("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  // Handle customer selection
  const handleCustomerChange = (e) => {
    const selectedCustomerId = e.target.value;
    setCustomerId(selectedCustomerId);
    if (selectedCustomerId) {
      fetchInvoices(selectedCustomerId);
    } else {
      setInvoices([]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">View Invoices</h1>
      <div className="w-full max-w-lg">
        <label className="block font-semibold text-gray-600 mb-2">
          Select Customer
        </label>
        <select
          value={customerId}
          onChange={handleCustomerChange}
          className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a Customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="mt-6 text-gray-600">Loading invoices...</div>
      ) : error ? (
        <div className="mt-6 text-red-600">{error}</div>
      ) : invoices.length > 0 ? (
        <div className="mt-6 w-full max-w-lg bg-white shadow-md rounded p-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Invoices for {invoices[0]?.customer?.name || ""}
          </h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b-2 p-2">Invoice ID</th>
                <th className="border-b-2 p-2">Amount</th>
                <th className="border-b-2 p-2">Status</th>
                <th className="border-b-2 p-2">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="p-2">{invoice.id}</td>
                  <td className="p-2">${invoice.amount.toFixed(2)}</td>
                  <td className="p-2 capitalize">{invoice.status}</td>
                  <td className="p-2">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : customerId && !loading ? (
        <div className="mt-6 text-gray-600">No invoices found for this customer.</div>
      ) : null}
    </div>
  );
}

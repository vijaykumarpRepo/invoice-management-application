"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { motion } from "framer-motion";

export default function AddCustomer() {
  const { data: session } = useSession();
  const router = useRouter(); // Initialize router
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // Message state for success/error
  const [customers, setCustomers] = useState([]); // List of existing customers

  // Fetch existing customers when the component mounts
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

  const addCustomer = async () => {
    if (!session) {
      setMessage("You must be logged in to add a customer.");
      return;
    }

    if (!name.trim()) {
      setMessage("Customer name is required.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken || ""}`,
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        setMessage("Customer added successfully!");
        setName(""); // Reset form
        const newCustomer = await response.json();
        setCustomers((prev) => [...prev, newCustomer]); // Add new customer to list
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.message || "Failed to add customer"}`);
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 p-6"
    >
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Add Customer
        </h1>
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mb-4 p-3 rounded text-center ${
              message.includes("successfully")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </motion.p>
        )}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="customerName"
              className="block font-semibold text-gray-600 mb-2"
            >
              Customer Name
            </label>
            <input
              id="customerName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter customer name"
              disabled={loading}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={addCustomer}
            disabled={loading}
            className={`w-full bg-blue-500 text-white py-2 px-4 rounded font-semibold hover:bg-blue-600 transition focus:ring-2 focus:ring-blue-400 ${
              loading ? "cursor-not-allowed opacity-70" : ""
            }`}
          >
            {loading ? (
              <span className="flex justify-center items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.963 7.963 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Adding...
              </span>
            ) : (
              "Add Customer"
            )}
          </button>
          <button
            onClick={() => router.push("/addinginvoice")}
            className="w-full bg-green-500 text-white py-2 px-4 rounded font-semibold hover:bg-green-600 transition focus:ring-2 focus:ring-green-400"
          >
            Go to Add Invoice
          </button>
        </div>
      </div>
      {customers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 bg-white shadow-md rounded-lg p-6 w-full max-w-md"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Existing Customers
          </h2>
          <ul className="divide-y divide-gray-200">
            {customers.map((customer) => (
              <li
                key={customer.id}
                className="py-2 text-gray-700 hover:bg-gray-50 px-2 rounded"
              >
                {customer.name}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}

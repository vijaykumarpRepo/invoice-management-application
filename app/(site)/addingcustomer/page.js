"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function AddCustomer() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const addCustomer = async () => {
    if (!session) {
      alert("You must be logged in to add a customer.");
      return;
    }

    if (!name.trim()) {
      alert("Customer name is required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken || ""}`, // Include session token if required
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        alert("Customer added successfully!");
        setName(""); // Reset form
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || "Failed to add customer"}`);
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Add Customer</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Customer Name"
        disabled={loading}
      />
      <button onClick={addCustomer} disabled={loading}>
        {loading ? "Adding..." : "Add Customer"}
      </button>
    </div>
  );
}

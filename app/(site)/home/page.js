"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion"; // Import Framer Motion for animations

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/goodbye" });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 via-indigo-100 to-purple-50 p-6"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl"
      >
        <h1 className="text-4xl font-bold text-center text-indigo-600 mb-6">
          Welcome to Your Dashboard
        </h1>
        <motion.div
          className="grid grid-cols-2 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { staggerChildren: 0.2 },
            },
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/addingcustomer")}
            className="bg-blue-500 text-white py-3 px-4 rounded-lg shadow-md hover:bg-blue-600 transition"
          >
            Add Customer
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/addinginvoice")}
            className="bg-green-500 text-white py-3 px-4 rounded-lg shadow-md hover:bg-green-600 transition"
          >
            Add Invoice
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/customer")}
            className="bg-indigo-500 text-white py-3 px-4 rounded-lg shadow-md hover:bg-indigo-600 transition"
          >
            List Customers
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/listinginvoice")}
            className="bg-yellow-500 text-white py-3 px-4 rounded-lg shadow-md hover:bg-yellow-600 transition"
          >
            List Invoices
          </motion.button>
        </motion.div>
        <div className="mt-8 text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="bg-red-500 text-white py-3 px-6 rounded-lg shadow-md hover:bg-red-600 transition"
          >
            Logout
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

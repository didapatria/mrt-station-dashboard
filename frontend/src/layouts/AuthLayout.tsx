import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { motion } from "framer-motion";
import { Train } from "lucide-react";

export default function AuthLayout() {
  const { token } = useAuthStore();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center text-white"
        >
          <Train className="h-20 w-20 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">MRT Jakarta</h1>
          <p className="text-lg opacity-90">
            Station Management Dashboard
          </p>
          <p className="text-sm opacity-70 mt-2">
            Manage stations, schedules, and operations
          </p>
        </motion.div>
      </div>

      {/* Right side - auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}

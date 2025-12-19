"use client";

import { Calculator } from "lucide-react";
import Link from "next/link";

export default function HomeNavbar() {
  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center h-18">
          {/* Logo - Centered */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                GraderX
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                LNMIIT Calculator
              </p>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}

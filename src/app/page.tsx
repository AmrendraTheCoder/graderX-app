"use client";

import { useState, useEffect } from "react";
import HomeNavbar from "@/components/home-navbar";
import HomeFooter from "@/components/home-footer";
import { PublicGradeCalculator } from "@/components/public-grade-calculator";
import {
  Calculator,
  GraduationCap,
  Target,
  Zap,
  BookOpen,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Loading component for the calculator
function CalculatorSkeleton() {
  return (
    <div className="animate-pulse bg-gray-100 rounded-xl p-8 h-96 flex items-center justify-center">
      <div className="text-center text-gray-400">
        <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Loading calculator...</p>
      </div>
    </div>
  );
}

// Wrapper component to handle calculator rendering safely
function SafeCalculator({ subjects }: { subjects: any[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <CalculatorSkeleton />;
  }

  return <PublicGradeCalculator subjects={subjects || []} />;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  credits: number;
  semester: number;
  branch?: string;
}

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/subjects");
        if (response.ok) {
          const data = await response.json();
          setSubjects(data);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* <HomeNavbar /> */}

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-20 pb-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              {/* <GraduationCap className="w-12 h-12 text-blue-600" /> */}
              <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                LNMIIT Grading System
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
              Calculate Your CGPA
              <br />
              <span className="text-4xl md:text-5xl">Instantly & Accurately</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              The official grade calculator for LNMIIT students. Track your
              academic progress, calculate SGPA/CGPA, and plan your semester goals.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              {/* <Link href="/sign-up">
                <Button size="lg" className="gap-2">
                  <Sparkles className="w-5 h-5" />
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link> */}
              <Link href="#calculator">
                <Button size="lg" variant="outline" className="gap-2">
                  <Calculator className="w-5 h-5" />
                  Try Calculator
                </Button>
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Instant Results</p>
                  <p className="text-sm text-gray-500">Real-time calculation</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">All Branches</p>
                  <p className="text-sm text-gray-500">CSE, ECE, ME & more</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Track Progress</p>
                  <p className="text-sm text-gray-500">Semester-wise view</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Calculator Section */}
        <section id="calculator" className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <Target className="inline-block w-8 h-8 mr-2 text-blue-600" />
              SGPA/CGPA Calculator
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Add your subjects and grades below to calculate your Semester Grade
              Point Average (SGPA). Sign up to save your data and track your overall
              CGPA.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <Suspense fallback={<CalculatorSkeleton />}>
              {loading ? (
                <CalculatorSkeleton />
              ) : (
                <SafeCalculator subjects={subjects} />
              )}
            </Suspense>
          </div>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}

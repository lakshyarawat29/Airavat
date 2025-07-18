"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Activity, Mail } from "lucide-react"

export default function MainPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900 mb-2 leading-15">
            Banking Request System Powered
            <br />
            By Airavat
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Monitor real-time third-party data requests and manage
            communications
          </p>
        </div>

        <div className="flex gap-8 justify-center">
          <Link href="/live-feed">
            <Button
              size="lg"
              className="px-12 py-6 text-xl font-semibold bg-blue-600 hover:bg-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <Activity className="w-6 h-6 mr-3" />
              Live Feed
            </Button>
          </Link>

          <Link href="/send-mail">
            <Button
              size="lg"
              variant="outline"
              className="px-12 py-6 text-xl font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 bg-white"
            >
              <Mail className="w-6 h-6 mr-3" />
              Send Mail
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

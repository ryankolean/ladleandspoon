import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "sonner"
import { supabase } from "@/lib/supabase"
import { Coffee, AlertCircle } from "lucide-react"

function App() {
  if (!supabase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Configuration Error
            </h1>
            <p className="text-gray-600 mb-4">
              The application cannot connect to the database. Please ensure your environment variables are configured correctly.
            </p>
            <div className="bg-gray-50 rounded-md p-4 text-left text-sm">
              <p className="font-semibold text-gray-700 mb-2">Required Variables:</p>
              <ul className="space-y-1 text-gray-600">
                <li>• VITE_SUPABASE_URL</li>
                <li>• VITE_SUPABASE_ANON_KEY</li>
              </ul>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Check the browser console for more details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Pages />
      <Toaster />
    </>
  )
}

export default App 
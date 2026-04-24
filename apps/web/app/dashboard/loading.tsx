import { Shield } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative">
        {/* Pulsing outer rings */}
        <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-lg animate-pulse delay-75" />
        
        {/* Shield icon */}
        <div className="relative bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-xl">
          <Shield className="w-10 h-10 text-cyan-400 animate-pulse" />
        </div>
      </div>
      
      <div className="mt-6 flex flex-col items-center">
        <h3 className="text-white font-medium text-lg mb-1 animate-pulse">Loading Secure Environment</h3>
        <p className="text-sm text-slate-500">Decrypting dashboard modules...</p>
      </div>

      <div className="mt-8 w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-[shimmer_1.5s_infinite] w-[40%]" 
             style={{ backgroundSize: '200% 100%' }} />
      </div>
    </div>
  )
}

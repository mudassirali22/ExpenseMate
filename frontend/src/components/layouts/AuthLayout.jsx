import React from 'react'
import CARD_2 from "../../assets/images/card2.png";
import { LuTrendingUpDown } from "react-icons/lu";

const AuthLayout = ({children}) => {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 overflow-y-auto z-10 p-12">
        <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-4 absolute top-8 left-8 sm:left-16 lg:left-24">EXPENSIFY</h2>
        <div className="max-w-md w-full mx-auto animate-fade-in-up mt-12">
            {children}
        </div>
      </div>

      {/* Right side: Visuals */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/30 rounded-full blur-[120px] pointer-events-none"/>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/30 rounded-full blur-[120px] pointer-events-none"/>
        <div className="w-64 h-64 rounded-full border border-white/5 absolute -top-20 -right-20 pointer-events-none" />
        <div className="w-96 h-96 rounded-full border border-white/5 absolute -bottom-32 -left-32 pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
          <div className="w-full mb-8">
            <StatsInfoCard
              icon={<LuTrendingUpDown size={28}/>}
              label="Track Your Income & Expenses"
              value="430,000"
              color="bg-indigo-500"
            />
          </div>

          <div className="relative w-[340px] xl:w-[420px] rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-500/20 border border-white/10 group">
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10 opacity-60"></div>
             <img src={CARD_2} className="w-full relative z-0 transform transition-transform duration-700 group-hover:scale-105" alt="Dashboard Preview" />
          </div>
        </div>  
      </div>
    </div>
  )
}

export default AuthLayout

const StatsInfoCard = ({icon, label, color, value}) => {
  return (
    <div className='glass-panel-dark flex items-center gap-6 p-6'>
      <div className={`w-14 h-14 flex items-center justify-center text-white ${color} rounded-2xl shadow-lg`}>
        {icon}
      </div>
      <div>
        <h6 className="text-sm font-semibold text-slate-300 mb-1 tracking-wide">{label}</h6>
        <span className="text-2xl font-black text-white">${value}</span>
      </div>
    </div>
  )
}
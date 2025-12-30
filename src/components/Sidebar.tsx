import Link from 'next/link';
import { Home, Users, CreditCard, BarChart3, MapPin, IndianRupee, BookOpen } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="hidden md:flex flex-col w-64 bg-gray-900 text-white h-full border-r border-gray-800 shadow-xl">
      <div className="p-6 flex items-center space-x-3 border-b border-gray-800">
        <div className="bg-blue-600 p-2 rounded-lg">
          <BookOpen size={24} className="text-white" />
        </div>
        <span className="text-xl font-bold tracking-wide">Evolve</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <Link href="/" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-800 transition-all duration-200 group">
          <Home size={20} />
          <span className="font-medium">Dashboard</span>
        </Link>
        <Link href="/seats" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-800 transition-all duration-200 group">
          <MapPin size={20} />
          <span className="font-medium">Seats & Subscriptions</span>
        </Link>
        <Link href="/members" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-800 transition-all duration-200 group">
          <Users size={20} />
          <span className="font-medium">Members</span>
        </Link>
        <Link href="/expenses" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-800 transition-all duration-200 group">
          <IndianRupee size={20} />
          <span className="font-medium">Expenses</span>
        </Link>
        <Link href="/reports" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-800 transition-all duration-200 group">
          <BarChart3 size={20} />
          <span className="font-medium">Reports</span>
        </Link>
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
            KG
          </div>
          <div className="text-sm">
            <p className="font-medium">Admin User</p>
            <p className="text-gray-400 text-xs">admin@evolve.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
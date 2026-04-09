import { Users, UserCheck, UserX, TrendingUp, DollarSign, Clock } from 'lucide-react'

const stats = [
  { label: 'Total Employees', value: '1,284', icon: Users, color: 'bg-blue-500', change: '+12 this month' },
  { label: 'Active', value: '1,198', icon: UserCheck, color: 'bg-green-500', change: '93.3% of total' },
  { label: 'On Leave', value: '86', icon: Clock, color: 'bg-yellow-500', change: '6.7% of total' },
  { label: 'Turnover Rate', value: '4.2%', icon: TrendingUp, color: 'bg-purple-500', change: '-0.8% vs last month' },
  { label: 'Avg. Salary', value: '$72,400', icon: DollarSign, color: 'bg-indigo-500', change: '+3.1% YoY' },
  { label: 'Open Positions', value: '34', icon: UserX, color: 'bg-red-500', change: '12 urgent' },
]

const recentHires = [
  { name: 'Sarah Johnson', role: 'Software Engineer', dept: 'Engineering', date: 'Apr 7, 2026', avatar: 'SJ' },
  { name: 'Marcus Lee', role: 'Product Manager', dept: 'Product', date: 'Apr 5, 2026', avatar: 'ML' },
  { name: 'Priya Patel', role: 'UX Designer', dept: 'Design', date: 'Apr 3, 2026', avatar: 'PP' },
  { name: 'James Carter', role: 'Data Analyst', dept: 'Analytics', date: 'Apr 1, 2026', avatar: 'JC' },
  { name: 'Aisha Nguyen', role: 'HR Specialist', dept: 'HR', date: 'Mar 28, 2026', avatar: 'AN' },
]

const departments = [
  { name: 'Engineering', headcount: 312, budget: '$8.2M', openRoles: 8 },
  { name: 'Sales', headcount: 245, budget: '$5.1M', openRoles: 12 },
  { name: 'Marketing', headcount: 134, budget: '$3.4M', openRoles: 4 },
  { name: 'Product', headcount: 89, budget: '$2.8M', openRoles: 3 },
  { name: 'Design', headcount: 67, budget: '$1.9M', openRoles: 5 },
  { name: 'HR', headcount: 54, budget: '$1.2M', openRoles: 2 },
]

export default function HRDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
          <p className="text-sm text-gray-500">Wednesday, April 9, 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            HR
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Admin</p>
            <p className="text-xs text-gray-500">HR Manager</p>
          </div>
        </div>
      </header>

      <main className="px-8 py-6 max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{stat.change}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Hires */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Hires</h2>
            <div className="space-y-4">
              {recentHires.map((hire) => (
                <div key={hire.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                      {hire.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{hire.name}</p>
                      <p className="text-xs text-gray-500">{hire.role} · {hire.dept}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{hire.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Department Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Department Overview</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-medium">Department</th>
                  <th className="pb-2 font-medium text-right">Headcount</th>
                  <th className="pb-2 font-medium text-right">Budget</th>
                  <th className="pb-2 font-medium text-right">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {departments.map((dept) => (
                  <tr key={dept.name} className="hover:bg-gray-50">
                    <td className="py-2.5 font-medium text-gray-800">{dept.name}</td>
                    <td className="py-2.5 text-right text-gray-600">{dept.headcount}</td>
                    <td className="py-2.5 text-right text-gray-600">{dept.budget}</td>
                    <td className="py-2.5 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        dept.openRoles >= 8 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {dept.openRoles}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

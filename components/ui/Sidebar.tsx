'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  Home,
  LayoutDashboard,
  Package,
  Ticket,
  Upload,
  BookOpen,
  Settings,
  LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/',               label: 'Accueil',          icon: Home,            exact: true },
  { href: '/dashboard',      label: 'Tableau de bord',  icon: LayoutDashboard, exact: true },
  { href: '/catalogue',      label: 'Catalogue',         icon: Package,         exact: false },
  { href: '/tickets',        label: 'Tickets SAV',       icon: Ticket,          exact: false },
  { href: '/knowledge-base', label: 'Documents',         icon: BookOpen,        exact: false },
  { href: '/upload',         label: 'Importer',          icon: Upload,          exact: true },
  { href: '/admin',          label: 'Administration',    icon: Settings,        exact: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-full flex-shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-delabie-blue rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">PartiQ SAV</h1>
            <p className="text-gray-400 text-xs">Assistant IA DELABIE</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                isActive
                  ? 'bg-delabie-blue text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-700">
        {session?.user ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2">
              <div className="w-7 h-7 rounded-full bg-delabie-blue flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {session.user.name?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
                <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              Déconnexion
            </button>
          </div>
        ) : (
          <p className="text-gray-500 text-xs text-center">v1.0 · PartiQ SAV</p>
        )}
      </div>
    </aside>
  )
}

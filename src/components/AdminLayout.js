import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Palette,
  FileText,
  Mail,
  Layers,
  LogOut,
  ExternalLink,
  Database,
  Home,
  User,
  Users,
  ImageIcon,
  Tag,
} from 'lucide-react';
import { useAdminAuth } from '../context/AuthContext';

const NAV = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/categories', icon: Layers, label: 'Categories' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/admin/customers', icon: Users, label: 'Customers' },
  { href: '/admin/coupons', icon: Tag, label: 'Coupons' },
  { href: '/admin/homepage', icon: Home, label: 'Homepage' },
  { href: '/admin/design', icon: Palette, label: 'Design & Branding' },
  { href: '/admin/policies', icon: FileText, label: 'Policies & Footer' },
  { href: '/admin/newsletter', icon: Mail, label: 'Newsletter' },
  { href: '/admin/images', icon: ImageIcon, label: 'Image Storage' },
  { href: '/admin/settings', icon: Settings, label: 'Setup' },
  { href: '/admin/profile', icon: User, label: 'My Profile' },
  { href: '/admin/seed', icon: Database, label: 'Seed Database' },
];

export default function AdminLayout({ children, title }) {
  const router = useRouter();
  const { logout, user } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 hidden lg:flex flex-col fixed h-full z-40">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-serif font-medium tracking-widest text-gold">ShopHub</h2>
          <p className="text-xs text-gray-500 mt-1 truncate">{user?.email}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                router.pathname === href || router.pathname.startsWith(href + '/')
                  ? 'bg-gold text-white shadow-lg'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition"
          >
            <ExternalLink className="w-4 h-4" /> View Store
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 w-full transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64">
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 lg:hidden flex justify-between items-center sticky top-0 z-30">
          <span className="font-bold text-orange-500">ShopHub Admin</span>
          <select
            onChange={(e) => router.push(e.target.value)}
            value={router.pathname}
            className="bg-gray-800 text-sm rounded px-2 py-1 border border-gray-700"
          >
            {NAV.map(({ href, label }) => (
              <option key={href} value={href}>{label}</option>
            ))}
          </select>
        </header>
        <main className="p-6 lg:p-8">
          {title && (
            <h1 className="text-2xl lg:text-3xl font-extrabold mb-8 text-white">{title}</h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

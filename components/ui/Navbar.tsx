"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "./Button";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/catalogue", label: "Catalogue" },
  { href: "/dashboard", label: "Tableau de bord" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="bg-delabie-blue shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-delabie-blue" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                </svg>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">PartiQ SAV</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {session?.user && (
              <>
                <span className="text-blue-100 text-sm hidden sm:block">
                  {session.user.name}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                >
                  Déconnexion
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

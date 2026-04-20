"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Moon, Sun, Search, Menu, Bell, BookOpen, PenTool, MessageSquare, Radio, Home, User, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navLinks = [
  { href: "/",         label: "Accueil",  icon: Home },
  { href: "/da",       label: "DA",       icon: BookOpen },
  { href: "/ateliers", label: "Ateliers", icon: PenTool },
  { href: "/lire",     label: "Lire",     icon: BookOpen },
  { href: "/agora",    label: "Agora",    icon: MessageSquare },
  { href: "/lives",    label: "Lives",    icon: Radio },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <nav className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-3 sm:px-6">

        {/* Logo */}
        <Link href="/" className="group mr-2 flex shrink-0 items-center gap-0 sm:mr-4">
          <span className="font-serif text-lg italic text-foreground transition-colors duration-150 group-hover:text-[var(--accent)] sm:text-xl">
            Margin
          </span>
          <span className="font-sans text-lg font-light text-muted-foreground transition-colors duration-150 group-hover:text-[var(--accent)] sm:text-xl">
            alia
          </span>
        </Link>

        {/* Nav desktop */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150",
                  active
                    ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Actions desktop */}
        <div className="hidden md:flex items-center gap-1 ml-auto">
          <Button variant="ghost" size="icon" aria-label="Rechercher">
            <Search size={17} />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell size={17} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Changer le thème"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun size={17} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon size={17} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <Link
                href="/profil"
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <User size={14} />
                {user.user_metadata?.username ?? user.email?.split("@")[0]}
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground gap-1.5"
              >
                <LogOut size={14} />
                Déconnexion
              </Button>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "ml-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
                )}
              >
                Connexion
              </Link>
              <Link
                href="/auth/register"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white border-transparent"
                )}
              >
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 ml-auto md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Changer le thème"
          >
            <Sun size={17} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon size={17} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className={buttonVariants({ variant: "ghost", size: "icon" })}
              aria-label="Menu"
            >
              <Menu size={20} />
            </SheetTrigger>
            <SheetContent side="right" className="w-[88vw] max-w-72 pt-10">
              <nav className="flex flex-col gap-1">
                {navLinks.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <Icon size={16} />
                      {label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-6 flex flex-col gap-2 px-4">
                {user ? (
                  <>
                    <Link
                      href="/profil"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-1.5 rounded-md border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary"
                    >
                      <User size={14} />
                      {user.user_metadata?.username ?? user.email?.split("@")[0]}
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="gap-1.5"
                    >
                      <LogOut size={14} />
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "border-[var(--accent)] text-[var(--accent)]"
                      )}
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        buttonVariants({}),
                        "bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 border-transparent"
                      )}
                    >
                      S&apos;inscrire
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </nav>
    </header>
  );
}

"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import { Menu, CircleUser } from "lucide-react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { useTheme } from "@/hook/ThemeProvider";
import { cn } from "@/lib/utils";

import { LoginItem } from "./LoginItem";

const navigations = [
  {
    id: "home",
    url: "/",
    onlyMobile: false,
  },
  {
    id: "events",
    url: "/events/",
    onlyMobile: false,
  },
  {
    id: "registration",
    url: "/registration/",
    onlyMobile: false,
  },
  {
    id: "documents",
    url: "/documents/",
    onlyMobile: false,
  },
  {
    id: "favorites",
    url: "/favorites/",
    onlyMobile: false,
  },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background/75 px-4 backdrop-blur-sm lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <div className="flex-1 shrink-0 lg:hidden">
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </div>
        </SheetTrigger>
        <SheetContent side="left">
          <h1 className="text-2xl font-semibold">Fido App</h1>
          <div className="my-4 h-[1px] w-full border-b border-border" />
          <nav className="grid gap-6 text-lg font-medium">
            {navigations.map((nav) => (
              <a
                key={nav.id}
                href={nav.url}
                className={`${
                  pathname.replace(/\/[^/]+/, "") === nav.url
                    ? "text-foreground"
                    : "text-muted-foreground"
                } capitalize transition-colors hover:text-foreground`}
              >
                {nav.id}
              </a>
            ))}
            <ThemeButton />
          </nav>
        </SheetContent>
      </Sheet>
      <a
        href="#"
        className="mr-4 flex w-10 items-center gap-2 text-lg font-semibold lg:flex-1"
      >
        <Image
          src="/logo.png"
          alt="TZC"
          width={40}
          height={40}
          priority
          className="brightness-95 dark:brightness-100"
        />
        <span className="sr-only">FIDO App</span>
      </a>
      <nav className="hidden flex-col gap-6 text-lg font-medium lg:flex lg:flex-row lg:items-center lg:gap-6 lg:text-sm">
        {navigations.map(
          (nav) =>
            !nav.onlyMobile && (
              <a
                key={nav.id}
                href={nav.url}
                className={`${
                  pathname.replace(/\/[^/]+/, "") === nav.url
                    ? "text-foreground"
                    : "text-muted-foreground"
                } capitalize transition-colors hover:text-foreground`}
              >
                {nav.id}
              </a>
            ),
        )}
      </nav>
      <div className="flex w-full flex-1 items-center justify-end gap-4 lg:gap-4">
        <ThemeButton className="hidden lg:block" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <LoginItem />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function ThemeButton({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      // className="rounded-full bg-gray-200 p-2 dark:bg-gray-800"
      className={cn("rounded-full p-2", className)}
      variant="secondary"
      onClick={() => {
        setTheme(theme === "light" ? "dark" : "light");
      }}
    >
      {/* {theme === "light" ? "☀️" : "🌙"} */}
      {theme === "light" ? (
        <Sun className="aspect-square" />
      ) : (
        <Moon className="aspect-square" />
      )}
    </Button>
  );
}

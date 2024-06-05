"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import { Menu, CircleUser, Fingerprint } from "lucide-react";
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
import type { Session } from "@/lib/auth/types";
import { cn } from "@/lib/utils/cn";

import { LoginItem } from "./LoginItem";
import { LogoutItem } from "./LogoutItem";

const navigations = [
  {
    id: "home",
    url: "/",
    onlyMobile: false,
  },
  {
    id: "guides",
    url: "/guides/",
    onlyMobile: false,
  },
];
// const navigations = [
//   {
//     id: "home",
//     url: "/",
//     onlyMobile: false,
//   },
//   {
//     id: "events",
//     url: "/events/",
//     onlyMobile: false,
//   },
//   {
//     id: "registration",
//     url: "/registration/",
//     onlyMobile: false,
//   },
//   {
//     id: "documents",
//     url: "/documents/",
//     onlyMobile: false,
//   },
//   {
//     id: "favorites",
//     url: "/favorites/",
//     onlyMobile: false,
//   },
// ];

export function Header({ session }: { session: Session }) {
  const isLogin = !!session?.user;
  const pathname = usePathname();

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background/75 px-4 backdrop-blur-sm lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <div className="flex-1 shrink-0 lg:hidden">
            <Button variant="outline" size="icon">
              <Menu className="size-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </div>
        </SheetTrigger>
        <SheetContent side="left">
          <h1 className="font-mono text-4xl font-semibold">FIDOG</h1>
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
        href="/"
        className="flex w-fit items-center gap-1 font-mono text-3xl font-semibold tracking-wider lg:flex-1"
      >
        <p className="hidden sm:block"> FID</p>
        <Image
          src="/logo.png"
          alt="TZC"
          width={48}
          height={48}
          priority
          className="w-12 brightness-110 sm:w-9 dark:brightness-100"
        />
        <p className="hidden sm:block">
          <span className="text-xl">G</span>
        </p>
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
      <div className="flex w-full flex-1 items-center justify-end gap-2">
        <ThemeButton className="hidden lg:block" />
        <UserButton isLogin={isLogin} pathname={pathname} />
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
        <Sun className="aspect-square transition-transform hover:rotate-45" />
      ) : (
        <Moon className="aspect-square transition-transform hover:rotate-45" />
      )}
    </Button>
  );
}

function UserButton({
  className,
  isLogin,
  pathname,
}: {
  className?: string;
  isLogin: boolean;
  pathname: string;
}) {
  return isLogin ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className={cn("rounded-full p-2", className)}
        >
          <CircleUser className="aspect-square" />
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <a href="/account/security">Security</a>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-muted-foreground">
          Support
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isLogin ? <LogoutItem /> : <LoginItem />}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <a href={`/auth?redirect=${pathname}`}>
      <Button
        variant="default"
        size="icon"
        className={cn(
          "group rounded-full bg-transparent p-2 md:bg-primary",
          className,
        )}
      >
        <Fingerprint className="aspect-square transition-all group-hover:scale-110" />
        <span className="sr-only">Toggle user menu</span>
      </Button>
    </a>
  );
}

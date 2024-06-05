"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CredEdit() {
  return (
    <Button
      variant={"secondary"}
      className="rounded-full group-hover:bg-background group-hover:hover:bg-primary"
      size={"icon"}
    >
      <X size={18} />
    </Button>
  );
}

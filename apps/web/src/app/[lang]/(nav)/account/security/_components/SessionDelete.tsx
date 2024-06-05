"use client";

import type { FormEvent } from "react";

import { useRouter } from "next/navigation";

import axios from "axios";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  sessionId: string;
};

export function SessionDelete(props: Props) {
  const router = useRouter();

  const handleDelete = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.delete(`/api/sessions/${props.sessionId}`);
    } catch (error) {
      console.error(error);
    } finally {
      router.refresh();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"secondary"}
          className="rounded-full group-hover:bg-background group-hover:hover:bg-primary"
          size={"icon"}
        >
          <X size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. You need to login again on this
            device.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <form onSubmit={handleDelete}>
            <Button variant={"destructive"} size={"sm"}>
              Delete
            </Button>
          </form>
          <DialogClose asChild>
            <Button variant={"secondary"} size={"sm"}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

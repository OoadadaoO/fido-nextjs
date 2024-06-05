"use client";

import type { FormEvent } from "react";

import { useRouter } from "next/navigation";

import axios from "axios";
import { Trash2 } from "lucide-react";

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
  credentialId: string;
};

export function CredentialDelete(props: Props) {
  const router = useRouter();

  const handleDelete = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post(`/api/credentials/${props.credentialId}`);
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"secondary"}
          className="rounded-full hover:bg-destructive"
          size={"icon"}
        >
          <Trash2 size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. You can never use this credential
            anymore.
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

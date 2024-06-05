"use client";

import { type FormEvent } from "react";

import { useRouter } from "next/navigation";

import axios from "axios";

import { Button } from "@/components/ui/button";
import { Assertion, type AssertionObj } from "@/lib/auth/credentials";
import { getIdAxios } from "@/lib/axios";
import { publicEnv } from "@/lib/env/public";
import { base64Url } from "@/lib/utils/base64Url";

type Props = {
  challenge: string;
};

export function Login({ challenge }: Props) {
  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const idAxios = await getIdAxios();

    // get public key
    const publicKey: PublicKeyCredentialRequestOptions = {
      challenge: base64Url.decode(challenge),
      rpId: publicEnv.NEXT_PUBLIC_RP_ID,
      userVerification: "required",
      timeout: 120000,
    };

    // find discoverable credential
    try {
      const credential = (await navigator.credentials.get({
        publicKey,
      })) as AssertionObj | null;
      if (!credential) throw new Error("No credential");

      const assertionJSON = Assertion.toJSON(credential); // sennd to server

      const res = await idAxios.post(`/api/auth/login`, assertionJSON);
      console.log(res.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data);
      } else {
        console.error(error);
      }
    }
    router.refresh();
  };
  return (
    <div className="flex w-[330px] flex-col gap-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
        <p className="text-sm text-muted-foreground">
          Use your trust model to login.
        </p>
      </div>
      <form className="grid gap-4" onSubmit={handleLogin}>
        <Button variant="default" size="sm" className="w-full" type="submit">
          Choose Key
        </Button>
      </form>
    </div>
  );
}

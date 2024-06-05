"use client";

import { type FormEvent, useState } from "react";

import { useRouter } from "next/navigation";

import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Attestation, type AttestationObj } from "@/lib/auth/credentials";
import { getIdAxios } from "@/lib/axios";
import { publicEnv } from "@/lib/env/public";
import { base64Url } from "@/lib/utils/base64Url";

type Props = {
  id: string;
  challenge: string;
};

export function SignUp({ id, challenge }: Props) {
  // challenge from cookie
  const [username, setUsername] = useState<string>("");
  const router = useRouter();

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const idAxios = await getIdAxios();

    // create public key
    const publicKey: PublicKeyCredentialCreationOptions = {
      challenge: base64Url.decode(challenge),
      rp: {
        name: "FIDO APP",
        id: publicEnv.NEXT_PUBLIC_RP_ID,
      },
      user: {
        id: base64Url.decode(id),
        name: username,
        displayName: username,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        // { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: {
        residentKey: "required",
        requireResidentKey: true,
        userVerification: "required",
      },
      timeout: 120000,
      attestation: "direct",
    };

    // create credential
    try {
      const credential = (await navigator.credentials.create({
        publicKey,
      })) as AttestationObj | null;
      if (!credential) throw new Error("No credential");

      const attestationJSON = Attestation.toJSON(credential); // sennd to server

      const res = await idAxios.post(
        `/api/auth/register?${new URLSearchParams({ username })}`,
        attestationJSON,
      );
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
        <h1 className="text-2xl font-semibold tracking-tight">Sign Up</h1>
        <p className="text-sm text-muted-foreground">
          Use your trust model to create an account.
        </p>
      </div>
      <form className="grid gap-2" onSubmit={handleRegister}>
        <Input
          type="text"
          name="username"
          placeholder="Your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Button variant="default" size="sm" className="w-full" type="submit">
          Continue
        </Button>
      </form>
      <p className="px-8 text-center text-sm text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}

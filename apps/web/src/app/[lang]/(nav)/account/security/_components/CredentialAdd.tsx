"use client";

import { type FormEvent } from "react";

import { useRouter } from "next/navigation";

import axios from "axios";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSession } from "@/hook/SessionContext";
import { Attestation, type AttestationObj } from "@/lib/auth/credentials";
import { getIdAxios } from "@/lib/axios";
import { publicEnv } from "@/lib/env/public";
import { base64Url } from "@/lib/utils/base64Url";

type Props = {
  id: string;
  challenge: string;
};

export function CredentialAdd({ challenge, id }: Props) {
  const router = useRouter();
  const { ready, session } = useSession();
  if (!session || !session.user) {
    return null;
  }

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!ready) return;

    const idAxiosPromise = getIdAxios();

    while (!navigator.credentials) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // create public key
    const publicKey: PublicKeyCredentialCreationOptions = {
      challenge: base64Url.decode(challenge),
      rp: {
        name: "FIDO APP",
        id: publicEnv.NEXT_PUBLIC_RP_ID,
      },
      user: {
        id: base64Url.decode(id),
        name: session.user.username,
        displayName: session.user.username,
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

      const idAxios = await idAxiosPromise;
      const res = await idAxios.post(
        `/api/auth/register?${new URLSearchParams({ username: session.user.username, redundant: "true" })}`,
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
    <form className="w-full" onSubmit={handleRegister}>
      <Button className="w-full">
        <Plus size={24} />
      </Button>
    </form>
  );
}

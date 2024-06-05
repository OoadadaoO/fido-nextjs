import { cookies } from "next/headers";
import Image from "next/image";

import { format } from "date-fns";
import { AppWindow, KeyRound } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { lAuth } from "@/lib/auth";
import { serverCred } from "@/lib/auth/config";
import { AAGUID, Credential, Session } from "@/lib/db";
import type {
  CredentialDocument,
  SessionDocument,
} from "@fido/database/src/schemas";

import { CredentialAdd } from "./_components/CredentialAdd";
import { CredentialDelete } from "./_components/CredentialDelete";
import { SessionDelete } from "./_components/SessionDelete";

type ExtCredential = CredentialDocument & {
  name: string;
  icon_light: string;
  icon_dark: string;
  sessions: SessionDocument[];
};

export default async function Page() {
  const token = await lAuth();
  if (!token) {
    return (
      <div className="mx-auto grid w-full max-w-[900px] grid-cols-1 gap-6 px-6 py-12">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">Passkeys</h1>
          <p className="text-muted-foreground">
            Manage your passkeys. You can add or remove your passkeys.
          </p>
        </div>
        You are unauthorized.
      </div>
    );
  }

  const challenge =
    cookies().get(serverCred.cookieName)?.value.split(".")[1] || "";
  const credentials: ExtCredential[] = (
    await Credential.find({ ownerId: token.sub }).exec()
  ).map((cred) => ({ ...cred.toJSON(), sessions: [] }));
  await Promise.all(
    credentials.map(async (cred) => {
      const metadata = await AAGUID.findById(cred.aaguid).exec();
      cred.name = metadata?.name || "Unknown";
      cred.icon_light = metadata?.icon_light || "";
      cred.icon_dark = metadata?.icon_dark || "";
      cred.sessions = (
        await Session.find({ userId: cred.ownerId, credentialId: cred.id })
          .sort({ "identifier.activeAt": "desc" })
          .exec()
      ).map((s) => s.toJSON());
    }),
  );

  return (
    <div className="mx-auto grid w-full max-w-[900px] grid-cols-1 gap-6 px-6 py-12">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">Passkeys</h1>
        <p className="text-muted-foreground">
          Manage your passkeys and their related sessions.
        </p>
      </div>
      {credentials.map((cred) => (
        <Card key={cred.id}>
          <CardHeader>
            <div className="flex items-center justify-between gap-6">
              {cred.name ? (
                <>
                  <Image
                    src={cred.icon_dark}
                    alt={cred.name}
                    height={36}
                    width={36}
                    className="hidden size-9 rounded-md dark:block"
                  />
                  <Image
                    src={cred.icon_light}
                    alt={cred.name}
                    height={36}
                    width={36}
                    className="block size-9 rounded-md dark:hidden"
                  />
                </>
              ) : (
                <KeyRound size={36} />
              )}
              <div className="grid flex-1">
                <CardTitle className="truncate text-xl">{cred.name}</CardTitle>
                <CardDescription>
                  Created: {format(cred.createdAt, "yyyy-MM-dd HH:mm")}
                </CardDescription>
              </div>
              <div className="space-x-2">
                {/* <Button
                  variant={"secondary"}
                  className="rounded-full hover:bg-primary"
                  size={"icon"}
                >
                  <Edit size={18} />
                </Button> */}
                {credentials.length > 1 && (
                  <CredentialDelete credentialId={cred.id} />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 px-1 pb-1">
            {cred.sessions.map((session) => (
              <div
                key={session.id}
                className="group ml-[60px] flex items-center justify-between gap-6 rounded-sm px-5 py-3 hover:bg-muted"
              >
                <div>
                  <AppWindow
                    size={36}
                    className="stroke-muted-foreground stroke-[1.5]"
                  />
                </div>
                <div className="grid flex-1">
                  <h2 className="mt-1 font-semibold">
                    {session.identifier.os} - {session.identifier.browser}
                  </h2>
                  <CardDescription>
                    Latest:{" "}
                    {format(session.identifier.activeAt, "yyyy-MM-dd HH:mm")}
                  </CardDescription>
                </div>
                {session.id === token.sid ? (
                  <div className="select-none text-muted-foreground">
                    You are here.
                  </div>
                ) : (
                  <SessionDelete sessionId={session.id} />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      <CredentialAdd id={token.sub} challenge={challenge} />
    </div>
  );
}

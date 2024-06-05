import axios from "axios";
import { decodeJwt } from "jose";

import type { AAGUIDType } from "@fido/database/src/types/db";

import { AAGUID } from "./db";

export async function recordAAGUIDs() {
  const aaguids = await getAAGUIDs();
  for (const aaguid of aaguids) {
    await AAGUID.findOneAndUpdate(
      { _id: aaguid.id },
      {
        $set: {
          name: aaguid.name,
          icon_dark: aaguid.icon_dark,
          icon_light: aaguid.icon_light,
          official: aaguid.official,
          status: aaguid.status,
        },
      },
      {
        upsert: true,
      },
    ).exec();
  }
  return aaguids;
}

async function getAAGUIDs() {
  const official = await getFromOfficial();
  const community = await getFromCommunity();
  // de-duplicate with the same id
  return official
    .concat(community)
    .reduce((acc: AAGUIDType[], cur: AAGUIDType) => {
      const found = acc.find((aaguid) => aaguid.id === cur.id);
      if (found) {
        return acc.map((aaguid) => {
          if (aaguid.id !== cur.id) {
            return aaguid;
          }
          return {
            ...aaguid,
            ...cur,
          };
        });
      }
      return acc.concat(cur);
    }, []);
}

async function getFromOfficial() {
  const blob = await axios.get("https://mds3.fidoalliance.org/");
  const jwt: string = blob.data;
  const decoded: any = decodeJwt(jwt);
  const official: AAGUIDType[] = decoded.entries.map((device: any) => {
    return {
      id: device.aaguid,
      name: device.metadataStatement.description,
      icon_dark: device.metadataStatement.icon,
      icon_light: device.metadataStatement.icon,
      official: true,
      status: device.statusReports.map((report: any) => report.status),
    };
  });
  return official;
}

async function getFromCommunity() {
  const res = await axios.get(
    "https://github.com/passkeydeveloper/passkey-authenticator-aaguids/raw/main/aaguid.json",
  );
  const json: any = res.data;
  const community: AAGUIDType[] = Object.keys(json).map((aaguid: string) => {
    return {
      id: aaguid,
      name: json[aaguid].name,
      icon_dark: json[aaguid].icon_dark,
      icon_light: json[aaguid].icon_light,
      official: false,
    };
  });
  return community;
}

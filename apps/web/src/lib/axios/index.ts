"use client";

import axios from "axios";

import { getIdentifier } from "../utils/device";

export const getIdAxios = async () =>
  axios.create({
    headers: { "X-Identifier": JSON.stringify(await getIdentifier()) },
  });

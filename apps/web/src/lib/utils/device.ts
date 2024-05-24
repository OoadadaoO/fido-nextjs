"use client";

export async function getIdentifier() {
  const ip = await getIP();
  const { os, browser } = getDevice();
  return { ip, os, browser };
}

export function getDevice() {
  const os = getClientOS();
  const browser = getClientBrowser().name;
  return { os, browser };
}

export async function getIP() {
  const res = await fetch("https://api.ipify.org?format=json", {
    cache: "no-store",
  });
  if (!res.ok) return "Unknown";
  const data = await res.json();
  return data.ip;
}

export function getClientOS() {
  const UA = navigator.userAgent;

  let OS = "Unknown";
  if (UA.indexOf("Win") != -1) OS = "Windows";
  if (UA.indexOf("Macintosh") != -1) {
    OS = "MacOS/iPadOS";
    // // navigator.standalone && navigator.standalone !== undefined
    // navigator.maxTouchPoints && navigator.maxTouchPoints > 2
    //   ? (OS = "iPadOS")
    //   : (OS = "MacOS");
  }
  if (UA.indexOf("X11") != -1) OS = "UNIX";
  if (UA.indexOf("Linux") != -1) OS = "Linux/Android";
  if (UA.indexOf("Android") != -1) OS = "Android";
  if (UA.indexOf("like Mac") != -1) OS = "iOS";
  if (UA.indexOf("iPad") != -1) OS = "iPadOS";

  return OS;
}

/**
 * credit: https://github.com/thumbmarkjs/thumbmarkjs/blob/main/src/components/system/browser.ts
 */
export function getClientBrowser() {
  if (!navigator || !navigator.userAgent) {
    return {
      name: "unknown",
      version: "unknown",
    };
  }
  const ua = navigator.userAgent;
  // Define some regular expressions to match different browsers and their versions
  const regexes = [
    // Edge
    /(?<name>Edge|Edg)\/(?<version>\d+(?:\.\d+)?)/,
    // Chrome, Chromium, Opera, Vivaldi, Brave, etc.
    /(?<name>(?:Chrome|Chromium|OPR|Opera|Vivaldi|Brave))\/(?<version>\d+(?:\.\d+)?)/,
    // Firefox, Waterfox, etc.
    /(?<name>(?:Firefox|Waterfox|Iceweasel|IceCat))\/(?<version>\d+(?:\.\d+)?)/,
    // Safari, Mobile Safari, etc.
    /(?<name>Safari)\/(?<version>\d+(?:\.\d+)?)/,
    // Internet Explorer, IE Mobile, etc.
    /(?<name>MSIE|Trident|IEMobile).+?(?<version>\d+(?:\.\d+)?)/,
    // Other browsers that use the format "BrowserName/version"
    /(?<name>[A-Za-z]+)\/(?<version>\d+(?:\.\d+)?)/,
    // Samsung internet browser
    /(?<name>SamsungBrowser)\/(?<version>\d+(?:\.\d+)?)/,
  ];

  // Define a map for browser name translations
  const browserNameMap: { [key: string]: string } = {
    Edg: "Edge",
    OPR: "Opera",
  };

  // Loop through the regexes and try to find a match
  for (const regex of regexes) {
    const match = ua.match(regex);
    if (match && match.groups) {
      // Translate the browser name if necessary
      const name = browserNameMap[match.groups.name] || match.groups.name;
      // Return the browser name and version
      return {
        name: name,
        version: match.groups.version,
      };
    }
  }

  // If no match is found, return unknown
  return {
    name: "unknown",
    version: "unknown",
  };
}

// ----------------------------------------------------------

// const platformDetails = await navigator.userAgentData.getHighEntropyValues(["architecture",
// "platform", "platformVersion", "model", "bitness", "uaFullVersion"]);
// console.log(platformDetails);

// export {};

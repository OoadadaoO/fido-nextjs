"use client";

export const checkSupport = () => {
  // WebAuthn is not supported
  if (!window.PublicKeyCredential) {
    return Promise.resolve(false);
  }
  // Platform authenticator is not available
  if (!PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
    return Promise.resolve(false);
  } else {
    return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  }
};

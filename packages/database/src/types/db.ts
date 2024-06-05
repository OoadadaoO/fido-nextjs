export type UserType = {
  id: string;
  username: string;
  permission: number;
  createdAt: Date;
};

export type SessionType = {
  id: string;
  userId: string;
  credentialId: string;
  identifier: {
    os: string;
    browser: string;
    ip: string;
    activeAt: Date;
  };
  createdAt: Date;
  expireAt: Date;
};

export type CredentialType = {
  id: string;
  credId: string;
  aaguid: string;
  counter: number;
  publicKey: string;
  ownerId: string;
  approverId: string;
  createdAt: Date;
  approvedAt: Date;
};

export type AAGUIDType = {
  id: string;
  name: string;
  icon_dark: string;
  icon_light: string;
  official: boolean;
  status?: string[];
};

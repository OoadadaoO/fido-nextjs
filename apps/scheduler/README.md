## AAGUID

### Source

- FIDO Official MDS: https://fidoalliance.org/metadata/
- Community-driven List: https://github.com/passkeydeveloper/passkey-authenticator-aaguids

### Schema

```ts
type IAAGUIDList = {
  [aaguid: string]: {
    name: string;
    icon_dark: string;
    icon_light: string;
    status?: string[];
  };
};
```

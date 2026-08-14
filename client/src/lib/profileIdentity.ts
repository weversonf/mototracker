type FirebaseProfileLike = {
  displayName?: string | null;
  email?: string | null;
} | null | undefined;

export type ProfileIdentity = {
  displayName: string;
  email: string;
  initials: string;
};

export function getProfileIdentity(user: FirebaseProfileLike): ProfileIdentity {
  const configuredName = user?.displayName?.trim();
  const configuredEmail = user?.email?.trim();
  const displayName = configuredName || "Piloto";
  const initials = (displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("") || "MT").toUpperCase();

  return {
    displayName,
    email: configuredEmail || "Conta Google conectada",
    initials,
  };
}

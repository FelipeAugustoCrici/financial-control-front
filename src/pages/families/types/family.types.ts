export type FamilyMember = {
  id: string;
  name: string;
};

export type Family = {
  id: string;
  name: string;
  members: FamilyMember[];
};

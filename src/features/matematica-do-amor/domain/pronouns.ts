import { isAddress, type AddressId } from "./types";

export type Pronouns = {
  id: AddressId;
  subject: string;
  subjectCap: string;
  possessive: string;
};

export function pronounsOf(address: string | undefined): Pronouns {
  if (!isAddress(address) || address === "pessoa") {
    return {
      id: "pessoa",
      subject: "essa pessoa",
      subjectCap: "Essa pessoa",
      possessive: "da outra pessoa",
    };
  }

  if (address === "ele") {
    return { id: "ele", subject: "ele", subjectCap: "Ele", possessive: "dele" };
  }

  return { id: "ela", subject: "ela", subjectCap: "Ela", possessive: "dela" };
}

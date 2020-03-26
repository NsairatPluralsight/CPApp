import { AuthenticatedUser } from "./user";
import { Language } from "./language";

export class Cache {
  user: AuthenticatedUser;
  languages: Language[];
  currentLanguage: Language;
}

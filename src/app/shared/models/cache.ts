import { Language } from './language';
import { AuthenticatedUser } from './authenticated-User';

export class Cache {
  public user: AuthenticatedUser;
  public languages: Language[];
  public currentLanguage: Language;
}

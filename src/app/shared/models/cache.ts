import { AuthenticatedUser } from './authenticated-User';
import { Language } from './language';
import { Branch } from './branch';

export class Cache {
  public user: AuthenticatedUser;
  public languages: Language[];
  public currentLanguage: Language;
  public branches: Branch[];
}

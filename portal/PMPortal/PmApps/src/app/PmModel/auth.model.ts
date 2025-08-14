export class AppUser  {
  username = '';
  password = '';
  rememberme = false;
}

// user Auth
export class AppUserAuth {
  userId: any;
  userName = '';
  bearerToken = '';
  isAuthenticated = false;
  roles: any;
  status: number;
  message: string;
  serverTimeZone:string;
}

export interface IAuthLogin {
  username?: string;
  password: string;
}

export interface IAuthRegister {
    name: string;
    lastName: string;
    username: string;
    password: string;
    role?: string;
}

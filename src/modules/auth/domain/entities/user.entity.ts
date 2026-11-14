export interface UserProps {
  id: string;
  email: string;
  name: string;
  lastNames: string;
  password: string;
  image?: string | null;
  emailVerified: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreateProps {
  email: string;
  name: string;
  lastNames: string;
  password: string;
}

export interface NewUserData extends UserCreateProps {
  status: string;
}

export interface UserSignInProps {
  email: string;
  password: string;
}

export class User {
  public readonly id: string;
  public email: string;
  public name: string;
  public lastNames: string;
  public password: string;
  public image?: string | null;
  public status: string;
  public readonly emailVerified: boolean;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.name = props.name;
    this.lastNames = props.lastNames;
    this.password = props.password;
    this.image = props.image;
    this.status = props.status;
    this.emailVerified = props.emailVerified;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public static create(props: UserCreateProps): NewUserData {
    const newUser: NewUserData = {
      ...props,
      status: "A",
    };
    return newUser;
  }

  public static signIn(props: UserSignInProps): UserSignInProps {
    const newUser: UserSignInProps = {
      ...props,
    };
    return newUser;
  }

  public static reconstitute(props: UserProps): User {
    return new User(props);
  }

  isActive() {
    return this.status === "A";
  }
}

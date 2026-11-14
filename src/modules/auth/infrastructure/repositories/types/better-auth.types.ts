export type BetterAuthSignUpResult = {
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string | null | undefined;
    lastNames: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };
};

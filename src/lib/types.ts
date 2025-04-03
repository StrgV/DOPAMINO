export type FailResponse = {
    error: string;
    values?: {
      forename?: string;
      name?: string;
      username?: string;
      email?: string;
      age?: number;
    };
  };
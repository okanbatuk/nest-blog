export declare type Service<T> = {
  getAll: () => Promise<T[]>;
  getById: (uuid: string) => Promise<T | null>;
  delete: (uuid: string) => Promise<number | undefined>;
};

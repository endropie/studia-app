export type RecordTyper<T> = {
  data: {
    [K in keyof T]: T[K];
  };
  record: {
    [K in keyof T]?: T[K];
  };
  resource: {
    [K in keyof T]?: T[K];
  };
};

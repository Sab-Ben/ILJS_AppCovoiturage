export interface WsEvent<T> {
  type: string;
  payload: T;
}

export interface WsEventModel {
  type: 'MESSAGE' | 'NOTIFICATION' | string;
  payload: any;
}

export type WsEvent = WsEventModel;

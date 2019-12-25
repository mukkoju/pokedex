import axios from 'axios';
import * as _ from 'lodash';

export type IAPIResponse<T> = {
  data: T
};

type IAPIErrorResponse = IAPIResponse<{
  error_type: string;
  param?: string;
}>;

type IServerResponse<T> = Promise<IAPIResponse<T>>;


interface IAPIOptions {
  hideSuccess?: boolean;
  hideError?: boolean;
}

const axiosInstance = axios.create({
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  withCredentials: true
});



export function post<ResponseDataType>(path: string, data: Object): IServerResponse<ResponseDataType> {
  const stringifiedData = JSON.stringify(data);

  return axiosInstance
    .post(path, stringifiedData)
    .then(
      (response: any) => {
        return (response.data);
      },
      (error: any) => {
        throw (error);
      },

    );
}

export function get<ResponseDataType>(path: string): IServerResponse<ResponseDataType> {
  return axiosInstance
    .get(path)
    .then(

      (response: any) => {
        return (response.data);
      },
      (error: any) => {
      },

    );
}

export function put<ResponseDataType>(path: string, data: any): IServerResponse<ResponseDataType> {
  return axiosInstance
    .put(path, JSON.stringify(data))
    .then(

      (response: any) => {
        return (response.data);
      },
      (error: any) => {
      },

    );
}

export function del<ResponseDataType>(path: string, data: any, opts?: IAPIOptions): IServerResponse<ResponseDataType> {
  // REF: https://github.com/mzabriskie/axios/issues/424#issuecomment-241481280
  return axiosInstance
    .request({
      url: path,
      method: 'delete',
      data: JSON.stringify(data)
    })
    .then(

      (response: any) => {
        return (response.data);
      },
      (error: any) => {
      },

    );
}


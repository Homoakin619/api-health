declare type ResultArray = [string,string,number?,string?,string?]
interface EndpointMethod {
    readonly value: 'GET' | 'PUT' | 'POST' | 'DELETE';
  }
  
  interface EndpointPath {
    readonly value: string;
  }
  
  type EndpointData = string | object;
  
  type Endpoint = readonly [EndpointPath, EndpointMethod, EndpointData?];
  
  type TestEndpoints = readonly Endpoint[];

declare type ProcessPayload = {
    baseUrl: string,
    endpoints: [string,string,object?][];
}

export {ResultArray,ProcessPayload}
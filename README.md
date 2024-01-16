
# Api Health Manager

This package helps to monitor api endpoints giving report of working endpoints and endpoints that are experiencing downtime. You get the privilege to specify the interval at which the health check is performed.


## Installation

You can install api-health-manager using npm package manager

```bash
  npm install api-health-manager
```
    
## Usage/Examples

```javascript
import startHealthCheck from 'api-health-manager'

const api_endpoints = {
    baseUrl: "www.example.com",
    endpoints: [
        ["/dev","GET"], ["/test","PUT"],
        ["/tester","DELETE",{id:1}],
        ["/fail","POST",{username:"johndoe"}]
    ]
}

<!-- To export the results to an external file with filename as "test.txt" -->
startHealthCheck(api_endpoints,"30s","test");

<!-- To print results to console -->
startHealthCheck(api_endpoints,"30s");
```


## Documentation


```
startHealthCheck(api_endpoints,timeInterval,export_filename);
-- api_endpoints
    {
        baseUrl: string,
        endpoints: [
            [route: string, method: string,,payload?]
        ]
    }

-- timeInterval: time interval to run api health check, the time value should be appended with any of the following "s","m" or "h" to depict the time unit.
* s represents seconds
* m represents minutes
* h represents hours
```
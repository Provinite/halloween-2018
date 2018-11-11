# Rest API
The REST API facilitates communication between `web-client` and `api`.
# Table of Contents
- [Communication](#communication)
- [Authentication](#authentication)
  - [Logging In](#logging-in)
- [Routes](#routes)
  - [/login](#routes-login)
  - [/whoami](#routes-whoami)
  - [/prizes](#routes-prizes)
    - [/prizes/{id}](#routes-prizes-id)

# <a name="communication">Communication</a>
- Request body payloads must be JSON encoded.
- API results will be JSON encoded, javascript/typescript style responses are presented here for clarity. Actual API results will be valid JSON.
- The API will issue meaningful HTTP status codes as often as possible.

# <a name="authentication">Authentication</a>
Most endpoints will require authentication at launch.

## Authorizing Requests
To authorize a request, you must send a JWT `Bearer` token provided at login time by the API. This should be sent in the `Authorization` header like so
```
Authorization: Bearer ${jwt}
```

## <a name="logging-in">Logging In</a>
Logging in can _only_ be performed using the DeviantArt OAuth system. Check out the [DeviantArt OAuth Guide](https://www.deviantart.com/developers/authentication). We use the authorization code workflow, so first, you'll need to get an authorization code by sending the client to log in via deviantart.

Once you have the `authCode`, you may trade that in for an access token by submitting a login request:
```ts
// POST: /login {
//  authCode: ${authCode}  
//} => 200 OK
{
  token: ${jwt}
}
```
# <a name="routes">API Routes</a>
Detailed information for each route and http verb are described here.

## <a name="routes-login">/login</a>
Authentication endpoint.

### POST - _authenticate_
Used to authenticate a DeviantArt authorization code. Note that logging in will also create the user if they did not already exist.

### Request Body
```ts
{
  /** The DeviantArt OAuth authcode */
  authCode: string
}
```

### Response
An object containing your JWT. The JWT will have the following claims.
- `iat` - An issuance timestamp.
- `exp` - An expiration timestamp.
- `sub` - The user's deviantart UUID.

The JWT's secret is known only to the API, so it cannot be verified by a consumer.

#### Shape
```ts
{
  token: string
}
```

#### Sample
```ts
// POST: /login {
//  authCode: ${authCode}
//} => 200 OK
{
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
## <a name="routes-whoami">/whoami</a>
Endpoint to get information about the current user. Authentication is required.

### The User Model
```ts
{
  /** DeviantArt UUID */
  deviantartUuid: string;
  /** DeviantArt Username */
  deviantartName: string;
  /** DeviantArt icon url */
  iconUrl: string;
}
```
### GET - _existentialCrisis_
Get information about the currently logged in user.

#### Response
The currently logged in user.
##### Shape
```ts
User
```

##### Sample
```ts
// GET: /whoami => 200 OK
{
  deviantartUuid: "039438ae932cb...",
  deviantartName: "provinite",
  iconUrl: "https://some.domain.com/img.jpg?query=string"
}
```

## <a name="routes-prizes">/prizes</a>
Endpoint for management of prizes in the system.

### The Prize Model
```ts
{
  /** The prize's unique id */
  id: number;
  /** The prize's name */
  name: string;
  /** The prize's description */
  description: string;
  /** The prize's initial stock */
  initialStock: number;
  /** The prize's current stock. */
  currentStock: number;
  /** The prize's weight (float). */
  weight: number;
}
```

### GET - _getAll_
Fetch a complete list of prizes.

#### Response
A list of all prizes in the database.

##### Shape
```ts
Prize[]
```

##### Sample
```ts
// GET: /prizes => 200 OK
[
  {
    id: 1,
    name: "Prize",
    description: "A prize for you",
    initialStock: 100,
    currentStock: 85,
    weight: 0.5
  }
]
```

### POST - _createOne_
Create a new prize with its current stock equal to the initial stock.

#### Request Body
```ts
{
  name: string;
  description: string;
  initialStock: number;
}
```

#### Response
The newly created Prize.

##### Shape
```ts
Prize
```

##### Sample
```ts
// POST: /prizes {
//   name: "Prize Two",
//   description: "A prize for me",
//   initialStock: 10
// } => 201 CREATED
{
  id: 2,
  name: "Prize Two",
  description: "A prize for me",
  initialStock: 10,
  currentStock: 10,
  weight: 1.0
}
```

## <a name="routes-prizes-id">/prizes/{id}</a>
Endpoint for management of a specific prize.

### GET - _getOne_
Fetch a prize by its id.

#### Response
The prize, if found.

##### Shape
```ts
Prize
```

##### Sample
```ts
// GET: /prizes/1 => 200 OK
{
  id: 1,
  name: "Prize",
  description: "A prize for you",
  initialStock: 100,
  currentStock: 85,
  weight: 0.5
}
```

### DELETE - _deleteOne_
Delete a prize by its id.
#### Response
A flag indicating success.
##### Shape
```ts
{
  ok: boolean
}
```
##### Example
```ts
// DELETE: /prizes/1 => 200 OK
{
  ok: true
}
```
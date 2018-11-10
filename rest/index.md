# Rest API
The REST API describes communication between `web-client` and `api`.
# Authentication
## Authorizing Requests
To authorize a request, you must send a JWT `Bearer` token provided at login time by the API. This should be sent in the `Authorization` header like so
```
Authorization: Bearer ${jwt}
```

## Logging In
Logging in can _only_ be performed using the DeviantArt OAuth system. Check out the [DeviantArt OAuth Guide](https://www.deviantart.com/developers/authentication). We use the authorization code workflow, so first, you'll need to get an authorization code by sending the client to log in via deviantart.

Once you have the `authCode`, you may trade that in for an access token by submitting a login request:
```ts
// POST: /login {
//  authCode: ${authCode}  
//} =>
{
  token: ${jwt}
}
```
# API Routes
## /login
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
An object containing your JWT. The JWT will have the following claims:
- `iat` - An issuance timestamp.
- `exp` - An expiration timestamp.
- `sub` - The user's deviantart UUID.

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
//} =>
{
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
## /prizes
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
}
```
### GET - _getAll_
Fetch a complete list of prizes.
### Response
#### Shape
```ts
Prize[]
```
#### Sample
```ts
// GET: /prizes =>
[
  {
    id: 1,
    name: "Prize",
    description: "A prize for you",
    initialStock: 100,
    currentStock: 85
  }
]
```
### POST - _createOne_
Create a new prize with its current stock equal to the initial stock.
### Request Body
```ts
{
  name: string;
  description: string;
  initialStock: number;
}
```

### Response
The newly created Prize.
#### Shape
```ts
Prize
```
#### Sample
```ts
// POST: /prizes {
//   name: "Prize Two",
//   description: "A prize for me",
//   initialStock: 10
// } =>
{
  id: 2,
  name: "Prize Two",
  description: "A prize for me",
  initialStock: 10,
  currentStock: 10
}
```

## /prizes/{id}
Endpoint for management of a specific prize.
### GET - _getOne_
Fetch a prize by its id.
### Response
#### Shape
```ts
Prize
```
#### Sample
```ts
// GET: /prizes/1 =>
{
  id: 1,
  name: "Prize",
  description: "A prize for you",
  initialStock: 100,
  currentStock: 85
}
```
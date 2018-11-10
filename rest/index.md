# Rest API
This documentation is broken down by route and http method.
## /prizes
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
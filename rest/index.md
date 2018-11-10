# Rest API
This documentation is broken down by route and http method.
## /prizes
### GET - _getAll_
Fetch a complete list of prizes.
### POST - _createOne_
Create a new prize.
### Request Body
```ts
{
  /** The prize's name */
  name: string;
  /** The prize's description */
  description: string;
  /** The prize's initial stock */
  initialStock: number;
  /** The prize's current stock. Defaults to initialStock */
  currentStock: number;
}
```

### Response
The newly created Prize.
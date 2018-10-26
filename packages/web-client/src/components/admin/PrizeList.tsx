import * as React from "react";
import { IPrize } from "../../models/IPrize";
interface IPrizeListProps {
  prizes: IPrize[];
}

export class PrizeList extends React.Component<IPrizeListProps, {}> {
  render() {
    const prizes = this.props.prizes.map(p => <div key={p.id}>{p.name}</div>);
    return <>{...prizes}</>;
  }
}

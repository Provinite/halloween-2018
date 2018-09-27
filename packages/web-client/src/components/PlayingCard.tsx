import * as React from "react"

export class PlayingCard extends React.Component<{
  suit: string,
  rank: string
}, {}> {
  constructor(props) {
    super(props);
  }
  render() {
    let theDiv = (
    <div className="playing-card">
      <span className="playing-card__suit">{this.props.suit}</span>
      <span className="playing-card__rank">{this.props.rank}</span>
    </div>
    );
    return theDiv;
  }
}

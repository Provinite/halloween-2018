import { Typography } from "@material-ui/core";
import * as React from "react";
import { IPrize } from "../../models/IPrize";
import { WithMuiTheme } from "../ui/mui/WithMuiTheme";
import { WithSpinner } from "../ui/WithSpinner";
import { PrizeList } from "./PrizeList";
interface IAdminPrizeTabProps {
  onDelete: (prize: IPrize) => any;
  onSave: (prize: Partial<IPrize>) => any;
  onUpdate: (prize: Partial<IPrize>) => any;
  prizes: IPrize[];
}

/**
 * Component that presents a list and edit controls for prizes.
 */
export class AdminPrizeTab extends React.Component<IAdminPrizeTabProps> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      // TODO: Move this up a level. Not really the responsibility of this
      // component to display its loader, since it isn't responsible for
      // fetching the data.
      /* Don't show the page until prizes have loaded. */
      <WithSpinner
        style={{
          margin: "40px auto",
          display: "block"
        }}
        loading={!this.props.prizes}
        color="inherit"
      >
        {/* Display the prize list */}
        <WithMuiTheme>
          {({ spacing }) => (
            <div
              style={{ paddingLeft: spacing.unit, paddingRight: spacing.unit }}
            >
              <Typography variant="h3" color="secondary">
                Prizes
              </Typography>
              <Typography
                variant="body2"
                color="inherit"
                style={{ marginTop: spacing.unit }}
              >{/* tslint:disable */}
                Manage prizes for the event here. Weights are used to determine
                the relative odds of a particular prize being chosen. For
                example, a prize with a weight of 0.5 and a stock
                of 100 will be equally likely to be given out as a
                prize with a stock of 200 and a weight of 1.0.
                {/* tslint:enable */}
              </Typography>
            </div>
          )}
        </WithMuiTheme>
        <PrizeList {...this.props} />
      </WithSpinner>
    );
  }
}

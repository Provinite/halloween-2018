import { Card, Slide } from "@material-ui/core";
import { CardProps } from "@material-ui/core/Card";
import * as React from "react";
interface IPageCardProps extends CardProps {
  /** Page content */
  children: React.ReactNode;
  /** Controls transition state. */
  open: boolean;
  /** Transition direction (in) */
  direction?: "left" | "right" | "up" | "down";
  /** Callback invoked when transition has finished. */
  onExited?: () => void;
}
/**
 * UI Component for displaying a full page card. Supports slide transitions.
 */
export function PageCard(props: IPageCardProps) {
  const { children, hidden, onExited, open, direction, ...other } = props;
  return (
    // TODO: refactor these styles into `withStyles`
    <Slide
      timeout={400}
      direction={direction || "right"}
      in={open}
      onExited={onExited}
      style={{
        display: hidden ? "none" : "block",
        maxWidth: "1000px",
        width: "100%"
      }}
    >
      <Card
        style={{
          position: "relative",
          maxWidth: "1000px",
          width: "100%",
          margin: "0 auto",
          paddingTop: "15px",
          height: "100%"
        }}
        square={true}
        className="cc-tab-container"
        {...other}
      >
        {children}
      </Card>
    </Slide>
  );
}

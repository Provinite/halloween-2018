import { Card, Slide } from "@material-ui/core";
import { CardProps } from "@material-ui/core/Card";
import * as React from "react";
interface ITabContainerProps extends CardProps {
  children: React.ReactNode;
  open: boolean;
  direction?: "left" | "right" | "up" | "down";
  onExited?: () => void;
}
export function TabContainer(props: ITabContainerProps) {
  const { children, hidden, onExited, open, direction, ...other } = props;
  return (
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

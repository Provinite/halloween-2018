import { Card } from "@material-ui/core";
import { CardProps } from "@material-ui/core/Card";
import * as React from "react";
interface ITabContainerProps extends CardProps {
  children: React.ReactNode;
  value: any;
  index: any;
}
export function TabContainer(props: ITabContainerProps) {
  const { children, value, index, ...other } = props;
  return (
    <Card
      key={index}
      square={true}
      className="cc-tab-container"
      hidden={index !== value}
      {...other}
    >
      {children}
    </Card>
  );
}

import React from "react";
import Aside from "./Aside";
import Header from "./Header";

const ParentComponent = React.memo((props) => {
  return (
    <div>
      <Header handleAsideOpen={props.appAsideOpen} />
      <Aside asideOpen={props.appOpen} handleAsideOpen={props.appAsideOpen} />
    </div>
  );
});
ParentComponent.displayName = "ParentComponent";

export default ParentComponent;

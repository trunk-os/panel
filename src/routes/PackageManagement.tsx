import React from "react";

import defaultClient from "../lib/client.ts";
import { periodicCallWithState } from "../lib/effects.ts";

export default function PackageManagement(props) {
  let [packageList, setPackageList] = React.useState([]);

  periodicCallWithState("list_packages", setPackageList, {
    defaultState: [],
  });

  console.log(packageList);

  return <div />;
}

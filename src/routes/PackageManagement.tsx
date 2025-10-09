import React from "react";
import IconButton from "@mui/material/IconButton";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";

import Table from "../components/Table.tsx";
import ConfirmDialog from "../components/ConfirmDialog.tsx";

import defaultClient from "../lib/client.ts";
import { periodicCallWithState } from "../lib/effects.ts";

export default function PackageManagement(props) {
  let [packageList, setPackageList] = React.useState([]);
  let [installPackage, setInstallPackage] = React.useState({
    open: false,
    package: {},
  });

  periodicCallWithState("list_packages", setPackageList, {
    defaultState: [],
    transform: (response) =>
      response.map((x) => ({
        name: x.title.name,
        version: x.title.version,
        installed: x.installed,
      })),
  });

  return (
    <>
      <ConfirmDialog
        open={installPackage.open}
        title={
          (installPackage.package.installed ? "Uninstall" : "Install") +
          `Package ${installPackage.package.name}, version ${installPackage.package.version}?`
        }
        onSuccess={(event) => {
          let handleResponse = (response) => {
            if (!response.ok) {
              // FIXME do something better here
              alert(
                "error: " +
                  response.error_detail.title +
                  " " +
                  response.error_detail.detail
              );
            }
          };

          if (installPackage.package.installed) {
            defaultClient()
              // FIXME checkbox for purging data in uninstall case
              .uninstall_package(
                installPackage.package.name,
                installPackage.package.version,
                true
              )
              .then(handleResponse);
          } else {
            defaultClient()
              .install_package(
                installPackage.package.name,
                installPackage.package.version
              )
              .then(handleResponse);
          }
        }}
        onComplete={() => {
          setInstallPackage({ open: false, package: {} });
        }}
      >
        {installPackage.package.installed ? "Uninstall" : "Install"}{" "}
        {`Package ${installPackage.package.name}, version ${installPackage.package.version}?`}
      </ConfirmDialog>
      <Table
        list={packageList}
        title="Packages"
        headings={["Name", "Version", "Installed?"]}
        values={["name", "version", "installed"]}
        transforms={{
          name: (x) => (
            <div style={{ marginLeft: "1em", textAlign: "left" }}>{x}</div>
          ),
          version: (x) => (
            <div style={{ marginRight: "1em", textAlign: "right" }}>{x}</div>
          ),
          installed: (x, record) =>
            x ? (
              <IconButton
                onClick={(event) => {
                  setInstallPackage({ open: true, package: record });
                  event.preventDefault();
                }}
              >
                <CheckIcon style={{ color: "green" }} />
              </IconButton>
            ) : (
              <IconButton
                onClick={(event) => {
                  setInstallPackage({ open: true, package: record });
                  event.preventDefault();
                }}
              >
                <CancelIcon style={{ color: "red" }} />
              </IconButton>
            ),
        }}
      />
    </>
  );
}

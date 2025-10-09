import React from "react";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";

import Table from "../components/Table.tsx";
import CenterForm from "../components/CenterForm.tsx";
import ConfirmDialog from "../components/ConfirmDialog.tsx";

import defaultClient from "../lib/client.ts";
import { periodicCallWithState } from "../lib/effects.ts";

const DEFAULT_QUESTION_STATE = {
  open: false,
  package: {},
  questions: [],
};
const DEFAULT_PACKAGE_STATE = {
  open: false,
  package: {},
};

export default function PackageManagement(props) {
  let [packageList, setPackageList] = React.useState([]);
  let [installPackage, setInstallPackage] = React.useState(
    DEFAULT_PACKAGE_STATE
  );
  let [installQuestions, setInstallQuestions] = React.useState(
    DEFAULT_QUESTION_STATE
  );

  periodicCallWithState("list_packages", setPackageList, {
    defaultState: [],
    transform: (response) =>
      response.map((x) => ({
        name: x.title.name,
        version: x.title.version,
        installed: x.installed,
      })),
  });

  console.log(installQuestions);

  return (
    <>
      <Modal open={installQuestions.open}>
        <CenterForm>
          <Card>
            <CardHeader
              title="Answer Questions to Install Package"
              subheader={`${installQuestions.package.name}, version ${installQuestions.package.version}`}
              action={
                <IconButton
                  onClick={() => setInstallQuestions(DEFAULT_QUESTION_STATE)}
                >
                  <CloseIcon />
                </IconButton>
              }
            />
            <CardContent></CardContent>
          </Card>
        </CenterForm>
      </Modal>
      <ConfirmDialog
        open={installPackage.open}
        title={
          (installPackage.package.installed ? "Uninstall" : "Install") +
          `Package ${installPackage.package.name}, version ${installPackage.package.version}?`
        }
        onSuccess={(event) => {
          if (installPackage.package.installed) {
            defaultClient()
              // FIXME checkbox for purging data in uninstall case
              .uninstall_package(
                installPackage.package.name,
                installPackage.package.version,
                true
              )
              .then((response) => {
                if (!response.ok) {
                  // FIXME do something better here
                  alert(
                    "error: " +
                      response.error_detail.title +
                      " " +
                      response.error_detail.detail
                  );
                }
              });
          } else {
            defaultClient()
              .get_prompts(
                installPackage.package.name,
                installPackage.package.version
              )
              .then((response) => {
                Object.assign(installQuestions, {
                  questions: response.response,
                });
                setInstallQuestions(installQuestions);
              });

            defaultClient()
              .get_responses(installPackage.package.name)
              .then((response) => {
                Object.assign(installQuestions, {
                  answers: response.response,
                });
                setInstallQuestions(installQuestions);
              });

            Object.assign(installQuestions, {
              package: installPackage.package,
            });
            setInstallQuestions(installQuestions);
            /*
            defaultClient()
              .install_package(
                installPackage.package.name,
                installPackage.package.version
              )
              .then(handleResponse);
              */
          }
        }}
        onComplete={() => {
          setInstallPackage(DEFAULT_PACKAGE_STATE);
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

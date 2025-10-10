import React from "react";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
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

const DEFAULT_INSTALL_STATUS = {
  status: null,
  error_detail: {},
};

export default function PackageManagement(props) {
  let [packageList, setPackageList] = React.useState([]);
  let [refreshList, setRefreshList] = React.useState(0);
  let [installPackage, setInstallPackage] = React.useState(
    DEFAULT_PACKAGE_STATE
  );
  let [installQuestions, setInstallQuestions] = React.useState(
    DEFAULT_QUESTION_STATE
  );
  let [installStatus, setInstallStatus] = React.useState(
    DEFAULT_INSTALL_STATUS
  );

  periodicCallWithState("list_packages", setPackageList, {
    requiredState: [refreshList],
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
            <CardContent>
              <form
                id="install-package-questions"
                autoComplete="off"
                onSubmit={(event) => {
                  event.preventDefault();
                }}
              >
                {installStatus.status !== null ? (
                  <>
                    <div className="login-item">
                      <Alert
                        severity={installStatus.status ? "success" : "error"}
                      >
                        {installStatus.status
                          ? "Package Installed Successfully."
                          : `[ERROR]: ${installStatus.error_detail.title}: ${installStatus.error_detail.detail}`}
                      </Alert>
                    </div>
                    <div style={{ height: "1em" }}></div>
                  </>
                ) : (
                  <></>
                )}
                {installQuestions.questions.map((x, i) => (
                  <>
                    <div className="login-item">
                      <InputLabel>{x.question}</InputLabel>
                      <TextField style={{ width: "100%" }} id={x.template} />
                    </div>
                    {i == installQuestions.questions.length - 1 ? (
                      <div style={{ height: "1em" }}></div>
                    ) : (
                      <></>
                    )}
                  </>
                ))}
                <div style={{ height: "2em" }}></div>
                <div className="login-item">
                  <Button
                    style={{ width: "100%" }}
                    variant="contained"
                    type="submit"
                  >
                    Install Package
                  </Button>
                </div>
              </form>
            </CardContent>
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

            setRefreshList(refreshList + 1);
          } else {
            defaultClient()
              .get_prompts(
                installPackage.package.name,
                installPackage.package.version
              )
              .then((response) => {
                if (response.ok) {
                  // NOTE: careful attention is needed to avoid opening the dialog before the
                  // questions are available. See comments in the return JSX below.
                  if (response.response.length === 0) {
                    defaultClient()
                      .install_package(
                        installQuestions.package.name,
                        installQuestions.package.version
                      )
                      .then((response) => {
                        setInstallQuestions(DEFAULT_QUESTION_STATE);
                        setRefreshList(refreshList + 1);
                      });
                  } else {
                    Object.assign(installQuestions, {
                      // we want to make sure to open here otherwise the main loop
                      // auto-install trigger will get executed.
                      // shitty side effects, I know, but not sure what to do better here.
                      open: true,
                      questions: response.response,
                    });
                    setInstallQuestions(installQuestions);
                  }
                }
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

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import moment from "moment";
import { sprintf } from "sprintf-js";
import HumanElapsed from "human-elapsed";

function toGB(m) {
  return `${sprintf("%0.02f", m / (1024 * 1024 * 1024))}GB`;
}

function toTB(m) {
  return `${sprintf("%0.02f", m / (1024 * 1024 * 1024 * 1024))}TB`;
}

const STAT_TO_NAME = {
  uptime: "System Uptime",
  available_memory: "Available System Memory",
  total_memory: "Total System Memory",
  cpus: "Physical CPUs",
  cpu_usage: "CPU Usage",
  host_name: "Machine Name",
  kernel_version: "Linux Kernel Version",
  load_average: "Load Average",
  processes: "Server Processes",
  total_disk: "Total Storage Available",
  available_disk: "Unused Storage Available",
};

const UNIT_CONVERTER = {
  uptime: HumanElapsed,
  available_memory: toGB,
  total_memory: toGB,
  cpus: (x) => x / 2,
  cpu_usage: (x) => `${Math.floor(x)}%`, // FIXME: broken, probably needs fixed in buckle
  load_average: ([one, five, fifteen]) =>
    `[ 1m: ${one}, 5m: ${five}, 15m: ${fifteen} ]`,
  total_disk: toTB,
  available_disk: toTB,
};

export default function ServerStats(props) {
  return (
    <Card>
      <CardHeader
        title="Server Health Information"
        subheader={"Time: " + moment().format("HH:MM:SS (ZZ), YYYY/MM/DD")}
      />
      <CardContent>
        {props.stats ? (
          (props.include ? props.include : Object.keys(props.stats)).map(
            (k, i) => (
              <div
                key={k}
                style={{
                  padding: "0.5em",
                  backgroundColor: i % 2 == 0 ? null : "#eee",
                }}
              >
                {STAT_TO_NAME[k] + ": "}
                {UNIT_CONVERTER[k]
                  ? UNIT_CONVERTER[k](props.stats[k])
                  : props.stats[k]}
              </div>
            )
          )
        ) : (
          <></>
        )}
      </CardContent>
    </Card>
  );
}

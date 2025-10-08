import React from "react";
import Button from "@mui/material/Button";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

function sort(a, b, key) {
  if (typeof a[key] === "string") {
    return a[key].toLowerCase() > b[key].toLowerCase()
      ? 1
      : a[key].toLowerCase() === b[key].toLowerCase()
        ? 0
        : -1;
  } else {
    return a[key] > b[key] ? 1 : a[key] === b[key] ? 0 : -1;
  }
}

export default function Table(props) {
  let list = props.list;
  let [sortInfo, setSortInfo] = React.useState({
    key: props.values[0],
    direction: "descending",
  });

  list.sort((a, b) =>
    (sortInfo.direction || "descending") === "descending"
      ? sort(a, b, sortInfo.key)
      : sort(b, a, sortInfo.key)
  );

  return (
    <>
      <div
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          height: "3em",
          width: "30%",
        }}
      >
        <h1 style={{ textAlign: "center" }}>{props.title}</h1>
        {props.page !== undefined ? (
          <>
            <div
              style={{
                minHeight: "3em",
                float: "left",
              }}
            >
              <Button
                onClick={() => {
                  let page = props.page - 1;
                  if (page < 0) {
                    page = 0;
                  }

                  if (page != props.page) {
                    props.setPage(page);
                  }
                }}
              >
                &lt;&lt;
              </Button>
            </div>
            <div style={{ minHeight: "3em", float: "right" }}>
              <Button
                onClick={() => {
                  let page = props.page + 1;
                  if (page < 0) {
                    page = 0;
                  }

                  if (page != props.page) {
                    props.setPage(page);
                  }
                }}
                disabled={props.list.length < (props.perPage || 20)}
              >
                &gt;&gt;
              </Button>
            </div>
            <div
              style={{
                minHeight: "3em",
                marginTop: "1em",
                textAlign: "center",
              }}
            >
              Page: {props.page + 1}
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
      <div style={{ height: "1em" }} />
      <table style={{ width: "100%" }}>
        <thead>
          <tr style={{ backgroundColor: "#eee" }}>
            {props.headings.map((x, i) => (
              <th
                style={{ cursor: "pointer", border: "1px solid black" }}
                key={x}
                onClick={() => {
                  if (sortInfo.key === props.values[i]) {
                    if (sortInfo.direction === "descending") {
                      setSortInfo({
                        key: sortInfo.key,
                        direction: "ascending",
                      });
                    } else {
                      setSortInfo({
                        key: sortInfo.key,
                        direction: "descending",
                      });
                    }
                  } else {
                    setSortInfo({
                      key: props.values[i],
                      direction: "descending",
                    });
                  }
                }}
              >
                {x}
                {sortInfo.key === props.values[i] ? (
                  sortInfo.direction === "descending" ? (
                    <ArrowDropDownIcon style={{ float: "right" }} />
                  ) : (
                    <ArrowDropUpIcon style={{ float: "right" }} />
                  )
                ) : (
                  <></>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.list.map((entry, i) => (
            <tr
              key={entry[props.entryKey || "id"]}
              style={{
                backgroundColor: i % 2 == 0 ? null : "#eee",
              }}
            >
              {props.values.map((x) => (
                <td style={{ textAlign: "center" }} key={x}>
                  {props.transforms[x]
                    ? props.transforms[x](entry[x], entry)
                    : entry[x]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

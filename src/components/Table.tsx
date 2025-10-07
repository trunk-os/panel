import Button from "@mui/material/Button";

export default function Table(props) {
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
      </div>
      <div style={{ height: "1em" }} />
      <table style={{ width: "100%" }}>
        <thead>
          <tr style={{ backgroundColor: "#eee" }}>
            {props.headings.map((x) => (
              <th style={{ border: "1px solid black" }} key={x}>
                {x}
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

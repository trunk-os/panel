export default function SystemDashboard() {
  let host = "localhost:3000";
  if (typeof window !== "undefined") {
    host = `${window.location.hostname}:3000`;
  }

  return (
    <iframe
      style={{
        border: "1px solid black",
        marginTop: "5vh",
        marginBottom: "5vh",
        minHeight: "80vh",
        minWidth: "100%",
      }}
      src={`http://${host}/d/trunk/trunk-overview?orgId=1&from=now-1h&to=now&timezone=browser&refresh=5s`}
    />
  );
}

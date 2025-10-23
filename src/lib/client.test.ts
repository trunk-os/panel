import { expect, test } from "vitest";
import { getClient, tryLogin, integrationTest } from "./testutil.ts";
import {
  testClient,
  ClientStorage,
  BaseClient,
  sniffRouteClient,
} from "./client.ts";

integrationTest("ensure all failing calls yield problemdetails", async () => {
  // do everything without logging in, except ping. All responses should be
  // non-ok, non-2xx success and have a problemdetails response
  let client = getClient();
  [
    "audit_log",
    "login",
    "create_user",
    "list_users",
    "unit_log",
    "list_units",
    "set_unit",
    "uninstall_package",
    "install_package",
    "get_prompts",
    "get_responses",
    "set_responses",
    "installed",
    "list_installed",
    "list_packages",
    "zfs_list",
    "zfs_create_volume",
    "zfs_create_dataset",
    "zfs_modify_volume",
    "zfs_modify_dataset",
    "zfs_destroy",
    "remove_user",
    "reactivate_user",
    "get_user",
    "update_user",
  ].forEach(async (method) => {
    let response = await client[method]();
    expect(!!response).toBe(true);
    expect(response.ok).toBe(false);
    expect(!!response.error_detail).toBe(true);
  });
});

integrationTest(
  "charon manipulation endpoints, with and without login",
  async () => {
    let client = getClient();

    [
      "list_packages",
      "list_installed",
      "installed",
      "set_responses",
      "get_responses",
      "get_prompts",
      "install_package",
      "uninstall_package",
    ].forEach(async (method) => {
      let response = await client[method]();
      expect(!!response).toBe(true);
      expect(response.ok).toBe(false);
    });

    expect(await tryLogin(client)).toBe(true);

    let response = await client.list_packages();
    expect(response.ok).toBe(true);
    expect(response.response.length > 0).toBe(true);

    let found = false;

    for (let i = 0; i < response.response.length; i++) {
      const item = response.response[i];
      if (item.title.name == "example_package") {
        found = true;
        expect(item.title.version).toBe("0.0.1");
      }
    }

    expect(found).toBe(true);

    response = await client.installed("example_package", "0.0.1");
    expect(response.ok).toBe(true);
    expect(response.response).toBe(false);

    response = await client.get_prompts("example_package", "0.0.1");
    expect(response.ok).toBe(true);
    expect(response.response).toStrictEqual([]);

    response = await client.get_prompts("coturn-stun", "1.0.0");
    expect(response.ok).toBe(true);
    expect(response.response).toStrictEqual([
      {
        input_type: "string",
        question: "What hostname should the STUN server use?",
        template: "stun_hostname",
      },
    ]);

    response = await client.set_responses("coturn-stun", [
      {
        template: "stun_hostname",
        input: { string: "testtest" },
      },
    ]);
    expect(response.ok).toBe(true);

    response = await client.get_responses("coturn-stun");
    expect(response.ok).toBe(true);
    expect(response.response).toStrictEqual([
      {
        input: { string: "testtest" },
        template: "stun_hostname",
      },
    ]);

    await client.uninstall_package("coturn-stun", "1.0.0", true);

    response = await client.list_installed();
    expect(response.ok).toBe(true);
    expect(response.response).toStrictEqual([]);

    response = await client.install_package("coturn-stun", "1.0.0");
    expect(response.ok).toBe(true);

    response = await client.installed("example_package", "0.0.1");
    expect(response.ok).toBe(true);
    expect(response.response).toBe(false);

    // wrong version
    response = await client.installed("coturn-stun", "0.0.1");
    expect(response.ok).toBe(false);

    response = await client.installed("coturn-stun", "1.0.0");
    expect(response.ok).toBe(true);
    expect(response.response).toBe(true);

    // list installed in here
    response = await client.list_installed();
    expect(response.ok).toBe(true);
    expect(response.response).toStrictEqual([
      { name: "coturn-stun", version: "1.0.0" },
    ]);

    response = await client.uninstall_package("coturn-stun", "1.0.0", true);
    expect(response.ok).toBe(true);

    response = await client.list_installed();
    expect(response.ok).toBe(true);
    expect(response.response).toStrictEqual([]);
  }
);

integrationTest(
  "zfs manipulation endpoints, with and without login",
  async () => {
    let client = getClient();
    let response = await client.zfs_list();
    expect(response.ok).toBe(false);
    expect(await tryLogin(client)).toBe(true);

    response = await client.zfs_list();
    expect(response.ok).toBe(true);

    // could fail if we've already run this test
    await client.zfs_destroy("test-volume");
    await client.zfs_destroy("not-test-volume");
    await client.zfs_destroy("test-dataset");

    // get a measurement of how many items are there already
    response = await client.zfs_list();
    expect(response.ok).toBe(true);

    let existing = response.response.length;

    response = await client.zfs_create_volume("test-volume", 100 * 1024 * 1024);
    expect(response.ok).toBe(true);

    response = await client.zfs_create_volume(
      "not-test-volume",
      100 * 1024 * 1024
    );
    expect(response.ok).toBe(true);

    response = await client.zfs_list("test-volume"); // filter should work
    expect(response.ok).toBe(true);
    expect(response.response.length).toBe(1);
    expect(response.response[0].kind).toBe("Volume");
    expect(response.response[0].name).toBe("test-volume");
    expect(response.response[0].size).toBe(100 * 1024 * 1024);

    response = await client.zfs_modify_volume(
      "test-volume",
      "test-volume",
      150 * 1024 * 1024
    );
    expect(response.ok).toBe(true);

    response = await client.zfs_list("test-volume"); // filter should work
    expect(response.ok).toBe(true);
    expect(response.response.length).toBe(1);
    expect(response.response[0].kind).toBe("Volume");
    expect(response.response[0].name).toBe("test-volume");
    expect(response.response[0].size).toBe(150 * 1024 * 1024);

    response = await client.zfs_list("not-test-volume"); // filter should work
    expect(response.ok).toBe(true);
    expect(response.response.length).toBe(1);
    expect(response.response[0].kind).toBe("Volume");
    expect(response.response[0].name).toBe("not-test-volume");
    expect(response.response[0].size).toBe(100 * 1024 * 1024);

    response = await client.zfs_destroy("test-volume");
    expect(response.ok).toBe(true);

    response = await client.zfs_list();
    expect(response.ok).toBe(true);
    expect(response.response.length).toBe(1 + existing);

    response = await client.zfs_destroy("not-test-volume");
    expect(response.ok).toBe(true);

    response = await client.zfs_create_dataset(
      "test-dataset",
      100 * 1024 * 1024
    );
    expect(response.ok).toBe(true);

    response = await client.zfs_list("test-dataset"); // filter should work
    expect(response.ok).toBe(true);
    expect(response.response.length).toBe(1);
    expect(response.response[0].kind).toBe("Dataset");
    expect(response.response[0].name).toBe("test-dataset");
    expect(response.response[0].size).toBe(100 * 1024 * 1024);

    response = await client.zfs_modify_dataset(
      "test-dataset",
      "test-dataset",
      150 * 1024 * 1024
    );
    expect(response.ok).toBe(true);

    response = await client.zfs_list("test-dataset"); // filter should work
    expect(response.ok).toBe(true);
    expect(response.response.length).toBe(1);
    expect(response.response[0].kind).toBe("Dataset");
    expect(response.response[0].name).toBe("test-dataset");
    expect(response.response[0].size).toBe(150 * 1024 * 1024);

    response = await client.zfs_destroy("test-dataset");
    expect(response.ok).toBe(true);

    response = await client.zfs_list(); // filter should work
    expect(response.ok).toBe(true);
    expect(response.response.length).toBe(existing);
  }
);

integrationTest(
  "systemd manipulation endpoints, with and without login",
  async () => {
    const SERVICE_NAME = "multi-user.target";

    let client = getClient();
    let response = await client.list_units();
    expect(response.ok).toBe(false);
    expect(await tryLogin(client)).toBe(true);

    response = await client.list_units();
    expect(response.ok).toBe(true);
    expect(response.response.length > 2).toBe(true);

    response = await client.list_units(SERVICE_NAME);
    expect(response.ok).toBe(true);
    expect(response.response.length).toBe(1);
    expect(response.response[0].name).toBe(SERVICE_NAME);
    expect(response.response[0].enabled_state).toBe("Enabled");

    response = await client.unit_log(SERVICE_NAME, 10);
    expect(response.ok).toBe(true);
    expect(response.response.length > 0).toBe(true);
    expect(response.response.length < 11).toBe(true);

    // FIXME: need a good test for set_unit
  }
);

integrationTest(
  "user manipulation endpoints, with and without login",
  async () => {
    // create the first user if we need to, and discard it so we're not logged in
    // and the first user create isn't triggered for these tests

    let client = getClient();
    expect(await tryLogin(client)).toBe(true);
    let response = await client.me();
    expect(response.ok).toBe(true);
    let me = response.response;

    client = getClient();
    response = await client.create_user({
      username: "not-erikh",
      password: "testtesttest",
    });
    expect(response.ok).toBe(false);

    response = await client.update_user(me.id, {
      realname: "test",
    });
    expect(response.ok).toBe(false);

    response = await client.get_user(me.id);
    expect(response.ok).toBe(false);

    response = await client.list_users();
    expect(response.ok).toBe(false);

    response = await client.remove_user(me.id);
    expect(response.ok).toBe(false);

    response = await client.reactivate_user(me.id);
    expect(response.ok).toBe(false);

    await tryLogin(client);

    response = await client.update_user(me.id, {
      realname: "test",
    });
    expect(response.ok).toBe(true);

    response = await client.list_users();
    expect(response.ok).toBe(true);

    // if this account already exists, we need to find it, remove it, modify it
    // to be undeleted, and delete it again. Otherwise, it doesn't exist yet,
    // so create it an delete it.
    let otherId = null;
    let deleted = false;

    for (let i = 0; i < response.response.length; i++) {
      if (response.response[i].username == "not-erikh") {
        otherId = response.response[i].id;
        deleted = response.response[i].deleted_at;
      }
    }

    if (otherId) {
      if (!deleted) {
        response = await client.remove_user(otherId);
        expect(response.ok).toBe(true);
      }

      response = await client.reactivate_user(otherId);
      expect(response.ok).toBe(true);

      response = await client.remove_user(otherId);
      expect(response.ok).toBe(true);
    } else {
      response = await client.create_user({
        username: "not-erikh",
        password: "testtesttest2",
      });
      expect(response.ok).toBe(true);
      expect(response.response.id > 0).toBe(true);

      response = await client.remove_user(response.response.id);
      expect(response.ok).toBe(true);

      response = await client.reactivate_user(response.response.id);
      expect(response.ok).toBe(true);

      response = await client.remove_user(response.response.id);
      expect(response.ok).toBe(true);
    }

    response = await client.get_user(me.id);
    expect(response.ok).toBe(true);
    expect(response.response.username).toBe("erikh");
    expect(response.response.realname).toBe("test");
    response = await client.update_user(me.id, {
      realname: "something else",
    });
    expect(response.ok).toBe(true);

    response = await client.get_user(me.id);
    expect(response.ok).toBe(true);
    expect(response.response.username).toBe("erikh");
    expect(response.response.realname).toBe("something else");
  }
);

integrationTest("audit_log endpoint, with and without login", async () => {
  const client = getClient();
  let response = await client.audit_log();
  expect(!response.ok).toBe(true);

  expect(await tryLogin(client)).toBe(true);

  // last record should be our login
  response = await client.audit_log();
  expect(response.ok).toBe(true);
  expect(response.response !== undefined).toBe(true);
  expect(response.response.length > 1).toBe(true);
  expect(response.response[0].endpoint).toBe("/session/login");
});

integrationTest("me endpoint, with and without login", async () => {
  const client = getClient();
  let response = await client.me();
  expect(response.ok).toBe(true);
  expect(response.response).toBe(null);

  expect(await tryLogin(client)).toBe(true);

  response = await client.me();
  expect(response.ok).toBe(true);
  expect(response.response !== undefined).toBe(true);
  expect(response.response.username).toBe("erikh");
  expect(response.response.id !== 0).toBe(true);
});

integrationTest("ping endpoint, with and without login", async () => {
  const client = getClient();
  let response = await client.ping();
  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
  expect(response.response).toStrictEqual({});

  expect(await tryLogin(client)).toBe(true);

  expect(client.authorization !== undefined).toStrictEqual(true);

  response = await client.ping();
  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);

  let payload = response.response;

  expect(payload.health !== undefined).toStrictEqual(true);
  expect(payload.health.buckle !== undefined).toStrictEqual(true);
  expect(payload.health.buckle.latency !== undefined).toStrictEqual(true);
  expect(payload.health.charon !== undefined).toStrictEqual(true);
  expect(payload.health.charon.latency !== undefined).toStrictEqual(true);
  expect(payload.info !== undefined).toStrictEqual(true);

  [
    "uptime",
    "available_memory",
    "total_memory",
    "cpus",
    "cpu_usage",
    "host_name",
    "kernel_version",
    "load_average",
    "processes",
    "total_disk",
    "available_disk",
  ].forEach((item) => {
    expect(payload.info[item] !== undefined).toStrictEqual(true);
  });

  client.logout();

  response = await client.ping();
  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
  expect(response.response).toStrictEqual({});
});

test("Mock: login flow", async () => {
  let client = new testClient();
  client.next_response = { token: "testing" };

  expect(await client.login("erikh", "frobnik")).toStrictEqual({
    headers: {},
    response: { token: "testing" },
    ok: true,
    status: 200,
  });

  expect(client.authorization).toBe("testing");

  expect(await client.me()).toStrictEqual({
    headers: { authorization: "testing" },
    ok: true,
    status: 200,
  });

  // test automatic logout
  client.next_status = 400;

  expect(await client.me()).toStrictEqual({
    headers: { authorization: "testing" },
    ok: false,
    status: 400,
  });

  expect(client.authorization).toBe(undefined);

  // manual logout
  client.next_status = 200;
  client.next_response = { token: "testing" };

  expect(await client.login("erikh", "frobnik")).toStrictEqual({
    headers: {},
    response: { token: "testing" },
    ok: true,
    status: 200,
  });

  expect(client.authorization).toBe("testing");

  client.logout();

  // NOTE: ok and status here are forged; we're looking for the missing header here.
  expect(await client.me()).toStrictEqual({
    headers: {},
    ok: true,
    status: 200,
  });
});

test("Mock: authorization storage methods work", () => {
  const auth = new ClientStorage();
  expect(auth.authorization).toBe(undefined);
  auth.store_authorization("testing");
  expect(auth.authorization).toBe("testing");
  auth.localStorage["authorization"] = "testing2";
  expect(auth.authorization).toBe("testing");
  auth.load_authorization();
  expect(auth.authorization).toBe("testing2");
  auth.store_authorization("testing3");
  expect(auth.authorization).toBe("testing3");
  auth.clear_authorization();
  expect(auth.authorization).toBe(undefined);
  auth.load_authorization();
  expect(auth.authorization).toBe(undefined);
});

test("Mock: client methods properly template client paths", async () => {
  // ensure all client methods are yielding the right paths
  const table = {
    ping: ["/status/ping"],
    audit_log: ["/status/log"],
    login: ["/session/login"],
    me: ["/session/me"],
    create_user: ["/users"],
    list_users: ["/users"],
    remove_user: ["/user/1", { id: 1 }],
    reactivate_user: ["/user/1", { id: 1 }],
    get_user: ["/user/1", { id: 1 }],
    update_user: ["/user/1", { id: 1 }],
    unit_log: ["/systemd/log"],
    list_units: ["/systemd/list"],
    set_unit: ["/systemd/set_unit"],
    uninstall_package: ["/packages/uninstall"],
    install_package: ["/packages/install"],
    get_prompts: ["/packages/prompts"],
    get_responses: ["/packages/get_responses"],
    set_responses: ["/packages/set_responses"],
    installed: ["/packages/installed"],
    list_installed: ["/packages/list_installed"],
    list_packages: ["/packages/list"],
    zfs_list: ["/zfs/list"],
    zfs_create_volume: ["/zfs/create_volume"],
    zfs_create_dataset: ["/zfs/create_dataset"],
    zfs_modify_volume: ["/zfs/modify_volume"],
    zfs_modify_dataset: ["/zfs/modify_dataset"],
    zfs_destroy: ["/zfs/destroy"],
  };

  for (const [route, entry] of Object.entries(table)) {
    const sniffClient = new sniffRouteClient();

    if (entry[1]) {
      await sniffClient[route](entry[1].id);
    } else {
      await sniffClient[route]();
    }

    expect(sniffClient.last_route).toBe(entry[0]);
  }
});

test("Mock: getPathForRoute properly templates paths", () => {
  const table = [
    {
      input: [
        { path: "/test/{id}/{id2}", params: ["id", "id2"] },
        { id: "one", id2: "two" },
      ],
      output: "/test/one/two",
    },
    {
      input: [
        { path: "/test/{id2}/{id}", params: ["id", "id2"] },
        { id: "one", id2: "two" },
      ],
      output: "/test/two/one",
    },
    {
      input: [
        { path: "/{id2}/{id}/test", params: ["id", "id2"] },
        { id: "one", id2: "two" },
      ],
      output: "/two/one/test",
    },
    {
      input: [
        { path: "/test/{id}", params: ["id", "id2"] },
        { id: "one", id2: "two" },
      ],
      output: "/test/one",
    },
    {
      input: [
        { path: "/test/{id2}", params: ["id", "id2"] },
        { id: "one", id2: "two" },
      ],
      output: "/test/two",
    },
  ];

  table.forEach(({ input, output }) => {
    expect(new BaseClient().getPathForRoute(input[0], input[1])).toBe(output);
  });
});

test("Mock: getPathForRoute properly prepends base_url", () => {
  const table = [
    {
      input: [
        { path: "/test/{id}/{id2}", params: ["id", "id2"] },
        { id: "one", id2: "two" },
      ],
      output: "http://localhost/test/one/two",
    },
    {
      input: [
        { path: "/test/{id2}/{id}", params: ["id", "id2"] },
        { id: "one", id2: "two" },
      ],
      output: "http://localhost/test/two/one",
    },
    {
      input: [
        { path: "/{id2}/{id}/test", params: ["id", "id2"] },
        { id: "one", id2: "two" },
      ],
      output: "http://localhost/two/one/test",
    },
    {
      input: [
        { path: "/test/{id}", params: ["id", "id2"] },
        { id: "one", id2: "two" },
      ],
      output: "http://localhost/test/one",
    },
    {
      input: [
        { path: "/test/{id2}", params: ["id", "id2"] },
        { id: "one", id2: "two" },
      ],
      output: "http://localhost/test/two",
    },
  ];

  table.forEach(({ input, output }) => {
    let client = new BaseClient();
    client.base_url = "http://localhost";
    expect(client.getPathForRoute(input[0], input[1])).toBe(output);
  });
});

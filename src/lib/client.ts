import { encode, decode } from "cbor2";

/*
 * Client to gild, Trunk's UI-centric API service. Gild uses CBOR for all
 * requests and responses; in error situations, it yields a JSON problem
 * details document. The client deserializes these responses transparently,
 * placing valid responses in the 'response' entry and the error details in the
 * 'error_detail' entry.
 *
 * rough diagram of hierarchy:
 *
 * ClientAuthorizer > ClientMethods > BaseClient > Client
 *
 * testClient and sniffRouteClient are variants on Client that are used for
 * testing
 *
 * defaultClient function pulls from process.env and should be used for all "real" stuff.
 *
 */

export default function defaultClient(url) {
  if (!url && typeof process !== "undefined") {
    url = process.env.CLIENT_URL;
  }

  if (!url && typeof window !== "undefined") {
    const u = new URL(window.location);
    url = `${u.protocol}//${u.hostname}:5309`;
  }

  return new Client(url || "http://localhost:5309");
}

const STORAGE_KEY_AUTHORIZATION = "authorization";

const REQUEST_DEFAULTS = {
  credentials: "include",
  cache: "no-store",
  mode: "cors",
};

const ROUTES = {
  ping: { path: "/status/ping", method: "get" },
  audit_log: { path: "/status/log", method: "post" },
  login: { path: "/session/login", method: "post" },
  me: { path: "/session/me", method: "get" },
  create_user: { path: "/users", method: "put" },
  list_users: { path: "/users", method: "post" },
  reactivate_user: { path: "/user/{id}", params: ["id"], method: "patch" },
  remove_user: { path: "/user/{id}", params: ["id"], method: "delete" },
  get_user: { path: "/user/{id}", params: ["id"], method: "get" },
  update_user: { path: "/user/{id}", params: ["id"], method: "post" },
  unit_log: { path: "/systemd/log", method: "post" },
  list_units: { path: "/systemd/list", method: "post" },
  set_unit: { path: "/systemd/set_unit", method: "post" },
  uninstall_package: { path: "/packages/uninstall", method: "post" },
  install_package: { path: "/packages/install", method: "post" },
  get_prompts: { path: "/packages/prompts", method: "post" },
  get_responses: { path: "/packages/get_responses", method: "post" },
  set_responses: { path: "/packages/set_responses", method: "post" },
  installed: { path: "/packages/installed", method: "post" },
  list_installed: { path: "/packages/list_installed", method: "get" },
  list_packages: { path: "/packages/list", method: "get" },
  zfs_list: { path: "/zfs/list", method: "post" },
  zfs_create_volume: { path: "/zfs/create_volume", method: "post" },
  zfs_create_dataset: { path: "/zfs/create_dataset", method: "post" },
  zfs_modify_volume: { path: "/zfs/modify_volume", method: "post" },
  zfs_modify_dataset: { path: "/zfs/modify_dataset", method: "post" },
  zfs_destroy: { path: "/zfs/destroy", method: "post" },
};

// mock of Window.localStorage interface
class fakeStorage {
  getItem(key) {
    return this[key];
  }

  removeItem(key) {
    delete this[key];
  }

  setItem(key, value) {
    this[key] = value;
  }
}

// handle storage in browser or locally (for tests)
export class ClientStorage {
  authorization = undefined;
  localStorage =
    typeof window !== "undefined" ? window.localStorage : new fakeStorage();

  constructor() {
    this.load_authorization();
  }

  load_authorization() {
    this.authorization = this.localStorage.getItem(STORAGE_KEY_AUTHORIZATION);
  }

  store_authorization(token) {
    this.authorization = token;
    this.localStorage.setItem(STORAGE_KEY_AUTHORIZATION, this.authorization);
  }

  clear_authorization() {
    this.authorization = undefined;
    this.localStorage.removeItem(STORAGE_KEY_AUTHORIZATION);
  }
}

// action methods; carried out by cbor and test clients by way of performRoute method
class ClientMethods extends ClientStorage {
  async ping() {
    return await this.performRoute("ping");
  }

  async audit_log(pagination) {
    return await this.performRoute("audit_log", pagination || {});
  }

  logout() {
    this.clear_authorization();
  }

  async login(username, password) {
    const response = await this.performRoute("login", {
      username,
      password,
    });

    if (response.ok && response.response && response.response.token) {
      this.store_authorization(response.response.token);
    }

    return response;
  }

  async me() {
    const response = await this.performRoute("me");

    // if this call fails, log the user out
    if (!response.ok) {
      this.logout();
    }

    return response;
  }

  async create_user(user) {
    return await this.performRoute("create_user", user || {});
  }

  async list_users(pagination) {
    return await this.performRoute("list_users", pagination || {});
  }

  async remove_user(id) {
    return await this.performRoute("remove_user", null, { id });
  }

  async reactivate_user(id) {
    return await this.performRoute("reactivate_user", null, { id });
  }

  async get_user(id) {
    return await this.performRoute("get_user", null, { id });
  }

  async update_user(id, user) {
    user = Object.assign(user || {}, { username: "" });
    return await this.performRoute("update_user", user, { id });
  }

  async unit_log(name, count) {
    return await this.performRoute("unit_log", {
      name,
      count,
      cursor: null,
      direction: null,
    });
  }

  async list_units(filter) {
    return await this.performRoute("list_units", filter);
  }

  async set_unit(name, enabled_state, runtime_state) {
    return await this.performRoute("set_unit", {
      name,
      enabled_state,
      runtime_state,
    });
  }

  async uninstall_package(name, version, purge) {
    return await this.performRoute("uninstall_package", {
      name,
      version,
      purge,
    });
  }

  async install_package(name, version) {
    return await this.performRoute("install_package", { name, version });
  }

  async get_prompts(name, version) {
    return await this.performRoute("get_prompts", { name, version });
  }

  async get_responses(name) {
    return await this.performRoute("get_responses", { name, version: "" });
  }

  async set_responses(name, responses) {
    return await this.performRoute("set_responses", { name, responses });
  }

  async installed(name, version) {
    return await this.performRoute("installed", { name, version });
  }

  async list_installed() {
    return await this.performRoute("list_installed");
  }

  async list_packages() {
    return await this.performRoute("list_packages");
  }

  async zfs_list(filter) {
    return await this.performRoute("zfs_list", filter);
  }

  async zfs_create_volume(name, size) {
    return await this.performRoute("zfs_create_volume", { name, size });
  }

  async zfs_modify_volume(orig_name, new_name, size) {
    return await this.performRoute("zfs_modify_volume", {
      name: orig_name,
      modifications: { name: new_name, size },
    });
  }

  async zfs_create_dataset(name, quota) {
    return await this.performRoute("zfs_create_dataset", { name, quota });
  }

  async zfs_modify_dataset(orig_name, new_name, quota) {
    return await this.performRoute("zfs_modify_dataset", {
      name: orig_name,
      modifications: { name: new_name, quota },
    });
  }

  async zfs_destroy(name) {
    return await this.performRoute("zfs_destroy", name);
  }
}

// route management; see ROUTES table at the top.
export class BaseClient extends ClientMethods {
  base_url = undefined;

  getPathForRoute(route, params) {
    let path = route.path;

    if (params) {
      for (let i = 0; i < route.params.length; i++) {
        path = path.replace(`{${route.params[i]}}`, params[route.params[i]]);
      }
    }

    if (this.base_url) {
      path = this.base_url + path;
    }

    return path;
  }

  getRoute(route, params) {
    return this.getPathForRoute(ROUTES[route], params);
  }
}

// CBOR client; automatically inserts login information if provided, does full
// CBOR dance. Unrolling errors is still your job.
export class Client extends BaseClient {
  constructor(base_url) {
    super();
    this.base_url = base_url;
  }

  async performRoute(route, input, params) {
    if (!ROUTES[route]) {
      return;
    }
    const method = ROUTES[route].method;
    let headers =
      method === "get" ? {} : { "content-type": "application/cbor" };

    if (typeof window !== "undefined") {
      const url = new URL(window.location);
      headers["origin"] = `${url.protocol}//${url.hostname}:${url.port}`;
    }

    if (this.authorization) {
      headers["authorization"] = `Bearer ${this.authorization}`;
    }

    const request = Object.assign(
      {
        body: method === "get" ? undefined : encode(input),
        headers: headers,
        method: method.toUpperCase(),
      },
      REQUEST_DEFAULTS
    );

    const response = await fetch(this.getRoute(route, params), request);

    let ret = {
      ok: response.ok,
      status: response.status,
      headers: response.headers,
    };

    if (response.headers.get("content-length") > 0) {
      let buffer = new Uint8Array(response.headers.get("content-length"));

      let i = 0;

      for await (const chunk of response.body) {
        for (let x = 0; x < chunk.length; x++) {
          buffer[i] = chunk[x];
          i++;
        }
      }

      if (response.headers.get("content-type") === "application/cbor") {
        ret.response = decode(buffer);
      } else if (
        response.headers.get("content-type") === "application/problem+json"
      ) {
        ret.error_detail = JSON.parse(new TextDecoder().decode(buffer));
      } else {
        // FIXME: these responses should not exist
        const detail = new TextDecoder().decode(buffer);
        const endpoint = this.getRoute(route, params);

        console.log(`Bad error response for endpoint ${endpoint}: ${detail}`);
        throw "welp, you've done it now";
      }
    }

    return ret;
  }
}

// client that populates last route examined; for tests
export class sniffRouteClient extends BaseClient {
  last_route = undefined;

  async performRoute(route, input, params) {
    this.last_route = this.getRoute(route, params);
    return {};
  }
}

// client that yields pre-programmed response data; for tests
export class testClient extends BaseClient {
  next_response = undefined;
  next_error_detail = undefined;
  next_status = 200;
  next_headers = {};

  async performRoute(route, input, params) {
    if (!ROUTES[route]) {
      return;
    }

    let ret = {
      ok: this.next_status === 200,
      status: this.next_status,
      headers: this.authorization
        ? Object.assign(
            { authorization: this.authorization },
            this.next_headers
          )
        : this.next_headers,
    };

    if (this.next_response) {
      ret.response = this.next_response;
      this.next_response = undefined;
    }

    if (this.next_error_detail) {
      ret.error_detail = this.next_error_detail;
      this.next_error_detail = undefined;
    }

    return ret;
  }
}

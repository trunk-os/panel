import { expect, test } from "vitest";
import defaultClient from "./client.ts";
import { Client } from "./client.ts";

const INTEGRATION_CLIENT_URL = "http://localhost:5309";

export function getClient() {
  return defaultClient(INTEGRATION_CLIENT_URL);
}

export async function tryLogin(client) {
  let response = await client.login("erikh", "testtesttest");

  if (!response.ok) {
    response = await client.create_user({
      username: "erikh",
      password: "testtesttest",
    });
    console.log(response);
    expect(response.ok).toBe(true);
  }

  response = await client.login("erikh", "testtesttest");
  return response.ok;
}

export function testIf(condition, ...args) {
  return condition ? test(...args) : test.skip(...args);
}

export function integrationTest(...args) {
  args[0] = `[INTEGRATION TEST]: ${args[0]}`;
  testIf(typeof process !== "undefined" && process.env && process.env.TEST_INTEGRATION, ...args);
}

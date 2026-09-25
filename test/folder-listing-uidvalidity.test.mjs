import test from "node:test";
import assert from "node:assert/strict";
import { SimpleIMAPService } from "../dist/services/simple-imap-service.js";

test("get_folders returns each mailbox's IMAP UIDVALIDITY", async () => {
  const service = new SimpleIMAPService({
    imap: { host: "127.0.0.1", port: 1143, secure: false, username: "fixture", password: "fixture" },
    runtime: {},
  });
  const listCalls = [];
  service.client = {
    usable: true,
    async list(options) {
      listCalls.push(options);
      return [
        ["INBOX", 1000000001n],
        ["Labels/Work", 2000000002n],
      ].map(([path, uidValidity]) => ({
        path,
        name: path.split("/").at(-1),
        delimiter: "/",
        flags: new Set(),
        listed: true,
        subscribed: true,
        status: { messages: 1, unseen: 0, uidNext: 2, uidValidity },
      }));
    },
  };

  const folders = await service.getFolders();

  assert.deepEqual(listCalls[0].statusQuery, {
    messages: true,
    unseen: true,
    uidNext: true,
    uidValidity: true,
  });
  assert.deepEqual(
    folders.map(({ path, uidValidity }) => [path, uidValidity]),
    [["INBOX", "1000000001"], ["Labels/Work", "2000000002"]],
  );
});

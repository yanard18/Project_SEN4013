const test = require("tape");
const app = require("../lib/todo-app.js");

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

test("UNIT: ADD increments id correctly (data provided, no DOM)", (t) => {
  const model = clone(app.model);

  const m1 = app.update("ADD", model, "first");
  const m2 = app.update("ADD", m1, "second");

  t.equal(m1.todos[0].id, 1, "first id is 1");
  t.equal(m2.todos[1].id, 2, "second id is 2");
  t.equal(m2.todos.length, 2, "two todos exist");
  t.end();
});

test("UNIT: DELETE removes only the matching id", (t) => {
  const model = {
    todos: [
      { id: 1, title: "a", done: false },
      { id: 2, title: "b", done: false },
      { id: 3, title: "c", done: false },
    ],
    hash: "#/",
  };

  const updated = app.update("DELETE", model, 2);

  t.equal(updated.todos.length, 2, "one item removed");
  t.deepEqual(updated.todos.map((x) => x.id), [1, 3], "only id=2 removed");
  t.end();
});

test("UNIT: TOGGLE flips done and sets all_done correctly", (t) => {
  const model = {
    todos: [
      { id: 1, title: "a", done: false },
      { id: 2, title: "b", done: true },
    ],
    hash: "#/",
  };

  const toggled = app.update("TOGGLE", model, 1);
  t.equal(toggled.todos[0].done, true, "id=1 toggled to done=true");
  t.equal(toggled.all_done, true, "all_done becomes true (all done)");

  const toggledBack = app.update("TOGGLE", toggled, 2);
  t.equal(toggledBack.todos[1].done, false, "id=2 toggled back to false");
  t.equal(toggledBack.all_done, false, "all_done becomes false (not all done)");
  t.end();
});

test("UNIT: TOGGLE_ALL sets every item to same done state", (t) => {
  const model = {
    todos: [
      { id: 1, title: "a", done: false },
      { id: 2, title: "b", done: true },
    ],
    hash: "#/",
    all_done: false,
  };

  const allDone = app.update("TOGGLE_ALL", model);
  t.ok(allDone.todos.every((x) => x.done === true), "all todos set to done=true");
  t.equal(allDone.all_done, true, "all_done true");

  const allNotDone = app.update("TOGGLE_ALL", allDone);
  t.ok(allNotDone.todos.every((x) => x.done === false), "all todos set to done=false");
  t.equal(allNotDone.all_done, false, "all_done false");
  t.end();
});

test("UNIT: CLEAR_COMPLETED removes done=true items", (t) => {
  const model = {
    todos: [
      { id: 1, title: "a", done: false },
      { id: 2, title: "b", done: true },
      { id: 3, title: "c", done: true },
    ],
    hash: "#/",
  };

  const cleared = app.update("CLEAR_COMPLETED", model);
  t.deepEqual(cleared.todos.map((x) => x.id), [1], "only active items remain");
  t.end();
});

test("UNIT: EDIT double-click within 300ms enters editing mode (Date.now stub)", (t) => {
  const model = {
    todos: [{ id: 1, title: "a", done: false }],
    hash: "#/",
  };

  const realNow = Date.now;
  try {
    Date.now = () => 1000;
    const afterFirstClick = app.update("EDIT", model, 1);
    t.equal(afterFirstClick.editing, false, "first click does not edit");

    Date.now = () => 1100; // within 300ms
    const afterSecondClick = app.update("EDIT", afterFirstClick, 1);
    t.equal(afterSecondClick.editing, 1, "second click within 300ms enables editing");
  } finally {
    Date.now = realNow;
  }

  t.end();
});

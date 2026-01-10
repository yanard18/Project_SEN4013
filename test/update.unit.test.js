const test = require("tape");
const app = require("../lib/todo-app.js");

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

test("testAddIncrementsId", (t) => {
  const model = clone(app.model);

  const m1 = app.update("ADD", model, "first");
  const m2 = app.update("ADD", m1, "second");

  t.equal(m1.todos[0].id, 1);
  t.equal(m2.todos[1].id, 2);
  t.equal(m2.todos.length, 2);
  t.end();
});

test("testDeleteRemovesMatchingId", (t) => {
  const model = {
    todos: [
      { id: 1, title: "a", done: false },
      { id: 2, title: "b", done: false },
      { id: 3, title: "c", done: false },
    ],
    hash: "#/",
  };

  const result = app.update("DELETE", model, 2);

  t.equal(result.todos.length, 2);
  t.deepEqual(result.todos.map((x) => x.id), [1, 3]);
  t.end();
});

test("testToggleFlipsDoneAndUpdatesAllDone", (t) => {
  const model = {
    todos: [
      { id: 1, title: "a", done: false },
      { id: 2, title: "b", done: true },
    ],
    hash: "#/",
    all_done: false,
  };

  const toggled = app.update("TOGGLE", model, 1);
  t.equal(toggled.todos[0].done, true);
  t.equal(toggled.all_done, true);

  const toggledBack = app.update("TOGGLE", toggled, 2);
  t.equal(toggledBack.todos[1].done, false);
  t.equal(toggledBack.all_done, false);
  t.end();
});

test("testToggleAllSetsSameDoneState", (t) => {
  const model = {
    todos: [
      { id: 1, title: "a", done: false },
      { id: 2, title: "b", done: true },
    ],
    hash: "#/",
    all_done: false,
  };

  const allDone = app.update("TOGGLE_ALL", model);
  t.ok(allDone.todos.every((x) => x.done === true));
  t.equal(allDone.all_done, true);

  const allNotDone = app.update("TOGGLE_ALL", allDone);
  t.ok(allNotDone.todos.every((x) => x.done === false));
  t.equal(allNotDone.all_done, false);
  t.end();
});

test("testClearCompletedRemovesDoneTodos", (t) => {
  const model = {
    todos: [
      { id: 1, title: "a", done: false },
      { id: 2, title: "b", done: true },
      { id: 3, title: "c", done: true },
    ],
    hash: "#/",
  };

  const result = app.update("CLEAR_COMPLETED", model);
  t.deepEqual(result.todos.map((x) => x.id), [1]);
  t.end();
});

test("testDoubleClickStartsEditMode", (t) => {
  const model = {
    todos: [{ id: 1, title: "a", done: false, lastClick: 1000 }],
    hash: "#/",
  };

  // Bu test object-action kullanır. update() fonksiyonun
  // {type:"EDIT", id, now} formatını desteklemelidir.
  const action = { type: "EDIT", id: 1, now: 1100 };
  const result = app.update(action, model);

  t.equal(result.editing, 1);
  t.end();
});

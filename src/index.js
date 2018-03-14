import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers } from 'redux';

const VISIBILITY_ACTION_TYPE = "SET VISIBILITY FILTER";

// Reducers

const todoReducer = (state, action) => {
  switch (action.type) {
    case "ADD TODO":
      return {
        id: action.id, text: action.text, completed: false
      };
    case "TOGGLE TODO":
      if (action.id === state.id){
        return {...state, completed: !state.completed};
      } else {
        return state;
      }
    default:
      return state;
  }
};

const todosReducer = (state=[], action) => {
  switch (action.type) {
    case "ADD TODO":
      return [...state, todoReducer(undefined, action)];
    case "TOGGLE TODO":
      return state.map(t => todoReducer(t, action));
    default:
      return state;
  }
};

const visibilityReducer = (state="SHOW ALL", action) => {
  switch (action.type) {
    case VISIBILITY_ACTION_TYPE:
      return action.filter;
    default:
      return state;
  }
};

const appRedux = combineReducers({todosReducer, visibilityReducer});

const store = createStore(appRedux);
let currentId = 0;

// Presentation components

const Todo = ({todo, onClick}) => {
  console.log("Todo");
  console.log(todo);
  return (
    <li
      onClick={onClick}
      style={{textDecoration: todo.completed ? 'line-through': 'none'}}
    >
      {todo.text}
    </li>
  );
}

const TodoList = ({visibleTodos, onTodoClick}) => {
  console.log("TodoList");
  console.log(visibleTodos);
  return (
    <ul>
      {
        visibleTodos.map(
          todo =>
          <Todo
            todo={todo}
            onClick={() => onTodoClick(todo.id)}/>
        )
      }
    </ul>
  );
}

const FilterLink = ({filter, currentFilter, children}) => {
  if (filter === currentFilter){
    return <span>{children}</span>
  }
  return (
    <a
      href='#'
      onClick={
        e => {
          e.preventDefault();
          store.dispatch({type: VISIBILITY_ACTION_TYPE, filter});
        }
      }>
      {children}
    </a>
  )
};

// Utility functions

const getVisibileTodos = (todos, filter) => {
  switch (filter) {
    case "SHOW ALL":
      return todos
    case "SHOW OPEN":
      return todos.filter(t => !t.completed)
    case "SHOW DONE":
      return todos.filter(t => t.completed)
    default:
      return todos
  }
}

// React

class App extends React.Component {
  render() {
    currentId++;
    const {todos, visibilityFilter} = this.props
    const visibleTodos = getVisibileTodos(todos, visibilityFilter);
    return (
      <div>
        <input ref={node => {this.input = node}}/>
        <button onClick={
          () => {
            store.dispatch({
              id: currentId, type: "ADD TODO", text: this.input.value
            });
            this.input.value = '';
          }
        }>
          Add To Do
        </button>
        <TodoList
          visibleTodos={visibleTodos}
          onTodoClick={(id) => store.dispatch({id, type: "TOGGLE TODO"})}/>
        <p>
          Show:{" "}
          <FilterLink
            filter="SHOW ALL"
            currentFilter={visibilityFilter}>
            All
          </FilterLink> {" "}
          <FilterLink
            filter="SHOW OPEN"
            currentFilter={visibilityFilter}>
            Open
          </FilterLink>{" "}
          <FilterLink
            filter="SHOW DONE"
            currentFilter={visibilityFilter}>
            Done
          </FilterLink>
        </p>
      </div>
    )
  }
}

const render = () => {
    ReactDOM.render(
      <App
        todos={store.getState().todosReducer}
        visibilityFilter={store.getState().visibilityReducer}/>,
      document.getElementById('root')
    );
}

store.subscribe(render);
render();
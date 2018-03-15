import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';
import { Router, Route, browserHistory, Link, withRouter } from 'react-router';

const ADD_TODO_TYPE = "ADD TODO";
const TOGGLE_TODO_TYPE = "TOGGLE TODO";
const FILTER_ALL = "all";
const FILTER_OPEN = "open";
const FILTER_DONE = "done";

let currentId = 0;

// Utility functions

const getVisibileTodos = (state, filter) => {
  const todos = getAllTodos(state);
  switch (filter) {
    case FILTER_ALL:
      return todos
    case FILTER_OPEN:
      return todos.filter(t => !t.completed)
    case FILTER_DONE:
      return todos.filter(t => t.completed)
    default:
      return todos
  }
}

// Action creators

const addTodo = (id, text) => {
  return {id, type: ADD_TODO_TYPE, text};
};

const toggleTodo = (id) => {
  return {id, type: TOGGLE_TODO_TYPE};
};

// Reducers

const todo = (state, action) => {
  switch (action.type) {
    case ADD_TODO_TYPE:
      return {
        id: action.id, text: action.text, completed: false
      };
    case TOGGLE_TODO_TYPE:
      if (action.id === state.id){
        return {...state, completed: !state.completed};
      } else {
        return state;
      }
    default:
      return state;
  }
};

const byId = (state={}, action) => {
  switch (action.type) {
    case ADD_TODO_TYPE:
    case TOGGLE_TODO_TYPE:
      return {...state, [action.id]: todo(state[action.id], action)};
    default:
      return state;
  }
};

const allIds = (state=[], action) => {
  switch (action.type) {
    case ADD_TODO_TYPE:
      return [...state, action.id];
    default:
      return state;
  }
}

const appRedux = combineReducers({byId, allIds});

const getAllTodos = (state) =>
  state.allIds.map(id => state.byId[id]);

// Presentation components

const AddTodoComponent = ({ dispatch }) => {
  let input;
  return (
    <div>
      <input ref={node => {input = node}}/>
      <button
        onClick={
          () => {
            dispatch(addTodo(currentId, input.value));
            input.value = '';
          }
        }>
        Add To Do
      </button>
    </div>
  );
};

const Todo = ({todo, onClick}) => {
  return (
    <li
      onClick={onClick}
      style={{textDecoration: todo.completed ? 'line-through': 'none'}}>
      {todo.text}
    </li>
  );
};

const TodoList = ({todos, onTodoClick}) => {
  currentId++;
  return (
    <ul>
      {
        todos.map(
          todo =>
          <Todo
            key={todo.id}
            todo={todo}
            onClick={() => onTodoClick(todo.id)}/>
        )
      }
    </ul>
  );
};

const FilterLink = ({ filter, children }) => (
  <Link
    to={filter}
    activeStyle={{textDecoration: 'none', color: 'black'}}>
    {children}
  </Link>
);

const Footer = ({store}) => (
  <p>
    Show:{" "}
    <FilterLink
      filter={FILTER_ALL}>
      All
    </FilterLink> {" "}
    <FilterLink
      filter={FILTER_OPEN}>
      Open
    </FilterLink>{" "}
    <FilterLink
      filter={FILTER_DONE}>
      Done
    </FilterLink>
  </p>
);

// Containers

const AddTodo = connect()(AddTodoComponent)

const mapStateTodoToProps = (state, { params }) => {
  return {todos: getVisibileTodos(state, params.filter)};
};

// Map onTodoClick prop that will be passed to TodoList component to the
// toggleTodo action creator that will be dispatch(toggleTodo(...)) because the
// parameters are the same
const VisibileTodoList = withRouter(connect(
  mapStateTodoToProps, {onTodoClick: toggleTodo}
)(TodoList));

// React

const App = ({ params }) => {
  return (
    <div>
      <AddTodo />
      <VisibileTodoList />
      <Footer />
    </div>
  );
};

ReactDOM.render(
  // Second arg of createStore is a persistedState
  <Provider store={createStore(appRedux)}>
    <Router history={browserHistory}>
      <Route path="/(:filter)" component={App} />
    </Router>
  </Provider>,
  document.getElementById('root')
);

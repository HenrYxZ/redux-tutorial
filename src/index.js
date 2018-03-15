import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers } from 'redux';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import { Router, Route, browserHistory, Link} from 'react-router';

const VISIBILITY_ACTION_TYPE = "SET VISIBILITY FILTER";
const ADD_TODO_TYPE = "ADD TODO";
const TOGGLE_TODO_TYPE = "TOGGLE TODO";
const FILTER_ALL = "all";
const FILTER_OPEN = "open";
const FILTER_DONE = "done";

let currentId = 0;

// Utility functions

const getVisibileTodos = (todos, filter) => {
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

const todos = (state=[], action) => {
  switch (action.type) {
    case ADD_TODO_TYPE:
      return [...state, todo(undefined, action)];
    case TOGGLE_TODO_TYPE:
      return state.map(t => todo(t, action));
    default:
      return state;
  }
};

const appRedux = combineReducers({todos});

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

const mapStateTodoToProps = (state, props) => {
  return {todos: getVisibileTodos(state.todos, props.filter)};
};

const mapDispatchTodoToProps = (dispatch) => {
  return {
    onTodoClick: (id) => dispatch(toggleTodo(id))
  };
}

const VisibileTodoList = connect(
  mapStateTodoToProps, mapDispatchTodoToProps
)(TodoList);

// React

const App = ({ params }) => {
  return (
    <div>
      <AddTodo />
      <VisibileTodoList filter={params.filter || FILTER_ALL}/>
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

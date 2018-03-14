import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers } from 'redux';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';

const VISIBILITY_ACTION_TYPE = "SET VISIBILITY FILTER";
const ADD_TODO_TYPE = "ADD TODO";
const TOGGLE_TODO_TYPE = "TOGGLE TODO";
const FILTER_ALL = "SHOW ALL";
const FILTER_OPEN = "SHOW OPEN";
const FILTER_DONE = "SHOW DONE";

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

const setVisibilityFilter = (filter) => {
  return {type: VISIBILITY_ACTION_TYPE, filter};
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

const visibilityFilter = (state=FILTER_ALL, action) => {
  switch (action.type) {
    case VISIBILITY_ACTION_TYPE:
      return action.filter;
    default:
      return state;
  }
};

const appRedux = combineReducers({todos, visibilityFilter});

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
      style={{textDecoration: todo.completed ? 'line-through': 'none'}}
    >
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

const Link = ({active, onClick, children}) => {
  if (active)
    return <span>{children}</span>
  return (
    <a
      href="#"
      onClick={
        (e) => {
          e.preventDefault();
          onClick();
        }
      }>
      {children}
    </a>
  )
};

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

const mapStateTodoToProps = (state) => {
  return {todos: getVisibileTodos(state.todos, state.visibilityFilter)};
};

const mapDispatchTodoToProps = (dispatch) => {
  return {
    onTodoClick: (id) => dispatch(toggleTodo(id))
  };
}

const VisibileTodoList = connect(
  mapStateTodoToProps, mapDispatchTodoToProps
)(TodoList);

// The second arg is the props for the container
const mapStateFilterToProps = (state, props) => {
  return {active: state.visibilityFilter === props.filter};
}

const mapDispatchFilterToProps = (dispatch, props) => {
  return {onClick: () => dispatch(setVisibilityFilter(props.filter))};
}

const FilterLink = connect(
  mapStateFilterToProps, mapDispatchFilterToProps
)(Link);

// React

const App = () => {
  return (
    <div>
      <AddTodo />
      <VisibileTodoList />
      <Footer />
    </div>
  );
};

ReactDOM.render(
  <Provider store={createStore(appRedux)}>
    <App />
  </Provider>,
  document.getElementById('root')
);

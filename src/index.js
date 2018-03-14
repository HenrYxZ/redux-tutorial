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

const AddTodo = (props, { store }) => {
  let input;
  return (
    <div>
      <input ref={node => {input = node}}/>
      <button
        onClick={
          () => {
            store.dispatch({
              id: currentId, type: ADD_TODO_TYPE, text: input.value
            });
            input.value = '';
          }
        }>
        Add To Do
      </button>
    </div>
  );
};
AddTodo.contextTypes = {store: PropTypes.object};

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

const mapStateToProps = (state) => {
  return {todos: getVisibileTodos(state.todos, state.visibilityFilter)};
};

const mapDispatchToProps = (dispatch) => {
  return {
    onTodoClick: (id) => dispatch({id, type: TOGGLE_TODO_TYPE})
  }
}

const VisibileTodoList = connect(
  mapStateToProps, mapDispatchToProps
)(TodoList);

class FilterLink extends React.Component {
  // The next two methods handle subscription for changes in the store
  componentDidMount() {
    const { store } = this.context;
    this.unsubscribe = store.subscribe(() => this.forceUpdate());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const { store } = this.context;
    const state = store.getState();
    const filter = this.props.filter;
    return (
      <Link
        active={state.visibilityFilter === filter}
        onClick={
          () => store.dispatch({type: VISIBILITY_ACTION_TYPE, filter})
        }>
        {this.props.children}
      </Link>
    );
  }
};
FilterLink.contextTypes = {store: PropTypes.object};

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

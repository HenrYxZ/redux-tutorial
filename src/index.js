import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers } from 'redux';

const VISIBILITY_ACTION_TYPE = "SET VISIBILITY FILTER";
const ADD_TODO_TYPE = "ADD TODO";
const TOGGLE_TODO_TYPE = "TOGGLE TODO";
const FILTER_ALL = "SHOW ALL";
const FILTER_OPEN = "SHOW OPEN";
const FILTER_DONE = "SHOW DONE";

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

const store = createStore(appRedux);
let currentId = 0;

// Presentation components

const AddTodo = ({addTodo}) => {
  let input;
  return (
    <div>
      <input ref={node => {input = node}}/>
      <button
        onClick={
          () => {
            addTodo(input.value);
            input.value = '';
          }
        }>
        Add To Do
      </button>
    </div>
  );
}

const Todo = ({todo, onClick}) => {
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
  return (
    <ul>
      {
        visibleTodos.map(
          todo =>
          <Todo
            key={todo.id}
            todo={todo}
            onClick={() => onTodoClick(todo.id)}/>
        )
      }
    </ul>
  );
}

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

class FilterLink extends React.Component {
  // The next two methods handle subscription for changes in the store
  componentDidMount() {
    this.unsubscribe = store.subscribe(() => this.forceUpdate());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
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
    )
  }
}

const Footer = () => (
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

// React

const App = ({todos, visibilityFilter}) => {
  currentId++;
  return (
    <div>
      <AddTodo
        addTodo={
          (text) =>
          store.dispatch({id: currentId, type: ADD_TODO_TYPE, text})
        }/>
      <TodoList
        visibleTodos={getVisibileTodos(todos, visibilityFilter)}
        onTodoClick={(id) => store.dispatch({id, type: TOGGLE_TODO_TYPE})}/>
      <Footer />
    </div>
  );
}

const render = () => {
    ReactDOM.render(
      <App {...store.getState()}/>,
      document.getElementById('root')
    );
}

store.subscribe(render);
render();

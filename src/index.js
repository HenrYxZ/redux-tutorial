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
let currentId = 0;

// Presentation components

const AddTodo = ({store}) => {
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
  currentId++;
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

const Footer = ({store}) => (
  <p>
    Show:{" "}
    <FilterLink
      filter={FILTER_ALL}
      store={store}>
      All
    </FilterLink> {" "}
    <FilterLink
      filter={FILTER_OPEN}
      store={store}>
      Open
    </FilterLink>{" "}
    <FilterLink
      filter={FILTER_DONE}
      store={store}>
      Done
    </FilterLink>
  </p>
);

// Containers

class VisibileTodoList extends React.Component {
  componentDidMount() {
    const { store } = this.props
    this.unsubscribe = store.subscribe(() => this.forceUpdate());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const { store } = this.props
    let todos = store.getState().todos;
    let visibilityFilter = store.getState().visibilityFilter;
    return <TodoList
      visibleTodos={getVisibileTodos(todos, visibilityFilter)}
      onTodoClick={(id) => store.dispatch({id, type: TOGGLE_TODO_TYPE})}/>
  }
}

class FilterLink extends React.Component {
  // The next two methods handle subscription for changes in the store
  componentDidMount() {
    const { store } = this.props
    this.unsubscribe = store.subscribe(() => this.forceUpdate());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const { store } = this.props
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

const App = ({ store }) => {
  return (
    <div>
      <AddTodo store={store}/>
      <VisibileTodoList store={store}/>
      <Footer store={store}/>
    </div>
  );
}

ReactDOM.render(
  <App store={createStore(appRedux)}/>,
  document.getElementById('root')
);

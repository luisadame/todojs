"use strict";

// DOM elements
const todo_input 		= document.getElementById('to-do');
const todos_wrapper 	= document.getElementById('todos');
// Buttons
const add_todo_btn 		= document.getElementById('add-todo');
const delete_todo_btn 	= document.querySelectorAll('.delete');

// TODOS container
let todos_container = localStorage.todos !== undefined ? JSON.parse(localStorage.todos) : [];

// create the todo module
const todos = (() => {

// Methods
	// Check if an input is empty
	const isEmpty = (input) => {
		return input !== "" ? false : true;
	};

	// Clear input
	const clearInput = (input) => {
		input.value = "";
	};

	// Get a todo id
	const getTodoId = e => parseInt(e.target.parentElement.dataset.id);

	// Return index from todo id
	const search = id => todos_container.indexOf(todos_container.find(todo => todo.id === id));

	// Add todo
	const add = () => {
		let input = todo_input.value;

		if (!isEmpty(input)) {
			
			let todo = {
				content: input,
				id: todos_container.length
			};
			todos_container.push(todo);

			clearInput(todo_input);
			render();
			syncStorage();
		}
	};

	// Update todo
	const update = (e) => {
		todos_container[search(getTodoId(e))].content = e.target.textContent;
		e.target.contentEditable = false;
		syncStorage();
	};

	// Delete todo
	const remove = (e) => {
		todos_container.splice(search(getTodoId(e)), 1);
		render();
		syncStorage();
	};

	const render = () => {
		let toBeAdded = '';
		todos_container.forEach(todo => {
			let todoHTML = `
				<div class="todo card" data-id="${todo.id}">
					<div class="todo-content">${todo.content}</div><button class="delete">X</button>
				</div>
			`;
			toBeAdded += todoHTML;
		});
		todos_wrapper.innerHTML = toBeAdded;
	};

	const syncStorage = () => {
		localStorage.setItem('todos', JSON.stringify(todos_container));
	};

	return {
		add: add,
		remove: remove,
		update: update,
		init: render,
		search: search
	};
})();

todos.init();

// Hook up the listeners
add_todo_btn.addEventListener('click', todos.add);

document.body.addEventListener('keyup', e => {
	if(e.keyCode === 13){
		todos.add();
	}
});

document.body.addEventListener('click', event => {
	if(event.target.classList.contains('delete')){
		todos.remove(event);
	}	
});

document.body.addEventListener('dblclick', event => {
	if(event.target.classList.contains('todo-content')){
		event.target.contentEditable = true;
		document.querySelectorAll('.todo-content[contenteditable=true]')
			.forEach( todo => todo.addEventListener('blur', todos.update));
	}
});
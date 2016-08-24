// Variables
var add_todo = document.getElementById('add-todo');
var todo_input = document.getElementById('to-do');
var todos_container = document.getElementById('todos');
var delete_todo;
var todos = [];

// Functions
function isEmpty(data){
	if (data === '' || data === null || data === undefined) {
		return true;
	}
	return false;
}

function htmlEntities(str){
	return String(str)
		.replace(/&/g, '&apm;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function makeURLS(str){
	return str.replace(/(http\:\/\/)?[A-Za-z0-9]+\.(com|es|info\co.nz)/g, '<a href="$&">$&</a>');
}

function scrollBot(){
	bot = todos_container.scrollHeight;
	todos_container.scrollTop = bot;
}

function refreshLocalStorage(){
	localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos(){
	todos_container.innerHTML = '';
	todos.forEach(function(todo, key){
		todoElem = document.createElement('div');
		todoElem.className = 'todo card';
		todoElem.setAttribute('data-id', key);
		todoElem.innerHTML = '<div class="todo-content">'+todo.text+'</div><button class="delete">X</button>';
		todos_container.appendChild(todoElem);
	});
}


function addDeletes(){
	deletes = document.getElementsByClassName('delete');
	Array.from(deletes).forEach(function(btn){
		btn.addEventListener('click', function(){
			this.parentElement.classList.add('beingRemoved');
			id = this.parentElement.dataset.id;
			todos.splice(id, 1);
			refreshLocalStorage();
			setTimeout(populateView, 500);
		}, false);
	});
}

function addEdits(){
	todos_contents = document.getElementsByClassName('todo-content');
	Array.from(todos_contents).forEach(function(todo_content){
		todo_content.addEventListener('dblclick', todoMakeEditable, false);
		todo_content.addEventListener('focusout', todoSaveChanges, false);
	});
}

function populateView(){
	if (todos.length > 0) {
		renderTodos();
		addDeletes();
		addEdits();
		setOffsetPadding();
	}else if (localStorage.getItem('todos') !== null && localStorage.getItem('todos') !== '[]'){
		todos = JSON.parse(localStorage.getItem('todos'));
		renderTodos();
		addDeletes();
		addEdits();
		setOffsetPadding();
	}else{
		todos_container.innerHTML = '<p id="freetime">There is nothing to do!<br>Enjoy your free time :)</p>';
	}
}

function cleanInput(){
	todo_input.value = '';
}

function appendTodo(todo, key){

	if (document.getElementById('freetime')) {
		document.getElementById('freetime').remove();
	}
	todoElem = document.createElement('div');
	todoElem.className = 'todo card new-todo';
	todoElem.setAttribute('data-id', key);
	todoElem.innerHTML = '<div class="todo-content">'+todo.text+'</div><button class="delete">X</button>';
	todos_container.appendChild(todoElem);

	refreshLocalStorage();

	scrollBot();

	// Delete the new-todo class, it causes a conflict with the other animations
	setTimeout(function(){
		todoElem.classList.remove('new-todo');
	},1000);
}

function addTodo(){
	this.blur();
	if (!isEmpty(todo_input.value)) {
		todo = {};
		todo['text'] = makeURLS(htmlEntities(todo_input.value));
		todos.push(todo);
		appendTodo(todo, todos.length - 1);
		cleanInput();
		addDeletes();
		addEdits();
		setOffsetPadding();
	}
}

function scrolledTodos(){
	header = document.getElementById('header');
	if (this.scrollTop > 0) {
		header.className = 'header-scrolled';
	}else{
		header.className = '';
	}
}

function setOffsetPadding(){
	if (todos_container.scrollHeight > 535) {
		todos_container.classList.add('offsetPadding');
	}else{
		todos_container.classList.remove('offsetPadding');
	}
}

function todoMakeEditable(){
	this.contentEditable = "true";
}

function todoSaveChanges(){
	if (this.isContentEditable) {
		id = this.parentElement.dataset.id;
		todos[id].text = this.innerText;
		refreshLocalStorage();
		this.contentEditable = "false";
	}
}

populateView();
setOffsetPadding();

// Listeners
add_todo.addEventListener('click', addTodo, false);

todos_container.addEventListener('scroll', scrolledTodos, false);

todo_input.addEventListener('keyup', function(e){
	if (e.keyCode === 13) {
		addTodo();
	}
}, false);


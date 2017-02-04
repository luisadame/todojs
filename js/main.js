"use strict";

//|=================================|//
//   IF YOU ARE READING THIS I HOPE  //
// 	  YOU ARE HAVING A NICE DAY :)   //
//   PLEASE LET ME KNOW IF YOU USE   //
// THIS DOCUMENT FOR WHATEVER REASON //
//        mrluissan@gmail.com        //
//|=================================|//

// DOM elements
const todo_input = document.getElementById('to-do');
const todos_wrapper = document.getElementById('todos');
const todos_header = document.getElementById('header');
// Buttons
const add_todo_btn = document.getElementById('add-todo');
const delete_todo_btn = document.querySelectorAll('.delete');

// TODOS container
// Retrieve the stored (localStorage) content or initialize an empty array
let todos_container = localStorage.todos !== undefined ? JSON.parse(localStorage.todos) : [];

// Let's create a beautiful and encapsulated module :)
const todos = (() => {

    //|==========|//
    // Properties //
    //|==========|//

    const addAnimDuration = 165;
    const rmAnimDuration = 400;

    //|=======|//
    // Methods //
    //|=======|//

    // Checks if an input is empty (maybe this fn is not necessary?)
    const isEmpty = (input) => input !== "" ? false : true;

    // Clear the todo input
    const clearInput = (input) => input.value = "";

    // Get the id of a todo
    const getTodoId = e => parseInt(e.target.parentElement.dataset.id);

    // Return the index of a todo from the id of a todo
    const search = id => todos_container.indexOf(todos_container.find(todo => todo.id === id));

    // Syncronize the living stored todos with the offline storage
    const syncStorage = () => localStorage.setItem('todos', JSON.stringify(todos_container));

    // Escape html tags
    const sanitize = (string) => {
        return String(string)
            .replace(/&/g, '&apm;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    };

    // Look for potential urls in the todo
    const makeUrls = (string) => {
        const pattern = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/;
        return string.replace(pattern, '<a target="_blank" href="$&">$&</a>');
    };

    // Make todos old, because we don't want to end the animation party
    const makeOld = () => {
        todos_container.forEach(todo => {
            todo.new = false;
        });
        syncStorage();
    };

    // Scroll to the end of the todos todos_wrapper
    const scrollBot = () => {
        todos_wrapper.scrollTop = todos_wrapper.scrollHeight;
    };

    // Add todo
    const add = () => {
        const input = makeUrls(sanitize(todo_input.value));

        if (!isEmpty(input)) {

            const todo = {
                content: input,
                id: todos_container.length,
                // By being new the render method will aplly an animation to this new-brand todo
                new: true
            };
            todos_container.push(todo);

            clearInput(todo_input);
            syncStorage();
            render()
                .then(makeOld)
                .then(scrollBot);
        }
    };

    // Updates a todo
    const update = (e) => {
        todos_container[search(getTodoId(e))].content = e.target.textContent;
        e.target.contentEditable = false;
        syncStorage();
    };

    // Delete todo
    const remove = (e) => {
        return new Promise((resolve, reject) => {
                todos_container.splice(search(getTodoId(e)), 1);
                e.target.parentElement.classList.add('beingRemoved');
                setTimeout(resolve, rmAnimDuration);
            })
            .then(render)
            .then(syncStorage);
    };

    const render = () => {
        return new Promise((resolve, reject) => {
            let toBeAdded = '';

            todos_container.forEach(todo => {
                let todoHTML = `
					<div class="todo card ${todo.new ? 'new-todo' : ''}" data-id="${todo.id}">
						<div class="todo-content">${todo.content}</div><button class="delete">X</button>
					</div>
				`;
                toBeAdded += todoHTML;
            });

            todos_wrapper.innerHTML = toBeAdded.length > 0 ? toBeAdded : `<p id="freetime">There is nothing to do!<br>Enjoy your free time :)</p>`;

            setTimeout(() => {
                if (document.querySelector('.new-todo') !== null) {
                    document.querySelector('.new-todo').classList.remove('new-todo');
                    makeOld();
                }
            }, addAnimDuration);

            resolve();
        });
    };

    return {
        add: add,
        remove: remove,
        update: update,
        init: render,
        search: search
    };
})();

// Initialize the application
todos.init();

//|=====================|//
// Hook up the listeners //
//|=====================|//

// Add todo by clicking the + button
add_todo_btn.addEventListener('click', todos.add);

// Add todo by pressing Enter
todo_input.addEventListener('keyup', e => {
    if (e.keyCode === 13) {
        todos.add();
    }
});

// Delete a todo by clicking on a dynamically created delete button
todos_wrapper.addEventListener('click', event => {
    if (event.target.classList.contains('delete')) {
        todos.remove(event);
    }
});

// Updates a todo by double clicking inside a todo-card
todos_wrapper.addEventListener('dblclick', event => {
    if (event.target.classList.contains('todo-content')) {
        event.target.contentEditable = true;
        // Run the update method by focusing out of the editable todo
        document.querySelectorAll('.todo-content[contenteditable=true]')
            .forEach(todo => todo.addEventListener('blur', todos.update));
    }
});

// Add a shadow to the header if scrolled
todos_wrapper.addEventListener('scroll', () => {
    if (todos_wrapper.scrollTop > 16) {
        todos_header.classList.add('header-scrolled');
    } else {
        todos_header.classList.remove('header-scrolled');
    }
});

(() => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/todojs/service_worker.js');
    }
})();
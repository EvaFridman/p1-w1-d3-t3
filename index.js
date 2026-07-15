const app = document.querySelector('#app');
const allBtn = document.querySelector('[data-run="all"]');
const allSettledBtn = document.querySelector('[data-run="allSettled"]');
const raceBtn = document.querySelector('[data-run="race"]');
const anyBtn = document.querySelector('[data-run="any"]');
const out = document.querySelector('#out');

class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
    }
}

allBtn.addEventListener("click", () => {
    const start = performance.now();

    const fetchJson = (url) => fetch(url).then(res => {
        if (!res.ok) {
            throw new HttpError(res.status, res.statusText);
        }
        return res.json();
    });

    Promise.all([
        fetchJson("https://jsonplaceholder.typicode.com/users"),
        fetchJson("https://jsonplaceholder.typicode.com/posts"),
        // fetchJson("https://jsonplaceholder.typicode.com/posts/99999"), // Падает ошибка, все запросы отклоняются
        fetchJson("https://jsonplaceholder.typicode.com/todos"),
    ])
        .then(([users, posts, todos]) => {
            console.log(`Пользователей: ${users.length}, постов: "${posts.length}", списков дел: ${todos.length}`)
            const end = performance.now();
            out.textContent = `Время выполнения: ${end - start} мс.`// Время выполнения: 55.799999952316284 мс.
        })
        .catch((err) => {
            if (err instanceof HttpError) {
                throw Error `Ошибка ${err.status}: ${err.message}`;
            } else {
                throw Error `Проблема с сетью: ${err.message}`;
            }
        })
});

// allBtn.addEventListener("click", () => {
//     const start = performance.now();
//     fetch("https://jsonplaceholder.typicode.com/users")
//         .then((response) => response.json())
//         .then((users) => {
//             return fetch(`https://jsonplaceholder.typicode.com/posts`)
//                 .then((response) => response.json())
//                 .then((posts) => ({ users, posts }));
//         })
//         .then(({ users, posts }) => {
//             return fetch(`https://jsonplaceholder.typicode.com/todos`)
//                 .then((response) => response.json())
//                 .then((todos) => ({ users, posts, todos }));
//         })
//         .then(({ users, posts, todos }) => {
//             console.log(`Пользователей: ${users.length}, постов: "${posts.length}", списков дел: ${todos.length}`)
//             const end = performance.now();
//             out.textContent = `Время выполнения: ${end - start} мс.` // Время выполнения: 142.19999998807907 мс.
//         })
//         .catch((err) => {
//             if (err instanceof HttpError) {
//                 throw Error `Ошибка ${err.status}: ${err.message}`;
//             } else {
//                 throw Error `Проблема с сетью: ${err.message}`;
//             }
//         })
// });

allSettledBtn.addEventListener("click", () => {
    
    const fetchJson = (url) => fetch(url)
        .then(res => {
            if (!res.ok) throw new HttpError(res.status, res.statusText);
            return res.json();
        })
        .then(data => ({ url, data })) 
        .catch(err => { 
            err.url = url; 
            throw err;
        });

    Promise.allSettled([
        fetchJson("https://jsonplaceholder.typicode.com/users"),
        fetchJson("https://jsonplaceholder.typicode.com/posts/99999"),
        fetchJson("https://jsonplaceholder.typicode.com/todos"),
    ])
        .then((results) => {
            out.textContent = results.map(result => {
                if (result.status === "fulfilled") {
                    const { url, data } = result.value;
                    return `[УСПЕХ] ${url} -> Элементов: ${data.length}`;
                } else {
                    const err = result.reason;
                    const errMsg = err instanceof HttpError ? `Ошибка HTTP ${err.status}` : err.message;
                    return `[ОШИБКА] ${err.url} -> ${errMsg}`;
                }
            }).join('\n');
        });
});

// index.js

document.addEventListener('DOMContentLoaded', async () => {
    const postForm = document.getElementById('postForm');
    const postsContainer = document.getElementById('postsContainer');

    // Fetch and display existing posts
    const response = await fetch('/api/posts');
    const posts = await response.json();
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>By: ${post.author}</p>
            <p>${post.content}</p>
            <p>Created at: ${new Date(post.created_at).toLocaleString()}</p>

            <hr>
        `;
        postsContainer.appendChild(postElement);
    });

    // Handle form submission to create new posts
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(postForm);
        const title = formData.get('title');
        const content = formData.get('content');

        // Assuming you have the username stored in a variable called 'username'
        const username = 'username'; // Replace 'username' with the actual username

        const response = await fetch('/api/posts', {
            method: 'POST',
            body: JSON.stringify({ title, content, author: username }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            const newPost = await response.json();
            const postElement = document.createElement('div');
            postElement.innerHTML = `
                <h3>${newPost.title}</h3>
                <p>By: ${newPost.author}</p>
                <p>${newPost.content}</p>
                <hr>
            `;
            postsContainer.prepend(postElement); // Add the new post to the beginning of the list
            postForm.reset(); // Reset the form
        } else {
            alert('Failed to create post');
        }
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/posts');
        if (response.ok) {
            const posts = await response.json();
            const postsContainer = document.getElementById('postsContainer');
            posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.classList.add('post', 'mb-3');
                postElement.innerHTML = `
                    <h2>${post.title}</h2>
                    <p>${post.content}</p>
                    <p>Author: ${post.author}</p>
                    <button class="btn btn-danger" onclick="deletePost(${post.id})">Delete</button>
                    <button class="btn btn-primary" onclick="editPost(${post.id})">Edit</button>
                `;
                postsContainer.appendChild(postElement);
            });
        } else {
            console.error('Failed to fetch posts');
        }
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
});

async function deletePost(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
        if (response.ok) {
            alert('Post deleted successfully');
            window.location.reload(); // Refresh the page to reflect the changes
        } else {
            console.error('Failed to delete post');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
    }
}

function editPost(postId) {
    // Redirect or open a new page to edit the post
    window.location.href = `/edit-post.html?postId=${postId}`;
}
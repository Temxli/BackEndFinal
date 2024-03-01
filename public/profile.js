document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/user-info');
        if (response.ok) {
            const userData = await response.json();
            const profileInfo = document.getElementById('profileInfo');
            profileInfo.innerHTML = `
                <p><strong>Name:</strong> ${userData.username}</p>
                <p><strong>Email:</strong> ${userData.email}</p>
                                <p><strong>Note:</strong> ${userData.note}</p>

            `;
        } else {
            console.error('Failed to fetch user information');
        }
    } catch (error) {
        console.error('Error fetching user information:', error);
    }

    const profileForm = document.getElementById('profileForm');
    const actionButtons = document.querySelectorAll('[name="action"]');
    actionButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const action = button.value;
            const formData = new FormData(profileForm);
            const body = {
                action: action
            };

            if (action === 'changeName') {
                body.name = formData.get('name');
            } else if (action === 'changeEmail') {
                body.email = formData.get('email');
            } else if (action === 'changePassword') {
                body.password = formData.get('password');
            } else if (action === 'changeNote') {
                body.note = formData.get('note'); // Include the note data
            }

            const response = await fetch('/update-profile', {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                alert('Profile updated successfully');
            } else {
                alert('Failed to update profile');
            }
        });
    });
});

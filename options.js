function saveContacts(contacts) {
    chrome.storage.local.set({ savedContacts: contacts });
}

function loadContacts(callback) {
    chrome.storage.local.get('savedContacts', function (result) {
        const contacts = result.savedContacts || [];
        callback(contacts);
    });
}

function saveTemplates(templates) {
    chrome.storage.local.set({ savedTemplates: templates });
}

function loadTemplates(callback) {
    chrome.storage.local.get('savedTemplates', function (result) {
        const templates = result.savedTemplates || [];
        callback(templates);
    });
}

let savedContacts;
let savedTemplates;

function initialize() {
    loadContacts(function (contacts) {
        savedContacts = contacts;
        renderContacts();
    });

    loadTemplates(function (templates) {
        savedTemplates = templates;
        renderTemplates();
    });
}

function renderContacts() {
    const contactsList = document.getElementById('contactsList');
    contactsList.innerHTML = '';
    savedContacts.forEach(contact => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <div>
                <img src="${contact.image || 'https://via.placeholder.com/40'}" alt="Avatar">
                <span>${contact.name || contact.email}</span>
            </div>
            <div>
                <button class="edit-button" data-email="${contact.email}">Edit</button>
                <button class="delete-button" data-email="${contact.email}">Delete</button>
            </div>
        `;
        contactsList.appendChild(listItem);
    });

    // Add event listeners for edit and delete buttons
    const editButtons = document.querySelectorAll('.edit-button');
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            editContact(button.getAttribute('data-email'));
        });
    });

    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            deleteContact(button.getAttribute('data-email'));
        });
    });
}

function renderTemplates() {
    const templatesList = document.getElementById('templatesList');
    templatesList.innerHTML = '';
    savedTemplates.forEach(template => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span>${template.name}</span>
            <div>
                <button class="edit-template-button" data-name="${template.name}">Edit</button>
                <button class="delete-template-button" data-name="${template.name}">Delete</button>
            </div>
        `;
        templatesList.appendChild(listItem);
    });

    // Add event listeners for edit and delete buttons
    const editTemplateButtons = document.querySelectorAll('.edit-template-button');
    editTemplateButtons.forEach(button => {
        button.addEventListener('click', () => {
            editTemplate(button.getAttribute('data-name'));
        });
    });

    const deleteTemplateButtons = document.querySelectorAll('.delete-template-button');
    deleteTemplateButtons.forEach(button => {
        button.addEventListener('click', () => {
            deleteTemplate(button.getAttribute('data-name'));
        });
    });
}

function editContact(email) {
    const contact = savedContacts.find(contact => contact.email === email);
    if (!contact) return;

    document.getElementById('contactEmail').value = contact.email;
    document.getElementById('contactName').value = contact.name || '';
    document.getElementById('contactImageUrl').value = '';
    document.getElementById('editContactModal').style.display = 'flex';
}

document.getElementById('saveContact').addEventListener('click', () => {
    const email = document.getElementById('contactEmail').value;
    const name = document.getElementById('contactName').value;
    const imageUpload = document.getElementById('contactImageUpload').files[0];
    const imageUrl = document.getElementById('contactImageUrl').value;

    let image = '';

    if (imageUpload) {
        const reader = new FileReader();
        reader.onload = function (e) {
            image = e.target.result;
            updateContact(email, name, image);
        };
        reader.readAsDataURL(imageUpload);
    } else {
        image = imageUrl;
        updateContact(email, name, image);
    }

    document.getElementById('editContactModal').style.display = 'none';
});

const updateContact = (email, name, image) => {
    const contactIndex = savedContacts.findIndex(contact => contact.email === email);
    if (contactIndex > -1) {
        savedContacts[contactIndex].name = name;
        savedContacts[contactIndex].image = image;
    } else {
        savedContacts.push({ email, name, image });
    }
    saveContacts(savedContacts);
    renderContacts();
};

function deleteContact(email) {
    savedContacts = savedContacts.filter(contact => contact.email !== email);
    saveContacts(savedContacts);
    renderContacts();
}

function editTemplate(name) {
    const template = savedTemplates.find(template => template.name === name);
    if (!template) return;

    document.getElementById('templateName').value = template.name;
    document.getElementById('templateText').value = template.text;
    document.getElementById('editTemplateModal').style.display = 'flex';
}

document.getElementById('saveTemplate').addEventListener('click', () => {
    const name = document.getElementById('templateName').value;
    const text = document.getElementById('templateText').value;

    const templateIndex = savedTemplates.findIndex(template => template.name === name);
    if (templateIndex > -1) {
        savedTemplates[templateIndex].text = text;
    } else {
        savedTemplates.push({ name, text });
    }
    saveTemplates(savedTemplates);
    renderTemplates();
    document.getElementById('editTemplateModal').style.display = 'none';
});

function deleteTemplate(name) {
    savedTemplates = savedTemplates.filter(template => template.name !== name);
    saveTemplates(savedTemplates);
    renderTemplates();
}

// Event listeners for opening modals
document.getElementById('addContactButton').addEventListener('click', () => {
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactName').value = '';
    document.getElementById('contactImageUrl').value = '';
    document.getElementById('editContactModal').style.display = 'flex';
});

document.getElementById('addTemplateButton').addEventListener('click', () => {
    document.getElementById('templateName').value = '';
    document.getElementById('templateText').value = '';
    document.getElementById('editTemplateModal').style.display = 'flex';
});

// Modal functionality
const contactModal = document.getElementById('editContactModal');
const templateModal = document.getElementById('editTemplateModal');
const closeContactModal = contactModal ? contactModal.getElementsByClassName('close')[0] : null;
const closeTemplateModal = templateModal ? templateModal.getElementsByClassName('close')[0] : null;

if (closeContactModal) {
    closeContactModal.onclick = function () {
        contactModal.style.display = 'none';
    };
}

if (closeTemplateModal) {
    closeTemplateModal.onclick = function () {
        templateModal.style.display = 'none';
    };
}

window.onclick = function (event) {
    if (event.target == contactModal) {
        contactModal.style.display = 'none';
    }
    if (event.target == templateModal) {
        templateModal.style.display = 'none';
    }
}

initialize();
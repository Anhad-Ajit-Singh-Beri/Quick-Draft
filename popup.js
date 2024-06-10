//Function to load contacts from local storage
function loadContacts(callback) {
  chrome.storage.local.get('savedContacts', function(result) {
      const contacts = result.savedContacts || [];
      callback(contacts);
  });
}

// Function to load templates from local storage
function loadTemplates(callback) {
  chrome.storage.local.get('savedTemplates', function(result) {
      const templates = result.savedTemplates || [];
      callback(templates);
  });
}

// Initialize savedContacts and savedTemplates from local storage
let savedContacts = [];
let savedTemplates = [];

loadContacts(function(contacts) {
  savedContacts = contacts;
});

loadTemplates(function(templates) {
  savedTemplates = templates;
});

// Function to handle composing email
const constructAndOpenEmail = (recipient, subject, body) => {
  const link = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(recipient) + '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  chrome.tabs.create({ url: link });
};

// Function to update custom dropdown
const updateDropdown = (input) => {
  const dropdown = document.getElementById('dropdown');
  dropdown.innerHTML = '';
  if (input) {
      const filteredContacts = savedContacts.filter(contact => (contact.email.toLowerCase().includes(input.toLowerCase()) || (contact.name && contact.name.toLowerCase().includes(input.toLowerCase()))));
      filteredContacts.forEach(contact => {
          const item = document.createElement('div'); 
          item.innerHTML = `
              <div class='dropdown-item'>
                  <div class='dropdown-item-img'>
                    <img src="${contact.image || 'https://via.placeholder.com/40'}" alt="Avatar">
                  </div>
                  <br>
                  <span>${contact.name || contact.email}</span>
              </div>
          `;
          item.addEventListener('click', (e) => {
              if (e.target.classList.contains('edit-button')) return;
              document.getElementById('recipient').value = contact.email;
              dropdown.style.display = 'none';
          });
          dropdown.appendChild(item);
      });
      dropdown.style.display = 'block';
  } else {
      dropdown.style.display = 'none';
  }
};

// Function to update Template dropdown
const updateTemplateDropdown = (input) => {
  const dropdown = document.getElementById('templateDropdown');
  dropdown.innerHTML = '';
  if (input) {
      const filteredTemplates = savedTemplates.filter(template => (template.name.toLowerCase().includes(input.toLowerCase()) || (template.name && template.name.toLowerCase().includes(input.toLowerCase()))));
      filteredTemplates.forEach(template => {
          const item = document.createElement('div');
          item.innerHTML = `
              <div class="dropdown-item">
                  <span>${template.name}</span>
              </div>
          `;
          item.addEventListener('click', (e) => {
              if (e.target.classList.contains('edit-button')) return;
              document.getElementById('body').value = template.text;
              dropdown.style.display = 'none';
          });
          dropdown.appendChild(item);
      });
      dropdown.style.display = 'block';
  } else {
      dropdown.style.display = 'none';
  }
};


// Function to handle editing contact
const editContact = (email) => {
  const contact = savedContacts.find(contact => contact.email === email);
  if (!contact) return;

  document.getElementById('contactEmail').value = contact.email;
  document.getElementById('editModal').style.display = 'flex';
};

// Event listener for input field
document.getElementById('recipient').addEventListener('input', (e) => {
  updateDropdown(e.target.value);
});

document.getElementById('body').addEventListener('input', (e) => {
  updateTemplateDropdown(e.target.value);
});

// Event listener for composing email
document.getElementById('composeEmail').addEventListener('click', () => {
  const recipient = document.getElementById('recipient').value;
  const subject = document.getElementById('subject') ? document.getElementById('subject').value : '';
  const body = document.getElementById('body') ? document.getElementById('body').value : '';

  constructAndOpenEmail(recipient, subject, body);

  if (!savedContacts.find(contact => contact.email === recipient)) {
      savedContacts.push({ email: recipient, image: '' });
      chrome.storage.local.set({ savedContacts });
  }
});

// Modal functionality
const modal = document.getElementById('editModal');
const closeModal = document.getElementsByClassName('close')[0];


window.onclick = function(event) {
  if (event.target == modal) {
      modal.style.display = 'none';
  }
}

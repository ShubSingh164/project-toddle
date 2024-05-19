// script.js
document.addEventListener('DOMContentLoaded', () => {
    const moduleForm = document.getElementById('module-form');
    const resourceForm = document.getElementById('resource-form');
    const linkForm = document.getElementById('link-form');
    const moduleList = document.getElementById('module-list');
    const resourceList = document.getElementById('resource-list');
    const linkList = document.getElementById('link-list');

    let modules = [];
    let resources = [];
    let links = [];

    moduleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const moduleName = document.getElementById('module-name').value.trim();
        if (moduleName) {
            const newModule = { id: Date.now(), name: moduleName };
            modules.push(newModule);
            renderModules();
            document.getElementById('module-name').value = '';
        }
    });

    resourceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const resourceName = document.getElementById('resource-name').value.trim();
        if (resourceName) {
            const newResource = { id: Date.now(), name: resourceName };
            resources.push(newResource);
            renderResources();
            document.getElementById('resource-name').value = '';
        }
    });

    linkForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const linkName = document.getElementById('link-name').value.trim();
        const linkUrl = document.getElementById('link-url').value.trim();
        if (linkName && linkUrl) {
            const newLink = { id: Date.now(), name: linkName, url: linkUrl };
            links.push(newLink);
            renderLinks();
            document.getElementById('link-name').value = '';
            document.getElementById('link-url').value = '';
        }
    });

    function renderModules() {
        moduleList.innerHTML = '<h2>Modules</h2>';
        modules.forEach((module, index) => {
            const moduleItem = createDraggableItem(module, 'module-item', index, modules, renderModules);
            moduleList.appendChild(moduleItem);
        });
        addDropzones(moduleList);
    }

    function renderResources() {
        resourceList.innerHTML = '<h2>Resources</h2>';
        resources.forEach((resource, index) => {
            const resourceItem = createDraggableItem(resource, 'resource-item', index, resources, renderResources);
            resourceList.appendChild(resourceItem);
        });
        addDropzones(resourceList);
    }

    function renderLinks() {
        linkList.innerHTML = '<h2>Links</h2>';
        links.forEach((link, index) => {
            const linkItem = createDraggableItem(link, 'link-item', index, links, renderLinks);
            linkItem.innerHTML = `<a href="${link.url}" target="_blank">${link.name}</a>` + linkItem.innerHTML;
            linkList.appendChild(linkItem);
        });
        addDropzones(linkList);
    }

    function createDraggableItem(item, className, index, list, renderFunction) {
        const itemElement = document.createElement('div');
        itemElement.className = className;
        itemElement.draggable = true;
        if (className !== 'link-item') {
            itemElement.textContent = item.name;
        }

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = '✖';
        deleteButton.addEventListener('click', () => {
            list.splice(index, 1);
            renderFunction();
        });

        itemElement.dataset.index = index;
        itemElement.appendChild(deleteButton);

        itemElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', itemElement.dataset.index);
            itemElement.classList.add('dragging');
        });

        itemElement.addEventListener('dragend', () => {
            itemElement.classList.remove('dragging');
        });

        return itemElement;
    }

    function addDropzones(container) {
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);
    }

    function handleDragOver(e) {
        e.preventDefault();
        const draggingElement = document.querySelector('.dragging');
        const afterElement = getDragAfterElement(this, e.clientY);
        if (afterElement == null) {
            this.appendChild(draggingElement);
        } else {
            this.insertBefore(draggingElement, afterElement);
        }
    }

    function handleDrop(e) {
        const draggingElement = document.querySelector('.dragging');
        const oldIndex = draggingElement.dataset.index;
        const newIndex = getDragAfterElementIndex(this, e.clientY);

        const listType = draggingElement.classList.contains('module-item') ? 'modules' : draggingElement.classList.contains('resource-item') ? 'resources' : 'links';
        const list = listType === 'modules' ? modules : listType === 'resources' ? resources : links;
        
        if (oldIndex !== newIndex) {
            const item = list.splice(oldIndex, 1)[0];
            list.splice(newIndex, 0, item);
            if (listType === 'modules') renderModules();
            else if (listType === 'resources') renderResources();
            else renderLinks();
        }
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.module-item:not(.dragging), .resource-item:not(.dragging), .link-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function getDragAfterElementIndex(container, y) {
        const elements = [...container.children].filter(child => child !== document.querySelector('.dragging'));
        const afterElement = getDragAfterElement(container, y);
        if (afterElement == null) {
            return elements.length;
        } else {
            return elements.indexOf(afterElement);
        }
    }
});

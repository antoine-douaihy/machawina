let currentLang = 'en';
let menuRows = []; // Starts empty, will be filled by the SQLite database!

const container = document.getElementById('menu-container');
const langToggleBtn = document.getElementById('lang-toggle');

// 1. Fetch the JSON data from your new Node.js Server
fetch('http://localhost:3000/api/menu')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // 2. Save the data and build the menu
        menuRows = data;
        renderFullMenu();
    })
    .catch(error => {
        console.error('Error loading menu from database:', error);
        container.innerHTML = `<h3 style="color: red; text-align: center; padding: 40px;">Error loading menu data. Make sure your Node.js server is running!</h3>`;
    });


// --- RENDER FUNCTIONS ---

function renderRegularItem(item, parentDiv) {
    const div = document.createElement('div');
    div.className = 'menu-item';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'item-name';
    nameSpan.textContent = currentLang === 'en' ? item.name_en : item.name_ar;

    const dotSpan = document.createElement('span');
    dotSpan.className = 'item-dots';

    const priceSpan = document.createElement('span');
    priceSpan.className = 'item-price';
    priceSpan.textContent = item.price.includes('/') ? `$${item.price}` : `$${item.price}`;

    div.appendChild(nameSpan);
    div.appendChild(dotSpan);
    div.appendChild(priceSpan);
    parentDiv.appendChild(div);
}

function renderColumnedItem(item, parentDiv) {
    const div = document.createElement('div');
    div.className = 'item-with-cols';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'item-name';
    nameSpan.textContent = currentLang === 'en' ? item.name_en : item.name_ar;

    const dotSpan = document.createElement('span');
    dotSpan.className = 'item-dots';

    const pricesDiv = document.createElement('div');
    pricesDiv.className = 'prices';

    const glassSpan = document.createElement('span');
    glassSpan.className = 'item-price';
    glassSpan.textContent = `$${item.price.gls}`;

    const bottleSpan = document.createElement('span');
    bottleSpan.className = 'item-price';
    bottleSpan.textContent = `$${item.price.btl}`;

    pricesDiv.appendChild(glassSpan);
    pricesDiv.appendChild(bottleSpan);

    div.appendChild(nameSpan);
    div.appendChild(dotSpan);
    div.appendChild(pricesDiv);
    parentDiv.appendChild(div);
}

function renderCategoryItems(items, parentDiv, showColsFlag) {
    items.forEach(item => {
        if (showColsFlag && typeof item.price === 'object') {
            renderColumnedItem(item, parentDiv);
        } else {
            renderRegularItem(item, parentDiv);
        }
    });
}

function renderColumnBlocks(blocks, colDiv) {
    blocks.forEach(block => {
        // Render Logo
        if (block.type === 'logo') {
            const img = document.createElement('img');
            img.src = block.src;
            img.className = 'main-logo';
            img.alt = 'Machawina';
            colDiv.appendChild(img);
            return;
        }

        const catDiv = document.createElement('div');
        catDiv.className = 'category-block';

        const title = document.createElement('h2');
        title.className = 'main-category-title';
        title.innerHTML = `<span>${currentLang === 'en' ? block.title_en : block.title_ar}</span>`;
        catDiv.appendChild(title);

        // Render Delivery Banner
        if (block.banner_en) {
            const bannerDiv = document.createElement('div');
            bannerDiv.className = 'delivery-banner';
            bannerDiv.textContent = currentLang === 'en' ? block.banner_en : block.banner_ar;
            catDiv.appendChild(bannerDiv);
        }

        // Render Alcohol Columns (GLS/BTL)
        if (block.showCols) {
            const headerRow = document.createElement('div');
            headerRow.className = 'col-header-row';
            headerRow.innerHTML = `<span class="header-text">${currentLang === 'en' ? '' : ''}</span><span class="price-col">${currentLang === 'en' ? 'GLS' : 'GLS'}</span><span class="price-col">${currentLang === 'en' ? 'BTL' : 'BTL'}</span>`;
            catDiv.appendChild(headerRow);
        }

        // Render Subcategories or Items
        if (block.subcategories) {
            block.subcategories.forEach(sub => {
                const subTitle = document.createElement('h3');
                subTitle.className = 'sub-category-title';
                subTitle.innerHTML = `<span>${currentLang === 'en' ? sub.title_en : sub.title_ar}</span>`;
                catDiv.appendChild(subTitle);
                renderCategoryItems(sub.items, catDiv, block.showCols);
            });
        } else {
            renderCategoryItems(block.items, catDiv, block.showCols);
        }

        colDiv.appendChild(catDiv);
    });
}

function renderFullMenu() {
    container.innerHTML = '';

    menuRows.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'menu-row';

        const leftCol = document.createElement('div');
        leftCol.className = 'column left-column';
        renderColumnBlocks(row.left, leftCol);

        const rightCol = document.createElement('div');
        rightCol.className = 'column right-column';
        renderColumnBlocks(row.right, rightCol);

        rowDiv.appendChild(leftCol);
        rowDiv.appendChild(rightCol);
        container.appendChild(rowDiv);
    });
}

langToggleBtn.addEventListener('click', () => {
    if (currentLang === 'en') {
        currentLang = 'ar';
        langToggleBtn.textContent = 'English';
        document.body.classList.add('rtl');
    } else {
        currentLang = 'en';
        langToggleBtn.textContent = 'عربي';
        document.body.classList.remove('rtl');
    }
    renderFullMenu();
});
import './styles.css';
import { Book } from './task1-types';
import { applyFilters, filterByAuthor, filterByMinYear } from './task3-filters';
import { createBookFromForm } from './task4-integration';
import { filterByTitle, sortBooks } from './task5-utils';
// TODO 3.0: импорт класса
import { BookCatalog } from './task6-classes';
import { BookClass } from './task6-book-class';
import { Wishlist } from './task7-wishlist';

// TODO 3.1: экземпляр класса вместо объекта-словаря.
// ВАЖНО: порядок аргументов конструктора — (id, books),
// как указано в спецификации класса в task6-classes.ts.
let catalog = new BookCatalog('main', [
  { id: '1', title: 'TypeScript Guide', authors: ['John Doe'], year: 2024 },
  { id: '2', title: 'JavaScript Basics', authors: ['Jane Smith'], year: 2022 },
]);

// Восстановление из localStorage.
// TODO 3.2: JSON.parse возвращает «плоский» объект без методов,
// поэтому воссоздаём экземпляр класса через new BookCatalog(...).
// Порядок аргументов тоже (id, books) — как в конструкторе.
const saved = localStorage.getItem('catalog');
if (saved) {
  const parsed = JSON.parse(saved) as { id: string; books: Book[] };
  catalog = new BookCatalog(parsed.id ?? 'main', parsed.books ?? []);
}

// Создание экземпляра Wishlist и восстановление из localStorage
const savedWishlist = localStorage.getItem('wishlist');
const initialFavIds = savedWishlist ? (JSON.parse(savedWishlist) as string[]) : [];
const wishlist = new Wishlist(initialFavIds);

// Сохранение в localStorage.
// Кладём только данные (id + массив книг), а не сам экземпляр,
// чтобы не тащить в хранилище методы класса.
function saveCatalog() {
  localStorage.setItem(
    'catalog',
    JSON.stringify({ id: catalog.id, books: catalog.getBooks() })
  );
}

function saveWishlist() {
  localStorage.setItem('wishlist', JSON.stringify(wishlist.getIds()));
}

// DOM-элементы
const bookList = document.querySelector('#bookList') as HTMLDivElement;
const wishlistContainer = document.querySelector('#wishlistContainer') as HTMLDivElement;
const form = document.querySelector('#bookForm') as HTMLFormElement;
const filterBtn = document.querySelector('#applyFilters') as HTMLButtonElement;
const authorInput = document.querySelector('#filterAuthor') as HTMLInputElement;
const yearInput = document.querySelector('#filterYear') as HTMLInputElement;
const errorMessage = document.querySelector('#errorMessage') as HTMLDivElement;
const searchInput = document.querySelector('#searchInput') as HTMLInputElement;
const sortBySelect = document.querySelector('#sortBy') as HTMLSelectElement;

// Вынесенная функция создания карточки (Задание 3)
function createBookCard(book: Book): HTMLDivElement {
  const card = document.createElement('div');
  card.className = 'book-card';

  const titleEl = document.createElement('h3');
  titleEl.textContent = `${book.title} — ${book.authors.join(', ')}${
    book.year ? `, ${book.year}` : ''
  }`;
  card.append(titleEl);

  if (book.rating !== undefined) {
    const ratingEl = document.createElement('p');
    ratingEl.textContent = `Рейтинг: ${book.rating}`;
    card.append(ratingEl);
  }

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Удалить';
  deleteBtn.addEventListener('click', () => {
    // TODO 3.3: метод класса вместо свободной функции removeBook
    catalog.removeBook(book.id);
    saveCatalog();
    // TODO 3.4: getBooks() вместо Object.values(catalog)
    renderBooks(catalog.getBooks());
    // Если удалили книгу — она должна исчезнуть и из избранного
    renderWishlist();
  });
  card.append(deleteBtn);

  // Кнопка "Избранное"
  const favBtn = document.createElement('button');
  favBtn.textContent = wishlist.has(book.id) ? '❤️ В избранном' : '🤍 В избранное';
  favBtn.addEventListener('click', () => {
    wishlist.toggle(book.id);
    saveWishlist();
    // Перерисовываем основной список (чтобы обновить текст кнопок)
    renderBooks(catalog.getBooks());
    // Перерисовываем блок избранного
    renderWishlist();
  });
  card.append(favBtn);

  return card;
}

// Отрисовка
function renderBooks(books: Book[]) {
  bookList.innerHTML = '';

  if (books.length === 0) {
    bookList.textContent = 'Книги не найдены. Попробуйте изменить фильтры.';
    return;
  }

  books.forEach((book) => {
    bookList.append(createBookCard(book));
  });
}

function renderWishlist() {
  wishlistContainer.innerHTML = '';
  const favBooks = wishlist.getFavorites(catalog);

  if (favBooks.length === 0) {
    wishlistContainer.textContent = 'Пока ничего не добавлено';
    return;
  }

  favBooks.forEach((book) => {
    wishlistContainer.append(createBookCard(book));
  });
}

renderBooks(catalog.getBooks());
renderWishlist(); // Добавлена отрисовка избранного при загрузке

form.addEventListener('submit', (e) => {
  e.preventDefault();
  errorMessage.textContent = '';

  try {
    const formData = new FormData(form);
    const newBookInstance = BookClass.createFromFormData(formData);

    // TODO 3.5: метод класса вместо свободной функции addBook
    catalog.addBook(newBookInstance);
    
    saveCatalog();
    form.reset();
    renderBooks(catalog.getBooks());
    renderWishlist();
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.textContent = error.message;
    }
  }
});

function refreshList() {
  const filters: ((book: Book) => boolean)[] = [];

  if (authorInput.value.trim()) filters.push(filterByAuthor(authorInput.value.trim()));
  if (yearInput.value) filters.push(filterByMinYear(parseInt(yearInput.value, 10)));
  if (searchInput.value.trim()) filters.push(filterByTitle(searchInput.value.trim()));

  const allBooks = catalog.getBooks();
  const filteredBooks = applyFilters(allBooks, filters);

  renderBooks(sortBooks(filteredBooks, sortBySelect.value as 'year' | 'rating'));
}

filterBtn.addEventListener('click', refreshList);
searchInput.addEventListener('input', refreshList);
sortBySelect.addEventListener('change', refreshList);
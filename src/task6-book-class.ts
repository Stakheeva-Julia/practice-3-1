import { Book } from "./task1-types";
import { formatBook } from "./task1-types";
import { createBookFromForm } from "./task4-integration";

export class BookClass {
    readonly id: string;
    title: string;
    authors: string[];
    year?: number;
    rating?: number;

    constructor(
    id: string,
    title: string,
    authors: string[],
    year?: number,
    rating?: number
    ) {
    this.id = id;
    this.title = title;
    this.authors = authors;
    this.year = year;
    this.rating = rating;
    }

    format(): string {
    // Преобразуем this в объект, совместимый с интерфейсом Book,
    // и передаём в готовую функцию formatBook.
    return formatBook({
        id: this.id,
        title: this.title,
        authors: this.authors,
        year: this.year,
        rating: this.rating,
    });
    }
    static createFromFormData(formData: FormData): BookClass {
    const book: Book = createBookFromForm(formData);
    return new BookClass(
        book.id,
        book.title,
        book.authors,
        book.year,
        book.rating
    );
    }
}
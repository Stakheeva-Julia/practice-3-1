import { Book } from "./task1-types";
import { BookCatalog } from "./task6-classes";
я
export class Wishlist {
  private favoriteIds: string[];

  constructor(favoriteIds: string[] = []) {
    this.favoriteIds = [...favoriteIds];
  }

  toggle(id: string): void {
    if (this.favoriteIds.includes(id)) {
      this.favoriteIds = this.favoriteIds.filter((favId) => favId !== id);
    } else {
      this.favoriteIds = [...this.favoriteIds, id];
    }
  }

  has(id: string): boolean {
    return this.favoriteIds.includes(id);
  }

  get count(): number {
    return this.favoriteIds.length;
  }

  getFavorites(catalog: BookCatalog): Book[] {
    return catalog.getBooks().filter((book) => this.favoriteIds.includes(book.id));
  }

  getIds(): string[] {
    return [...this.favoriteIds];
  }
}
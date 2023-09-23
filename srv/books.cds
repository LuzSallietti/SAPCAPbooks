using {sap.capire.booksluz as my} from '../db/schema';

service BooksService {
    
    entity Books as projection on my.Books;
    entity Authors as projection on my.Authors;
    entity Genres as projection on my.Genres;
    entity AuditBooks as projection on my.AuditBooks;

    function getStock(id: Books:ID) returns Integer;
    function getStockBelowLimit(limit: Books:stock) returns array of Books;
    
    action addStock(quantity: Integer, bookId: Integer) returns String;
    action updateStock(quantity: Integer, bookId: Integer) returns String;
    action createBook(ID:Integer, title: String, descr: String, author_ID: Integer, genre_ID: Integer, stock: Integer, price: Decimal) returns String;

    //Transaction
    action createBookTx(ID:Integer, title: String, descr: String, author_ID: Integer, genre_ID: Integer, stock: Integer, price: Decimal) returns String;
    
}
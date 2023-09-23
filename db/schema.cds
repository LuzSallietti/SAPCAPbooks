using {
    managed,
    sap
} from '@sap/cds/common';

namespace sap.capire.booksluz;

entity Books : managed {
    key ID     : Integer;
        title  : localized String(111);
        descr  : localized String(1111);
        author : Association to Authors;
        genre  : Association to Genres;
        stock  : Integer;
        price  : Decimal(9, 2);

}

entity Authors : managed {
    key ID    : Integer;
        name  : String(111);
        books : Association to many Books
                    on books.author = $self;
}

entity Genres {
    key ID   : Integer;
        name : String(40);
}

entity AuditBooks : managed {
    key auditID : Integer;
        ID      : Integer;
        title   : localized String(111);
        descr   : localized String(1111);
        author  : Association to Authors;
        genre   : Association to Genres;
        stock   : Integer;
        price   : Decimal(9, 2);

}

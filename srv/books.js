const cds = require("@sap/cds");



module.exports = cds.service.impl(async function () {
  const db = await cds.connect.to('db');
  const { Books, AuditBooks } = db.entities;

  this.before("UPDATE", "Books", (req) => {
    console.log(req.headers.cookie);

    const { stock } = req.data;
    if (stock < 0) req.error`${{ stock }} must be >= ${0}`;
  });

  //function --> get stock

  this.on('getStock', async (req) => {
    console.log(req.data.id)
    const id = req.data.id;
    //Solo recupero el campo stock
    const stock = await SELECT.columns('stock').from(Books).where({ ID: id });
    return stock;

  })

  //function --> get stock below a limit 

  this.on('getStockBelowLimit', async (req) => {
    const limit = req.data.limit;
    const results = await SELECT.columns('ID', 'title', 'author', 'stock').from(Books).where({ stock: { '<=': limit } })
    return results;
  })

  //action --> add stock
  this.on('addStock', async (req) => {
    const { quantity, bookId } = req.data;
    const updated = await UPDATE(Books, bookId)
      .with({ stock: { '+=': quantity } })
      .where({ ID: bookId })
    console.log(updated)
    return "Me ejecuté";

  })

  //action --> update stock / validate stock

  this.on('updateStock', async (req) => {
    const { quantity, bookId } = req.data;
    const checkStock = await SELECT.columns("stock").from(Books).where({ ID: bookId });
    console.log(checkStock);
    const [{ stock }] = checkStock;
    console.log(stock);

    if (quantity === 0) {
      throw new Error("Cantidad no puede ser 0");
    }

    if (quantity > 0 && stock >= 0) {
      const newStock = stock + quantity;

      const updated = await UPDATE(Books, bookId)
        .with({ stock: newStock })
        .where({ ID: bookId })
      console.log(updated)
      return "Sumé stock";

    } else if (quantity < 0 && ((stock - (- quantity)) > 0)) {
      const newStock = stock - (-quantity); //NO ME FUNCIONA la inclusión del operador en la sintaxis como en la suma
      console.log(newStock);
      const updated = await UPDATE(Books, bookId)
        .with({ stock: newStock })
        .where({ ID: bookId })
      //console.log(updated)--> da 1(true) como en sql
      return "Resté stock";

    } else {
      throw new Error("El stock no puede ser negativo")
    }
  }
  )
  //action --> create a copy of the created book on another table
  this.on('createBook', async (req) => {
    const newBook = [{
      "ID": req.data.id,
      "title": req.data.title,
      "descr": req.data.descr,
      "author_ID": req.data.author_ID,
      "genre_ID": req.data.genre_ID,
      "stock": req.data.stock,
      "price": req.data.price
    }]

    try {

      const createdBook = await INSERT(newBook).into(Books);
      console.log(createdBook);
      if (createdBook) {
        const log = await INSERT(newBook).into(AuditBooks);
        if (log) {
          return "Libro registrado!"
        }
      }
    } catch (error) {
      throw new Error("Hubo un error en el registro")
    }

  })

  //action --> the same but with transaction

  this.on('createBookTx', async (req) => {
    const newBook = {
      "ID": req.data.id,
      "title": req.data.title,
      "descr": req.data.descr,
      "author_ID": req.data.author_ID,
      "genre_ID": req.data.genre_ID,
      "stock": req.data.stock,
      "price": req.data.price
    };

    try {
      await cds.transaction(async (tx) => {
        const createdBook = await tx.insert(newBook).into(Books);
        console.log(createdBook);

        if (createdBook) {
          //InsertResult { results: [ { changes: 1, lastInsertRowid: 9 } ] }
          const lastInsertID = createdBook.results[0].lastInsertRowid;
          console.log(lastInsertID);
          const created = await SELECT.from(Books).where({ID: lastInsertID})
          const log = await tx.insert(created).into(AuditBooks);
          console.log(log);
        }
      });
      // Mensaje de éxito 
      return "Libro registrado!";
    } catch (error) {
      console.error(error);
      throw new Error("Hubo un error en el registro");
    }
  });
});






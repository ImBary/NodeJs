const express = require('express');
const app = express();

// Ustawienie EJS jako silnika szablonów
app.set('view engine', 'ejs');
app.set('view cache', true);

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

let cart = []

const products = [{name: 'product', cena:12}, {name: 'product2', cena:42},{name: 'product3', cena:32}];

app.get('/', function(req, res) {
    res.render('pages/home', { title: 'Strona Główna', body: 'Witaj w naszej aplikacji!' });
});

app.get('/cart', function(req, res) {
  res.render('pages/cart',{cart: cart})
});

app.post('/cart', (req, res) => {
  const { nazwa, cena, action } = req.body;
  const item = { nazwa, cena };  // Simplified object creation

  if (action === 'back') {
      res.redirect('/products');
  } else if (action === "delete") {
      const index = cart.findIndex(product => product.nazwa === item.nazwa);
      if (index !== -1) {
          cart.splice(index, 1);
          console.log("deleted: " + item.nazwa);
          if (req.headers['content-type'] === 'application/json') {
              res.json({ success: true, message: 'Product deleted' });
          } else {
              res.redirect('/cart');
          }
      }
  }
});

app.get('/products', (req, res) => {
    
    res.render('pages/productList', { products: products });
});
app.post('/products', (req, res) => {
  const { nazwa, cena, action,userPrice,typeOfSortUser } = req.body;
  const item = { nazwa:nazwa, cena:cena };
  if(action === 'add'){
    cart.push(item);
    console.log("added: "+item.nazwa);
  }else if(action === 'end'){
    res.redirect('/cart')
  }else if(action === 'filtr' || action === 'sort'){
    let processedProducts = products;
    if (userPrice) {
      processedProducts = processedProducts.filter(product => product.cena <= userPrice);
    }
    if (typeOfSortUser === 'Cena rosnąco') {
      processedProducts.sort((a, b) => a.cena - b.cena);
    } else if (typeOfSortUser === 'Cena malejąco') {
      processedProducts.sort((a, b) => b.cena - a.cena);
    }
    res.render('pages/productList', { products: processedProducts });
  }
});



app.get('/submit-user', (req, res) => {
    res.render('pages/submit-form', {title: "Formualarz"})
})

app.post('/submit-user', (req, res) => {
    console.log(req.body);
    const { name, email } = req.body;
    // Tutaj można dodać logikę do przetwarzania danych, np. zapis do bazy danych
    res.send(`Dane zarejestrowane: ${name}, ${email}`);
});


app.listen(3000,() => console.log("Server is running"));
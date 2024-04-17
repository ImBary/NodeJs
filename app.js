const express = require('express');
const app = express();

// Ustawienie EJS jako silnika szablonów
app.set('view engine', 'ejs');
app.set('view cache', true);

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const cart = []

app.get('/', function(req, res) {
    res.render('pages/home', { title: 'Strona Główna', body: 'Witaj w naszej aplikacji!' });
});

app.get('/cart', function(req, res) {
  res.render('pages/cart',{cart: cart})
});


app.get('/products', (req, res) => {
    const products = [{name: 'product', cena:12}, {name: 'product2', cena:42}];
    res.render('pages/productList', { products: products });
});
app.post('/products', (req, res) => {
  const { nazwa, cena } = req.body;
  const item = { nazwa:nazwa, cena:cena };
  cart.push(item);
  console.log(item);
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
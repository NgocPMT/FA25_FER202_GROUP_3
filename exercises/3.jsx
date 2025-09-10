const arr = [10, 20, 30];

const [first, second, _] = arr;

const student = { name: "An", age: 20, major: "IT" };

const { name, age } = student;

const book = { title: "Harry Potter", author: "J.K Rowling", year: "1997" };

const runBook = ({ title, author, year }) => {
  console.log(title, author, year);
};

const App = () => {
  console.log(first, second);
  console.log(name, age);
  runBook(book);
};

export default App;

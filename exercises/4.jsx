let greet = (name = "Khách") => {
    console.log(`Xin chào, ${name}`);
};

let multiply = (a, b = 2) => a * b;

let calculateArea = (width, height = width) => width * height;

const App = () => {

    greet();
    greet("An");

    console.log(multiply(3));
    console.log(multiply(3, 4));

    console.log(calculateArea(5));
    console.log(calculateArea(5, 10));
}


export default App;

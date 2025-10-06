import React from "react";
import { Container } from "react-bootstrap";
import { BsBook } from "react-icons/bs";

const UsernameInputPage = () => {
  return (
        <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100">
            <h1>Easium</h1>
              <BsBook/>
            <h2>Welcome to Easium!</h2>
            <p>We need a little more information to finish creating your account.</p>
            <form>
                <p>Your full name</p>
                <input type="text" placeholder="Enter your full name" /> 
            </form>
            <p>Your email is</p>
        </Container>
    );
};

export default UsernameInputPage;

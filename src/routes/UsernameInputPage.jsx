import React from "react";
import { Container, Form, Button } from "react-bootstrap";
import { BsBook } from "react-icons/bs";
import 'bootstrap/dist/css/bootstrap.min.css';

// Style css
const inputStyle = {
  border: "none",
  borderBottom: "1px solid #d3d3d3",
  borderRadius: 0,
  boxShadow: "none",
};

const formWidthStyle = {
  width: "35%",
};

const buttonWidthStyle = {
  width: "150px",
};

const labelTextStyle = {
  color: "gray",
  fontSize: "14px"
};

const UsernameInputPage = () => {
  return (
    <Container className="d-flex flex-column align-items-center min-vh-100">
      <h1 className="mt-3 mb-5">Easium</h1>
      <BsBook size={100} className="mt-3 mb-3" />
      <h2 className="my-3 font-lora">Welcome to Easium!</h2> 
      <p className="my-3">We need a little more information to finish creating your account.</p>

      <p style={labelTextStyle} className="mt-3">Your full name</p>
      <Form style={formWidthStyle} className="mb-3"> 
        <Form.Control
          type="text"
          style={inputStyle}
        />
      </Form>
    
      <p className="my-3">Your email is</p>
      <Button 
        variant="dark" 
        className="mt-3 py-2 rounded-pill"
        style={buttonWidthStyle} 
      >
        Create account
      </Button>
    </Container>
  );
};

export default UsernameInputPage;
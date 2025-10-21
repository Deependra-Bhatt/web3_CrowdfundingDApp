// crowdfunding-app-prototype\src\components\layout\Form\Components\FormLeft.js

import styled from "styled-components";
import { FormState } from "../Form";
import { useContext } from "react";

const FormLeft = () => {
  const Handler = useContext(FormState);

  return (
    <FormLeftWrapper>
      <FormInput>
        <label>Campaign Title</label>
        <Input
          onChange={Handler.FormHandler}
          value={Handler.form.campaignTitle}
          placeholder="Campaign Title"
          name="campaignTitle"
        ></Input>
      </FormInput>
      <FormInput>
        <label>Description</label>
        <TextArea
          onChange={Handler.FormHandler}
          value={Handler.form.description}
          placeholder="Description"
          name="description"
        ></TextArea>
      </FormInput>
    </FormLeftWrapper>
  );
};

const FormLeftWrapper = styled.div`
  width: 48%;
`;

const FormInput = styled.div`
  display: flex;
  flex-direction: column;
  font-family: "poppins";
  margin-top: 10px;
`;

const Input = styled.input`
  padding: 15px;
  background-color: ${(props) => props.theme.bgDiv};
  color: ${(props) => props.theme.color};
  margin-top: 4px;
  border: none;
  border-radius: 8px;
  outline: none;
  font-size: large;
  width: 100%;
`;

const TextArea = styled.textarea`
  padding: 15px;
  background-color: ${(props) => props.theme.bgDiv};
  color: ${(props) => props.theme.color};
  margin-top: 4px;
  border: none;
  border-radius: 8px;
  outline: none;
  font-size: large;
  max-width: 100%;
  min-width: 100%;
  overflow-x: hidden;
`;

export default FormLeft;

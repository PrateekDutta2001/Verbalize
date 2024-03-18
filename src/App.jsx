import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Button,
  Alert,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

import Header from "./Components/Header";

import { BsFillMicFill, BsFillMicMuteFill } from "react-icons/bs";
import { FaCopy } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { AiOutlineDownload } from "react-icons/ai"; // Added import for download icon

import { message } from "antd";

import { CopyToClipboard } from "react-copy-to-clipboard";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = new SpeechRecognition();

mic.continuous = true;
mic.interimResults = true;
mic.lang = "en-EN";

function App() {
  // const apiKey = process.env.REACT_APP_KEY;
  // console.log(apiKey);
  const [isListening, setIsListening] = useState(false);
  const [note, setNote] = useState("");
  const [text, setText] = useState("");
  const [savedNotes, setSavedNotes] = useState([]);
  const [copied, setCopied] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [translated, setTranslated] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);
  window.addEventListener("beforeunload", function () {
    localStorage.clear(); // Clear local storage
  });
  useEffect(() => {
    handleListen();
    // Initialize localStorage items as empty strings
    // localStorage.removeItem("savedNotes");
    localStorage.clear();
  }, [isListening]);
  //Handel Translations
  useEffect(() => {
    // console.log(selectedLanguage);
    const translate = async () => {
      setLoading(true);
      const encodedParams = new URLSearchParams();
      const text = await localStorage.getItem("text");

      if (selectedLanguage === "Hindi") {
        encodedParams.set("source_language", "en");
        encodedParams.set("target_language", "hi");
        encodedParams.set("text", text);
      }
      if (selectedLanguage === "Marathi") {
        encodedParams.set("source_language", "en");
        encodedParams.set("target_language", "mr");
        encodedParams.set("text", text);
      }
      if (selectedLanguage === "Bengali") {
        encodedParams.set("source_language", "en");
        encodedParams.set("target_language", "bn");
        encodedParams.set("text", text);
      }

      const options = {
        method: "POST",
        url: process.env.REACT_APP_URL,
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "X-RapidAPI-Key": process.env.REACT_APP_KEY,
          "X-RapidAPI-Host": process.env.REACT_APP_HOST,
        },
        data: encodedParams,
      };

      try {
        console.log(process.env.REACT_APP_HOST + "/translate");
        const response = await axios.request(options);
        // console.log(response.data.data);
        response && setLoading(false);
        setTranslated(response.data.data.translatedText);
      } catch (error) {
        console.error(error.response);
      }
    };
    if (localStorage.getItem("text")) {
      if (selectedLanguage === "English") {
        setTranslated(localStorage.getItem("text"));
        return;
      } else {
        translate();
      }
    }
  }, [selectedLanguage]);

  const handleListen = () => {
    if (isListening) {
      mic.start();
      mic.onend = () => {
        mic.start();
      };
    } else {
      mic.stop();
      mic.onend = () => {
        message.info("Mic is off");
      };
    }

    mic.onstart = () => {
      message.success("Mic is on");
    };

    mic.onresult = (event) => {
      // Result is an array of all the words spoken
      const transcript = Array.from(event.results)
        // Map through the array and return the transcript
        .map((result) => result[0])
        .map((result) => result.transcript)
        // Join the array into a string
        .join("");
      // Set the note to the transcript
      setNote(transcript);
      mic.onerror = (event) => {
        message.error(event.error);
      };
    };
  };

  const handleSave = (e) => {
    // Push the note to the savedNotes array
    setSavedNotes([...savedNotes, note]);
    // localStorage.setItem('savedNotes', ([...savedNotes, note]));
    localStorage.setItem("savedNotes", note);

    localStorage.setItem("text", text);

    // Clear the note
    setNote("");

    // Clear the text
    setText("");

    // Stop the mic
    setIsListening(false);

    // Show a success message
    message.success("Note saved");
  };

  const handleCopy = () => {
    message.success("Copied to clipboard");
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const translateText = (text, language) => {
    // Implement translation logic here
    // For demonstration purposes, simply return the text without translation
    return text;
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob(
      [
        translateText(
          localStorage.getItem("savedNotes") || localStorage.getItem("text"),
          selectedLanguage
        ),
      ],
      { type: "text/plain" }
    );
    element.href = URL.createObjectURL(file);
    element.download = "saved_notes.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  return (
    <>
      <Header />

      <Container className="mt-5">
        <Row>
          <Col md={6}>
            <Card className="bg-light h-100 border-0">
              <CardBody>
                <CardTitle>
                  <h3>Current Note</h3>
                </CardTitle>
                <hr />
                {isListening ? (
                  <div className="d-flex justify-content-center mx-auto">
                    <BsFillMicFill className="fs-4 me-2 text-danger" />
                    <h5 className="text-danger">Listening...</h5>
                  </div>
                ) : (
                  <Alert
                    className="d-flex justify-content-center mx-auto text-center"
                    color="primary"
                  >
                    <BsFillMicMuteFill className="fs-4" />
                    <h5>Press 'Start' Button to Record</h5>
                  </Alert>
                )}

                <h4 className="text-center my-3">OR</h4>

                <Input
                  type="textarea"
                  className="text-field w-100 mb-3"
                  rows={5}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write your note..."
                ></Input>

                <div className="d-flex justify-content-end me-auto gap-2">
                  <Button
                    onClick={() => setIsListening((prevState) => !prevState)}
                    outline
                    color={isListening ? "warning" : "success"}
                  >
                    {isListening ? "Stop" : "Start"}
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={note || text ? false : true}
                    color="dark"
                  >
                    Save Note
                  </Button>
                </div>
                <hr />
                <CardText>
                  <h5>Recent Record</h5>
                  <p>{translateText(note || text, selectedLanguage)}</p>
                </CardText>
              </CardBody>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="bg-light h-100 border-0 right-card">
              <CardBody>
                <CardTitle>
                  <h3>Saved Notes</h3>
                </CardTitle>
                <Dropdown
                  isOpen={dropdownOpen}
                  toggle={toggleDropdown}
                  className="mb-3"
                >
                  <DropdownToggle caret>
                    Language: {selectedLanguage}
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem
                      onClick={() => setSelectedLanguage("English")}
                    >
                      English (By Fefault)
                    </DropdownItem>
                    <DropdownItem onClick={() => setSelectedLanguage("Hindi")}>
                      Hindi
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => setSelectedLanguage("Bengali")}
                    >
                      Bengali
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => setSelectedLanguage("Marathi")}
                    >
                      Marathi
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <hr />
                <CardText>
                  <h5>Saved Text</h5>
                  {
                    <div className="saved-note">
                      <p>
                        {translateText(
                          localStorage.getItem("savedNotes") ||
                            localStorage.getItem("text"),
                          selectedLanguage
                        )}{" "}
                      </p>
                    </div>
                  }
                </CardText>
                <CardText>
                  <h5>Translated Text</h5>
                  {
                    <div className="saved-note">
                      {loading ? <p>Loading...</p> : <p>{translated}</p>}
                    </div>
                  }
                </CardText>
                <div className="d-flex justify-content-between align-items-center">
                  <CopyToClipboard
                    text={translateText(
                      localStorage.getItem("savedNotes") ||
                        localStorage.getItem("text"),
                      selectedLanguage
                    )}
                  >
                    <Button
                      onClick={handleCopy}
                      disabled={
                        localStorage.getItem("savedNotes") ||
                        localStorage.getItem("text")
                          ? false
                          : true
                      }
                      className="fs-5"
                      id="copy"
                      color={copied ? "success" : "warning"}
                    >
                      {copied ? (
                        <TiTick className="icon" />
                      ) : (
                        <FaCopy className="icon" />
                      )}
                    </Button>
                  </CopyToClipboard>
                  <Button
                    onClick={handleDownload}
                    disabled={
                      !localStorage.getItem("savedNotes") &&
                      !localStorage.getItem("text")
                    }
                    className="fs-5"
                    id="download"
                    color="primary"
                  >
                    <AiOutlineDownload className="icon" /> Download
                  </Button>
                </div>
                {/* <CardText>
                  <h5>Saved Text</h5>
                  {
                    <div className="saved-note">
                      {loading ? (
                        <p>Save Note to Translate...</p>
                      ) : (
                        <p>{translated}</p>
                      )}
                    </div>
                  }
                </CardText> */}
                {/* <h1></h1> */}
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row className="mt-5">
          <Col>
            <Alert color="info">
              Disclaimer: This product is designed for everyday tasks and
              ensures user privacy by not collecting or storing any personal
              information or data. Users can input text or speech in English and
              optionally translate the results into their preferred language.
            </Alert>
            <Button
              color="primary"
              onClick={() =>
                (window.location.href = "https://forms.gle/pjvffkagjanExLsdA")
              }
            >
              Give Feedback
            </Button>
          </Col>
        </Row>
      </Container>
    </>
  );
}
export default App;
